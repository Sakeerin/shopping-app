import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerUser } from '@/actions/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// ============================================================================
// AUTH ACTIONS UNIT TESTS
// ============================================================================

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs');

vi.mock('@/lib/email', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Auth Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'CUSTOMER',
        createdAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);

      const formData = new FormData();
      formData.append('name', 'John Doe');
      formData.append('email', 'john@example.com');
      formData.append('password', 'SecurePass123!');
      formData.append('confirmPassword', 'SecurePass123!');

      const result = await registerUser(formData);

      expect(result.success).toBe(true);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 10);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should reject registration with existing email', async () => {
      const existingUser = {
        id: 'user1',
        email: 'john@example.com',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as any);

      const formData = new FormData();
      formData.append('name', 'John Doe');
      formData.append('email', 'john@example.com');
      formData.append('password', 'SecurePass123!');
      formData.append('confirmPassword', 'SecurePass123!');

      const result = await registerUser(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should reject registration with mismatched passwords', async () => {
      const formData = new FormData();
      formData.append('name', 'John Doe');
      formData.append('email', 'john@example.com');
      formData.append('password', 'SecurePass123!');
      formData.append('confirmPassword', 'DifferentPass123!');

      const result = await registerUser(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('do not match');
    });

    it('should reject registration with invalid email', async () => {
      const formData = new FormData();
      formData.append('name', 'John Doe');
      formData.append('email', 'invalid-email');
      formData.append('password', 'SecurePass123!');
      formData.append('confirmPassword', 'SecurePass123!');

      const result = await registerUser(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject registration with weak password', async () => {
      const formData = new FormData();
      formData.append('name', 'John Doe');
      formData.append('email', 'john@example.com');
      formData.append('password', '123');
      formData.append('confirmPassword', '123');

      const result = await registerUser(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
