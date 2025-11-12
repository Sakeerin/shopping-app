import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

// ============================================================================
// ORDER CONFIRMATION EMAIL TEMPLATE (React Email)
// ============================================================================

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  productSlug: string;
  quantity: number;
  price: number;
  lineTotal: number;
  variantDetails?: string;
}

interface ShippingAddress {
  fullName: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderConfirmationEmailProps {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  estimatedDelivery?: string;
  trackingUrl?: string;
}

export const OrderConfirmationEmail = ({
  orderNumber = 'ORD-123456',
  orderDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  customerName = 'John Doe',
  items = [
    {
      id: '1',
      productName: 'Sample Product',
      productImage: 'https://via.placeholder.com/100',
      productSlug: 'sample-product',
      quantity: 2,
      price: 29.99,
      lineTotal: 59.98,
    },
  ],
  subtotal = 59.98,
  taxAmount = 4.8,
  shippingCost = 5.99,
  discountAmount = 0,
  totalAmount = 70.77,
  shippingAddress = {
    fullName: 'John Doe',
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'US',
    phone: '555-1234',
  },
  estimatedDelivery,
}: OrderConfirmationEmailProps) => {
  const previewText = `Order Confirmation - ${orderNumber}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Shopping App</Heading>
          </Section>

          {/* Success Message */}
          <Section style={successSection}>
            <Text style={successIcon}>✓</Text>
            <Heading style={h2}>Order Confirmed!</Heading>
            <Text style={paragraph}>
              Thank you for your order, {customerName}! We've received your order and are getting
              it ready for shipment.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Order Details */}
          <Section style={orderDetailsSection}>
            <Row>
              <Column>
                <Text style={label}>Order Number</Text>
                <Text style={value}>{orderNumber}</Text>
              </Column>
              <Column align="right">
                <Text style={label}>Order Date</Text>
                <Text style={value}>{orderDate}</Text>
              </Column>
            </Row>
            {estimatedDelivery && (
              <Row style={{ marginTop: '16px' }}>
                <Column>
                  <Text style={label}>Estimated Delivery</Text>
                  <Text style={value}>{estimatedDelivery}</Text>
                </Column>
              </Row>
            )}
          </Section>

          <Hr style={hr} />

          {/* Order Items */}
          <Section style={itemsSection}>
            <Heading style={h3}>Order Items</Heading>
            {items.map((item, index) => (
              <Row key={item.id} style={itemRow}>
                <Column style={{ width: '80px', paddingRight: '16px' }}>
                  <Img
                    src={item.productImage}
                    alt={item.productName}
                    width="80"
                    height="80"
                    style={productImage}
                  />
                </Column>
                <Column style={{ flex: 1 }}>
                  <Text style={productName}>{item.productName}</Text>
                  {item.variantDetails && (
                    <Text style={variantDetails}>{item.variantDetails}</Text>
                  )}
                  <Text style={quantityText}>Quantity: {item.quantity}</Text>
                </Column>
                <Column align="right" style={{ width: '100px' }}>
                  <Text style={itemPrice}>${item.lineTotal.toFixed(2)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Order Summary */}
          <Section style={summarySection}>
            <Heading style={h3}>Order Summary</Heading>
            <Row style={summaryRow}>
              <Column>
                <Text style={summaryLabel}>Subtotal</Text>
              </Column>
              <Column align="right">
                <Text style={summaryValue}>${subtotal.toFixed(2)}</Text>
              </Column>
            </Row>
            <Row style={summaryRow}>
              <Column>
                <Text style={summaryLabel}>Shipping</Text>
              </Column>
              <Column align="right">
                <Text style={summaryValue}>
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </Text>
              </Column>
            </Row>
            <Row style={summaryRow}>
              <Column>
                <Text style={summaryLabel}>Tax</Text>
              </Column>
              <Column align="right">
                <Text style={summaryValue}>${taxAmount.toFixed(2)}</Text>
              </Column>
            </Row>
            {discountAmount > 0 && (
              <Row style={summaryRow}>
                <Column>
                  <Text style={summaryLabel}>Discount</Text>
                </Column>
                <Column align="right">
                  <Text style={{ ...summaryValue, color: '#16a34a' }}>
                    -${discountAmount.toFixed(2)}
                  </Text>
                </Column>
              </Row>
            )}
            <Hr style={summaryDivider} />
            <Row style={summaryRow}>
              <Column>
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>${totalAmount.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Shipping Address */}
          <Section style={addressSection}>
            <Heading style={h3}>Shipping Address</Heading>
            <Text style={addressText}>{shippingAddress.fullName}</Text>
            <Text style={addressText}>{shippingAddress.street}</Text>
            {shippingAddress.street2 && (
              <Text style={addressText}>{shippingAddress.street2}</Text>
            )}
            <Text style={addressText}>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            </Text>
            <Text style={addressText}>{shippingAddress.country}</Text>
            <Text style={addressText}>{shippingAddress.phone}</Text>
          </Section>

          <Hr style={hr} />

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${orderNumber}`}
            >
              View Order Details
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your order? Contact our support team at support@shoppingapp.com
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Shopping App. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

// ============================================================================
// STYLES
// ============================================================================

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#2563eb',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
  lineHeight: '1.3',
};

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
  lineHeight: '1.3',
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
  lineHeight: '1.3',
};

const successSection = {
  padding: '24px 24px 16px',
  textAlign: 'center' as const,
};

const successIcon = {
  fontSize: '48px',
  margin: '0 0 16px',
  color: '#16a34a',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 16px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const orderDetailsSection = {
  padding: '0 24px',
};

const label = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 4px',
  fontWeight: '500',
};

const value = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 16px',
  fontWeight: '600',
};

const itemsSection = {
  padding: '0 24px',
};

const itemRow = {
  marginBottom: '24px',
};

const productImage = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const productName = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
  lineHeight: '1.4',
};

const variantDetails = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 4px',
  lineHeight: '1.4',
};

const quantityText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.4',
};

const itemPrice = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const summarySection = {
  padding: '0 24px',
};

const summaryRow = {
  marginBottom: '8px',
};

const summaryLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const summaryValue = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '0',
  fontWeight: '500',
};

const summaryDivider = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
};

const totalLabel = {
  color: '#1f2937',
  fontSize: '18px',
  margin: '0',
  fontWeight: 'bold',
};

const totalValue = {
  color: '#1f2937',
  fontSize: '20px',
  margin: '0',
  fontWeight: 'bold',
};

const addressSection = {
  padding: '0 24px',
};

const addressText = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '0 0 4px',
  lineHeight: '1.5',
};

const buttonSection = {
  padding: '24px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  padding: '0 24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '8px 0',
};
