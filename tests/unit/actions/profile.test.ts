import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/actions/profile';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';

// ============================================================================
// PROFILE ACTIONS UNIT TESTS (T085)
// ============================================================================

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    address: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs');

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Profile Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateProfile', () => {
    const mockSession = {
      user: {
        email: 'user@example.com',
      },
    };

    const mockUser = {
      id: 'user1',
      name: 'John Doe',
      email: 'user@example.com',
      password: 'hashedPassword',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully update user name', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockUser,
        name: 'Jane Doe',
      } as any);

      const formData = new FormData();
      formData.append('name', 'Jane Doe');

      const result = await updateProfile(formData);

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { name: 'Jane Doe' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          updatedAt: true,
        },
      });
    });

    it('should successfully update user email', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as any) // First call: get current user
        .mockResolvedValueOnce(null); // Second call: check if new email exists

      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockUser,
        email: 'newemail@example.com',
      } as any);

      const formData = new FormData();
      formData.append('email', 'newemail@example.com');

      const result = await updateProfile(formData);

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { email: 'newemail@example.com' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          updatedAt: true,
        },
      });
    });

    it('should reject email update if email already in use', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as any) // First call: get current user
        .mockResolvedValueOnce({ id: 'user2', email: 'existing@example.com' } as any); // Email exists

      const formData = new FormData();
      formData.append('email', 'existing@example.com');

      const result = await updateProfile(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already in use');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should successfully update password with valid current password', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue('newHashedPassword' as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

      const formData = new FormData();
      formData.append('currentPassword', 'OldPass123!');
      formData.append('newPassword', 'NewPass123!');

      const result = await updateProfile(formData);

      expect(result.success).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('OldPass123!', 'hashedPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPass123!', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { password: 'newHashedPassword' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          updatedAt: true,
        },
      });
    });

    it('should reject password update with incorrect current password', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const formData = new FormData();
      formData.append('currentPassword', 'WrongPass123!');
      formData.append('newPassword', 'NewPass123!');

      const result = await updateProfile(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Current password is incorrect');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should reject password update without current password', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const formData = new FormData();
      formData.append('newPassword', 'NewPass123!');

      const result = await updateProfile(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Current password is required');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should reject password change for OAuth accounts', async () => {
      const oauthUser = { ...mockUser, password: null };
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(oauthUser as any);

      const formData = new FormData();
      formData.append('currentPassword', 'OldPass123!');
      formData.append('newPassword', 'NewPass123!');

      const result = await updateProfile(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot change password for OAuth accounts');
    });

    it('should reject update when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('name', 'Jane Doe');

      const result = await updateProfile(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should reject update when user not found', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('name', 'Jane Doe');

      const result = await updateProfile(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should update multiple fields at once', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as any)
        .mockResolvedValueOnce(null); // Email check
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue('newHashedPassword' as never);
      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockUser,
        name: 'Jane Doe',
        email: 'jane@example.com',
      } as any);

      const formData = new FormData();
      formData.append('name', 'Jane Doe');
      formData.append('email', 'jane@example.com');
      formData.append('currentPassword', 'OldPass123!');
      formData.append('newPassword', 'NewPass123!');

      const result = await updateProfile(formData);

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'newHashedPassword',
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('addAddress', () => {
    const mockSession = {
      user: {
        email: 'user@example.com',
      },
    };

    const mockUser = {
      id: 'user1',
      email: 'user@example.com',
    };

    const mockAddress = {
      id: 'addr1',
      userId: 'user1',
      fullName: 'John Doe',
      street: '123 Main St',
      street2: null,
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      phone: '555-1234',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully add a new address', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.address.create).mockResolvedValue(mockAddress as any);

      const formData = new FormData();
      formData.append('fullName', 'John Doe');
      formData.append('street', '123 Main St');
      formData.append('city', 'New York');
      formData.append('state', 'NY');
      formData.append('postalCode', '10001');
      formData.append('country', 'United States');
      formData.append('phone', '555-1234');
      formData.append('isDefault', 'false');

      const result = await addAddress(formData);

      expect(result.success).toBe(true);
      expect(prisma.address.create).toHaveBeenCalled();
    });

    it('should set new address as default and unset others', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.address.updateMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.address.create).mockResolvedValue({
        ...mockAddress,
        isDefault: true,
      } as any);

      const formData = new FormData();
      formData.append('fullName', 'John Doe');
      formData.append('street', '123 Main St');
      formData.append('city', 'New York');
      formData.append('state', 'NY');
      formData.append('postalCode', '10001');
      formData.append('country', 'United States');
      formData.append('phone', '555-1234');
      formData.append('isDefault', 'true');

      const result = await addAddress(formData);

      expect(result.success).toBe(true);
      expect(prisma.address.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    });

    it('should reject when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('fullName', 'John Doe');

      const result = await addAddress(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });
  });

  describe('deleteAddress', () => {
    const mockSession = {
      user: {
        email: 'user@example.com',
      },
    };

    const mockUser = {
      id: 'user1',
      email: 'user@example.com',
    };

    const mockAddress = {
      id: 'addr1',
      userId: 'user1',
      isDefault: false,
    };

    it('should successfully delete an address', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.address.findFirst).mockResolvedValue(mockAddress as any);
      vi.mocked(prisma.address.delete).mockResolvedValue(mockAddress as any);

      const result = await deleteAddress('addr1');

      expect(result.success).toBe(true);
      expect(prisma.address.delete).toHaveBeenCalledWith({
        where: { id: 'addr1' },
      });
    });

    it('should set another address as default when deleting default address', async () => {
      const defaultAddress = { ...mockAddress, isDefault: true };
      const nextAddress = { id: 'addr2', userId: 'user1', isDefault: false };

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.address.findFirst)
        .mockResolvedValueOnce(defaultAddress as any) // Find address to delete
        .mockResolvedValueOnce(nextAddress as any); // Find next address
      vi.mocked(prisma.address.delete).mockResolvedValue(defaultAddress as any);
      vi.mocked(prisma.address.update).mockResolvedValue(nextAddress as any);

      const result = await deleteAddress('addr1');

      expect(result.success).toBe(true);
      expect(prisma.address.update).toHaveBeenCalledWith({
        where: { id: 'addr2' },
        data: { isDefault: true },
      });
    });

    it('should reject when address not found', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.address.findFirst).mockResolvedValue(null);

      const result = await deleteAddress('addr1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Address not found');
    });
  });

  describe('setDefaultAddress', () => {
    const mockSession = {
      user: {
        email: 'user@example.com',
      },
    };

    const mockUser = {
      id: 'user1',
      email: 'user@example.com',
    };

    const mockAddress = {
      id: 'addr1',
      userId: 'user1',
      isDefault: false,
    };

    it('should successfully set address as default', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.address.findFirst).mockResolvedValue(mockAddress as any);
      vi.mocked(prisma.address.updateMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.address.update).mockResolvedValue({
        ...mockAddress,
        isDefault: true,
      } as any);

      const result = await setDefaultAddress('addr1');

      expect(result.success).toBe(true);
      expect(prisma.address.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
      expect(prisma.address.update).toHaveBeenCalledWith({
        where: { id: 'addr1' },
        data: { isDefault: true },
      });
    });

    it('should reject when address not found', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.address.findFirst).mockResolvedValue(null);

      const result = await setDefaultAddress('addr1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Address not found');
    });
  });
});
