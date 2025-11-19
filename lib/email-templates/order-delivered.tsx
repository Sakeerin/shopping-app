// ============================================================================
// T169: ORDER DELIVERED EMAIL TEMPLATE (Phase 7 - User Story 6)
// ============================================================================

interface OrderDeliveredEmailProps {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export function renderOrderDeliveredEmail(
  props: OrderDeliveredEmailProps
): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    deliveryDate,
    items,
    subtotal,
    tax,
    shippingCost,
    total,
    shippingAddress,
  } = props;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Been Delivered</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: #ffffff;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .celebration-banner {
      background-color: #d4edda;
      border-left: 4px solid #28a745;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
      text-align: center;
    }
    .celebration-banner h2 {
      margin: 0 0 10px 0;
      color: #155724;
      font-size: 20px;
    }
    .celebration-banner p {
      margin: 0;
      color: #155724;
    }
    .order-info {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .order-info h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #28a745;
    }
    .order-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .items-table th {
      background-color: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
      font-size: 14px;
    }
    .totals {
      margin: 20px 0;
      text-align: right;
    }
    .totals .row {
      display: flex;
      justify-content: flex-end;
      padding: 8px 0;
      font-size: 14px;
    }
    .totals .label {
      margin-right: 20px;
      color: #666;
    }
    .totals .total-row {
      border-top: 2px solid #dee2e6;
      padding-top: 12px;
      margin-top: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .shipping-address {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .shipping-address h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
    }
    .cta-buttons {
      text-align: center;
      margin: 30px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #28a745;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px;
    }
    .cta-button.secondary {
      background-color: #6c757d;
    }
    .feedback-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .feedback-box h3 {
      margin: 0 0 10px 0;
      color: #856404;
      font-size: 16px;
    }
    .feedback-box p {
      margin: 0;
      color: #856404;
      font-size: 14px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #28a745;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✅ Order Delivered!</h1>
      <p>Order #${orderNumber}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>Hi ${customerName},</p>

      <!-- Celebration Banner -->
      <div class="celebration-banner">
        <h2>🎉 Your order has been delivered!</h2>
        <p>We hope you love your purchase</p>
      </div>

      <p>Your order was delivered on <strong>${deliveryDate}</strong>. We hope everything arrived in perfect condition!</p>

      <!-- Order Details -->
      <div class="order-info">
        <h2>Order Details</h2>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Order Date:</strong> ${orderDate}</p>
        <p><strong>Delivery Date:</strong> ${deliveryDate}</p>
      </div>

      <!-- Items -->
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <div class="row">
          <span class="label">Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="row">
          <span class="label">Tax:</span>
          <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="row">
          <span class="label">Shipping:</span>
          <span>$${shippingCost.toFixed(2)}</span>
        </div>
        <div class="row total-row">
          <span class="label">Total:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="shipping-address">
        <h3>Delivered To</h3>
        <p style="margin: 5px 0;">${shippingAddress.name}</p>
        <p style="margin: 5px 0;">${shippingAddress.street}</p>
        <p style="margin: 5px 0;">
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}
        </p>
        <p style="margin: 5px 0;">${shippingAddress.country}</p>
      </div>

      <!-- Feedback Box -->
      <div class="feedback-box">
        <h3>How was your experience?</h3>
        <p>We'd love to hear your feedback! Your review helps other customers and helps us improve.</p>
      </div>

      <!-- CTA Buttons -->
      <div class="cta-buttons">
        <a href="#" class="cta-button">Leave a Review</a>
        <a href="#" class="cta-button secondary">View Order</a>
      </div>

      <p style="margin-top: 30px;">If you have any issues with your order, please contact our support team within 30 days.</p>
      <p>Thank you for choosing us!</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Shopping App. All rights reserved.</p>
      <p>
        <a href="#">Shop Again</a> |
        <a href="#">Contact Support</a> |
        <a href="#">Return Policy</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px;">
        Need help? Visit our <a href="#">Help Center</a> or reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Plain text version for email clients that don't support HTML
export function renderOrderDeliveredEmailPlainText(
  props: OrderDeliveredEmailProps
): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    deliveryDate,
    items,
    subtotal,
    tax,
    shippingCost,
    total,
    shippingAddress,
  } = props;

  return `
Your Order Has Been Delivered!
Order #${orderNumber}

Hi ${customerName},

Great news! Your order was delivered on ${deliveryDate}. We hope everything arrived in perfect condition!

ORDER DETAILS
Order Number: ${orderNumber}
Order Date: ${orderDate}
Delivery Date: ${deliveryDate}

ITEMS
${items
  .map(
    (item) =>
      `${item.name} - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
  )
  .join('\n')}

TOTALS
Subtotal: $${subtotal.toFixed(2)}
Tax: $${tax.toFixed(2)}
Shipping: $${shippingCost.toFixed(2)}
Total: $${total.toFixed(2)}

DELIVERED TO
${shippingAddress.name}
${shippingAddress.street}
${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}
${shippingAddress.country}

HOW WAS YOUR EXPERIENCE?
We'd love to hear your feedback! Your review helps other customers and helps us improve.

If you have any issues with your order, please contact our support team within 30 days.

Thank you for choosing us!

© ${new Date().getFullYear()} Shopping App. All rights reserved.
  `.trim();
}
