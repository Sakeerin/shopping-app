import { Resend } from 'resend';
import { render } from '@react-email/render';
import OrderConfirmationEmail, {
  type OrderConfirmationEmailProps,
} from '@/emails/order-confirmation';
import WelcomeEmail from '@/emails/welcome';
import PasswordResetEmail from '@/emails/password-reset';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = process.env.EMAIL_FROM || 'noreply@shoppingapp.com';

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

interface WelcomeEmailProps {
  name: string;
  email: string;
}

export async function sendWelcomeEmail({ name, email }: WelcomeEmailProps) {
  try {
    // Render the React Email template to HTML
    const emailHtml = await render(WelcomeEmail({ name }));

    // Send the email using Resend
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to ShopApp!',
      html: emailHtml,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// ORDER CONFIRMATION EMAIL (Using React Email Template)
// ============================================================================

interface SendOrderConfirmationParams {
  email: string;
  customerName: string;
  orderData: OrderConfirmationEmailProps;
}

export async function sendOrderConfirmation({
  email,
  customerName,
  orderData,
}: SendOrderConfirmationParams) {
  try {
    // Render the React Email template to HTML
    const emailHtml = render(OrderConfirmationEmail(orderData));

    // Send the email using Resend
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      html: emailHtml,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error: error.message };
  }
}

// Legacy function for backward compatibility (deprecated - use sendOrderConfirmation instead)
interface LegacyOrderConfirmationEmailProps {
  email: string;
  orderNumber: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

/**
 * @deprecated Use sendOrderConfirmation with the React Email template instead
 */
export async function sendOrderConfirmationEmail({
  email,
  orderNumber,
  totalAmount,
  items,
}: LegacyOrderConfirmationEmailProps) {
  const itemsHtml = items
    .map(
      (item) =>
        `<li>${item.name} - Qty: ${item.quantity} - $${item.price.toFixed(2)}</li>`
    )
    .join('');

  return await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <h2>Order Items:</h2>
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
      <p>You will receive a shipping confirmation email once your order has been dispatched.</p>
    `,
  });
}

interface ShippingNotificationEmailProps {
  email: string;
  orderNumber: string;
  trackingNumber: string;
}

export async function sendShippingNotificationEmail({
  email,
  orderNumber,
  trackingNumber,
}: ShippingNotificationEmailProps) {
  return await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: `Your Order Has Shipped - ${orderNumber}`,
    html: `
      <h1>Your Order Has Shipped!</h1>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p>Track your package to see when it will arrive.</p>
    `,
  });
}

interface PasswordResetEmailProps {
  email: string;
  resetToken: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  email,
  resetToken,
  resetUrl,
}: PasswordResetEmailProps) {
  try {
    // Render the React Email template to HTML
    const emailHtml = await render(PasswordResetEmail({ resetUrl }));

    // Send the email using Resend
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset Your ShopApp Password',
      html: emailHtml,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
}

interface OrderCancelledEmailProps {
  email: string;
  orderNumber: string;
}

export async function sendOrderCancelledEmail({
  email,
  orderNumber,
}: OrderCancelledEmailProps) {
  return await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: `Order Cancelled - ${orderNumber}`,
    html: `
      <h1>Order Cancelled</h1>
      <p>Your order ${orderNumber} has been cancelled.</p>
      <p>If you have any questions, please contact our support team.</p>
    `,
  });
}

interface OrderRefundedEmailProps {
  email: string;
  orderNumber: string;
  refundAmount: number;
}

export async function sendOrderRefundedEmail({
  email,
  orderNumber,
  refundAmount,
}: OrderRefundedEmailProps) {
  return await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: `Order Refunded - ${orderNumber}`,
    html: `
      <h1>Order Refunded</h1>
      <p>Your order ${orderNumber} has been refunded.</p>
      <p><strong>Refund Amount:</strong> $${refundAmount.toFixed(2)}</p>
      <p>The refund will be processed within 5-7 business days.</p>
    `,
  });
}
