// ============================================================================
// T168: ORDER SHIPPED EMAIL TEMPLATE (Phase 7 - User Story 6)
// ============================================================================

interface OrderShippedEmailProps {
  customerName: string;
  orderNumber: string;
  orderDate: string;
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
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export function renderOrderShippedEmail(props: OrderShippedEmailProps): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    items,
    subtotal,
    tax,
    shippingCost,
    total,
    shippingAddress,
    trackingNumber,
    estimatedDelivery,
  } = props;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Been Shipped</title>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    .order-info {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .order-info h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #667eea;
    }
    .order-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    .tracking-box {
      background-color: #e7f3ff;
      border-left: 4px solid #0066cc;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .tracking-box strong {
      color: #0066cc;
      font-size: 16px;
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
    .cta-button {
      display: inline-block;
      background-color: #667eea;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>📦 Your Order Has Shipped!</h1>
      <p>Order #${orderNumber}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>Hi ${customerName},</p>
      <p>Great news! Your order has been shipped and is on its way to you.</p>

      ${
        trackingNumber
          ? `
      <div class="tracking-box">
        <p style="margin: 0 0 8px 0;"><strong>Tracking Number:</strong></p>
        <p style="margin: 0; font-size: 18px; font-weight: 600;">${trackingNumber}</p>
      </div>
      `
          : ''
      }

      ${
        estimatedDelivery
          ? `
      <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
      `
          : ''
      }

      <!-- Order Details -->
      <div class="order-info">
        <h2>Order Details</h2>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Order Date:</strong> ${orderDate}</p>
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
        <h3>Shipping Address</h3>
        <p style="margin: 5px 0;">${shippingAddress.name}</p>
        <p style="margin: 5px 0;">${shippingAddress.street}</p>
        <p style="margin: 5px 0;">
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}
        </p>
        <p style="margin: 5px 0;">${shippingAddress.country}</p>
      </div>

      <p>If you have any questions about your order, please don't hesitate to contact us.</p>
      <p>Thank you for shopping with us!</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Shopping App. All rights reserved.</p>
      <p>
        <a href="#">Track Order</a> |
        <a href="#">Contact Support</a> |
        <a href="#">Return Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Plain text version for email clients that don't support HTML
export function renderOrderShippedEmailPlainText(
  props: OrderShippedEmailProps
): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    items,
    subtotal,
    tax,
    shippingCost,
    total,
    shippingAddress,
    trackingNumber,
    estimatedDelivery,
  } = props;

  return `
Your Order Has Shipped!
Order #${orderNumber}

Hi ${customerName},

Great news! Your order has been shipped and is on its way to you.

${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}
${estimatedDelivery ? `Estimated Delivery: ${estimatedDelivery}` : ''}

ORDER DETAILS
Order Number: ${orderNumber}
Order Date: ${orderDate}

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

SHIPPING ADDRESS
${shippingAddress.name}
${shippingAddress.street}
${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}
${shippingAddress.country}

If you have any questions about your order, please don't hesitate to contact us.

Thank you for shopping with us!

© ${new Date().getFullYear()} Shopping App. All rights reserved.
  `.trim();
}
