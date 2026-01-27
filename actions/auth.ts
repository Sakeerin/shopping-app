'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { registerSchema, resetPasswordSchema, newPasswordSchema } from '@/lib/validations';
import { sendWelcomeEmail, sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';
import { authRateLimit, passwordResetRateLimit, getClientIdentifier, checkRateLimit } from '@/lib/rate-limit';

// ============================================================================
// AUTH SERVER ACTIONS (with T199: Rate Limiting)
// ============================================================================

type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ============================================================================
// USER REGISTRATION
// ============================================================================

export async function registerUser(formData: FormData): Promise<ActionResult> {
  try {
    // T199: Rate limiting check
    const headersList = await headers();
    const identifier = getClientIdentifier(headersList);
    const rateLimitResult = await checkRateLimit(authRateLimit, identifier);

    if (!rateLimitResult.success) {
      return {
        success: false,
        error: `Too many registration attempts. Please try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 60000)} minutes.`,
      };
    }

    // Parse and validate form data
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const validated = registerSchema.parse(data);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        password: hashedPassword,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Send welcome email
    try {
      await sendWelcomeEmail({
        name: user.name,
        email: user.email,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    revalidatePath('/');

    return {
      success: true,
      data: { user },
    };
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.name === 'ZodError') {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }

    return {
      success: false,
      error: 'An error occurred during registration. Please try again.',
    };
  }
}

// ============================================================================
// PASSWORD RESET REQUEST
// ============================================================================

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  try {
    // T199: Rate limiting check for password reset
    const headersList = await headers();
    const identifier = getClientIdentifier(headersList);
    const rateLimitResult = await checkRateLimit(passwordResetRateLimit, identifier);

    if (!rateLimitResult.success) {
      return {
        success: false,
        error: `Too many password reset attempts. Please try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 60000)} minutes.`,
      };
    }

    const data = {
      email: formData.get('email') as string,
    };

    const validated = resetPasswordSchema.parse(data);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        data: {
          message:
            'If an account with that email exists, you will receive a password reset link shortly.',
        },
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry,
      },
    });

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Send password reset email
    try {
      await sendPasswordResetEmail({
        email: user.email,
        resetToken,
        resetUrl,
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return {
        success: false,
        error: 'Failed to send password reset email. Please try again later.',
      };
    }

    return {
      success: true,
      data: {
        message:
          'If an account with that email exists, you will receive a password reset link shortly.',
      },
    };
  } catch (error: any) {
    console.error('Password reset request error:', error);

    if (error.name === 'ZodError') {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }

    return {
      success: false,
      error: 'An error occurred. Please try again.',
    };
  }
}

// ============================================================================
// PASSWORD RESET (WITH TOKEN)
// ============================================================================

export async function resetPassword(
  token: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const data = {
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const validated = newPasswordSchema.parse(data);

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid or expired reset token',
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return {
      success: true,
      data: {
        message: 'Password has been reset successfully. You can now sign in with your new password.',
      },
    };
  } catch (error: any) {
    console.error('Password reset error:', error);

    if (error.name === 'ZodError') {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }

    return {
      success: false,
      error: 'An error occurred while resetting your password. Please try again.',
    };
  }
}
