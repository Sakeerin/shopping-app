import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateOrderStatus } from '@/actions/orders';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// ============================================================================
// T140: ORDER ACTIONS UNIT TESTS (Phase 7 - User Story 6)
// ============================================================================

vi.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock email sending
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(),
}));

describe('Order Actions - Admin', () => {
  const mockAdminSession = {
    user: {
      id: 'admin1',
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  };

  const mockUserSession = {
    user: {
      id: 'user1',
      email: 'user@example.com',
      role: 'CUSTOMER',
    },
  };

  const mockOrder = {
    id: 'order1',
    userId: 'user1',
    status: 'PROCESSING',
    total: 99.99,
    user: {
      email: 'customer@example.com',
      name: 'John Doe',
    },
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateOrderStatus', () => {
    it('should update order status as admin', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...mockOrder,
        status: 'SHIPPED',
      } as any);

      const result = await updateOrderStatus('order1', 'SHIPPED');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('SHIPPED');
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order1' },
        data: { status: 'SHIPPED' },
      });
    });

    it('should reject update for non-admin users', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);

      const result = await updateOrderStatus('order1', 'SHIPPED');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('should reject update for unauthenticated users', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await updateOrderStatus('order1', 'SHIPPED');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should handle non-existent order', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      const result = await updateOrderStatus('nonexistent', 'SHIPPED');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should validate order status values', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);

      const result = await updateOrderStatus('order1', 'INVALID_STATUS' as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept valid status: PENDING', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...mockOrder,
        status: 'PENDING',
      } as any);

      const result = await updateOrderStatus('order1', 'PENDING');

      expect(result.success).toBe(true);
    });

    it('should accept valid status: PROCESSING', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
      } as any);

      const result = await updateOrderStatus('order1', 'PROCESSING');

      expect(result.success).toBe(true);
    });

    it('should accept valid status: SHIPPED', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...mockOrder,
        status: 'SHIPPED',
      } as any);

      const result = await updateOrderStatus('order1', 'SHIPPED');

      expect(result.success).toBe(true);
    });

    it('should accept valid status: DELIVERED', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...mockOrder,
        status: 'DELIVERED',
      } as any);

      const result = await updateOrderStatus('order1', 'DELIVERED');

      expect(result.success).toBe(true);
    });

    it('should accept valid status: CANCELLED', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...mockOrder,
        status: 'CANCELLED',
      } as any);

      const result = await updateOrderStatus('order1', 'CANCELLED');

      expect(result.success).toBe(true);
    });

    it('should send notification email when status changes to SHIPPED', async () => {
      const { sendEmail } = await import('@/lib/email');

      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...mockOrder,
        status: 'SHIPPED',
      } as any);

      await updateOrderStatus('order1', 'SHIPPED');

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: expect.stringContaining('shipped'),
        })
      );
    });

    it('should send notification email when status changes to DELIVERED', async () => {
      const { sendEmail } = await import('@/lib/email');

      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...mockOrder,
        status: 'DELIVERED',
      } as any);

      await updateOrderStatus('order1', 'DELIVERED');

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: expect.stringContaining('delivered'),
        })
      );
    });
  });
});
