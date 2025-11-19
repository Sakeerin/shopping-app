'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

// ============================================================================
// T150: UPDATE ORDER STATUS ACTION (Phase 7 - User Story 6)
// ============================================================================

interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Helper to get user session
async function getUserSession() {
  const session = await getServerSession();
  return session?.user;
}

// Helper to check admin authorization
async function requireAdmin() {
  const user = await getUserSession();
  if (!user || user.role !== 'ADMIN') {
    return { authorized: false, user: null };
  }
  return { authorized: true, user };
}

// Valid order statuses
const orderStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]);

type OrderStatus = z.infer<typeof orderStatusSchema>;

// ============================================================================
// T150: UPDATE ORDER STATUS
// ============================================================================

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Validate status
    const validatedStatus = orderStatusSchema.parse(status);

    // Check order exists
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: 'Order not found' };
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: validatedStatus },
    });

    // Send notification emails for SHIPPED and DELIVERED statuses
    if (validatedStatus === 'SHIPPED' || validatedStatus === 'DELIVERED') {
      const emailSubject =
        validatedStatus === 'SHIPPED'
          ? `Your order has been shipped - Order #${existing.orderNumber}`
          : `Your order has been delivered - Order #${existing.orderNumber}`;

      const emailBody =
        validatedStatus === 'SHIPPED'
          ? `Good news! Your order #${existing.orderNumber} has been shipped and is on its way to you.`
          : `Your order #${existing.orderNumber} has been delivered. We hope you enjoy your purchase!`;

      try {
        await sendEmail({
          to: existing.user.email,
          subject: emailSubject,
          html: `
            <h1>${emailSubject}</h1>
            <p>Hi ${existing.user.name || 'Customer'},</p>
            <p>${emailBody}</p>
            <p>Order Total: $${existing.total.toFixed(2)}</p>
            <p>Thank you for shopping with us!</p>
          `,
        });
      } catch (emailError) {
        // Log email error but don't fail the status update
        console.error('Failed to send order notification email:', emailError);
      }
    }

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/account/orders');

    return {
      success: true,
      data: order,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid order status' };
    }
    return { success: false, error: error.message || 'Failed to update order status' };
  }
}
