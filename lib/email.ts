import { Resend } from 'resend';

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
  return await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Welcome to Shopping App!',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for creating an account with Shopping App.</p>
      <p>Start shopping now and enjoy exclusive deals!</p>
    `,
  });
}

interface OrderConfirmationEmailProps {
  email: string;
  orderNumber: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export async function sendOrderConfirmationEmail({
  email,
  orderNumber,
  totalAmount,
  items,
}: OrderConfirmationEmailProps) {
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
  return await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h1>Reset Your Password</h1>
      <p>You requested to reset your password. Click the link below to create a new password:</p>
      <p><a href="${resetUrl}?token=${resetToken}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
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
