'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ============================================================================
// PROFILE SERVER ACTIONS
// ============================================================================

// Type for Server Action results
type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ============================================================================
// UPDATE PROFILE (T092)
// ============================================================================

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
});

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' };
    }

    // Parse and validate form data
    const data = {
      name: formData.get('name') as string | undefined,
      email: formData.get('email') as string | undefined,
      currentPassword: formData.get('currentPassword') as string | undefined,
      newPassword: formData.get('newPassword') as string | undefined,
    };

    const validated = updateProfileSchema.parse(data);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // If changing password, verify current password
    if (validated.newPassword) {
      if (!validated.currentPassword) {
        return {
          success: false,
          error: 'Current password is required to set a new password',
        };
      }

      if (!user.password) {
        return {
          success: false,
          error: 'Cannot change password for OAuth accounts',
        };
      }

      const passwordMatch = await bcrypt.compare(
        validated.currentPassword,
        user.password
      );

      if (!passwordMatch) {
        return { success: false, error: 'Current password is incorrect' };
      }
    }

    // If changing email, check if new email is already in use
    if (validated.email && validated.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validated.email.toLowerCase() },
      });

      if (existingUser) {
        return { success: false, error: 'Email address is already in use' };
      }
    }

    // Build update data
    const updateData: any = {};

    if (validated.name) {
      updateData.name = validated.name;
    }

    if (validated.email) {
      updateData.email = validated.email.toLowerCase();
    }

    if (validated.newPassword) {
      updateData.password = await bcrypt.hash(validated.newPassword, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true,
      },
    });

    revalidatePath('/profile');

    return {
      success: true,
      data: { user: updatedUser, message: 'Profile updated successfully' },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

// ============================================================================
// ADD ADDRESS (T093)
// ============================================================================

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  street: z.string().min(5, 'Street address is required').max(200),
  street2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State/Province is required').max(100),
  postalCode: z.string().min(3, 'Postal code is required').max(20),
  country: z.string().min(2, 'Country is required').max(100),
  phone: z.string().min(10, 'Valid phone number is required').max(20),
  isDefault: z.boolean().optional(),
});

export async function addAddress(formData: FormData): Promise<ActionResult> {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Parse and validate form data
    const data = {
      fullName: formData.get('fullName') as string,
      street: formData.get('street') as string,
      street2: formData.get('street2') as string | undefined,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string,
      phone: formData.get('phone') as string,
      isDefault: formData.get('isDefault') === 'true',
    };

    const validated = addressSchema.parse(data);

    // If this is set as default, unset other default addresses
    if (validated.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: validated.fullName,
        street: validated.street,
        street2: validated.street2 || null,
        city: validated.city,
        state: validated.state,
        postalCode: validated.postalCode,
        country: validated.country,
        phone: validated.phone,
        isDefault: validated.isDefault || false,
      },
    });

    revalidatePath('/profile/addresses');

    return {
      success: true,
      data: { address, message: 'Address added successfully' },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Add address error:', error);
    return { success: false, error: 'Failed to add address' };
  }
}

// ============================================================================
// UPDATE ADDRESS (T094)
// ============================================================================

export async function updateAddress(
  addressId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return { success: false, error: 'Address not found' };
    }

    // Parse and validate form data
    const data = {
      fullName: formData.get('fullName') as string,
      street: formData.get('street') as string,
      street2: formData.get('street2') as string | undefined,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string,
      phone: formData.get('phone') as string,
      isDefault: formData.get('isDefault') === 'true',
    };

    const validated = addressSchema.parse(data);

    // If this is set as default, unset other default addresses
    if (validated.isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
          NOT: {
            id: addressId,
          },
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update address
    const address = await prisma.address.update({
      where: { id: addressId },
      data: {
        fullName: validated.fullName,
        street: validated.street,
        street2: validated.street2 || null,
        city: validated.city,
        state: validated.state,
        postalCode: validated.postalCode,
        country: validated.country,
        phone: validated.phone,
        isDefault: validated.isDefault,
      },
    });

    revalidatePath('/profile/addresses');

    return {
      success: true,
      data: { address, message: 'Address updated successfully' },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Update address error:', error);
    return { success: false, error: 'Failed to update address' };
  }
}

// ============================================================================
// DELETE ADDRESS (T095)
// ============================================================================

export async function deleteAddress(addressId: string): Promise<ActionResult> {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!address) {
      return { success: false, error: 'Address not found' };
    }

    // Delete address
    await prisma.address.delete({
      where: { id: addressId },
    });

    // If this was the default address, set another one as default
    if (address.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: user.id },
      });

      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath('/profile/addresses');

    return {
      success: true,
      data: { message: 'Address deleted successfully' },
    };
  } catch (error: any) {
    console.error('Delete address error:', error);
    return { success: false, error: 'Failed to delete address' };
  }
}

// ============================================================================
// SET DEFAULT ADDRESS (T096)
// ============================================================================

export async function setDefaultAddress(addressId: string): Promise<ActionResult> {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!address) {
      return { success: false, error: 'Address not found' };
    }

    // Unset all default addresses for this user
    await prisma.address.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Set this address as default
    await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    revalidatePath('/profile/addresses');

    return {
      success: true,
      data: { message: 'Default address updated successfully' },
    };
  } catch (error: any) {
    console.error('Set default address error:', error);
    return { success: false, error: 'Failed to set default address' };
  }
}
