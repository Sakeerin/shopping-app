import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

// ============================================================================
// WELCOME EMAIL TEMPLATE (React Email)
// ============================================================================

export interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name = 'there' }: WelcomeEmailProps) => {
  const previewText = `Welcome to ShopApp, ${name}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>ShopApp</Heading>
          </Section>

          {/* Welcome Message */}
          <Section style={welcomeSection}>
            <Text style={welcomeIcon}>👋</Text>
            <Heading style={h2}>Welcome to ShopApp, {name}!</Heading>
            <Text style={paragraph}>
              Thank you for creating an account with us. We're excited to have you as part of our
              community!
            </Text>
            <Text style={paragraph}>
              With your new account, you can:
            </Text>
          </Section>

          {/* Features List */}
          <Section style={featuresSection}>
            <div style={featureItem}>
              <Text style={featureIcon}>🛍️</Text>
              <div>
                <Text style={featureTitle}>Browse thousands of products</Text>
                <Text style={featureDescription}>
                  Discover amazing products across multiple categories
                </Text>
              </div>
            </div>

            <div style={featureItem}>
              <Text style={featureIcon}>⚡</Text>
              <div>
                <Text style={featureTitle}>Fast and secure checkout</Text>
                <Text style={featureDescription}>
                  Complete your purchase in seconds with our streamlined process
                </Text>
              </div>
            </div>

            <div style={featureItem}>
              <Text style={featureIcon}>📦</Text>
              <div>
                <Text style={featureTitle}>Track your orders</Text>
                <Text style={featureDescription}>
                  Monitor your order status from purchase to delivery
                </Text>
              </div>
            </div>

            <div style={featureItem}>
              <Text style={featureIcon}>💰</Text>
              <div>
                <Text style={featureTitle}>Exclusive deals and discounts</Text>
                <Text style={featureDescription}>
                  Get access to member-only promotions and special offers
                </Text>
              </div>
            </div>
          </Section>

          <Hr style={hr} />

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Text style={paragraph}>Ready to start shopping?</Text>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products`}
            >
              Browse Products
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Tips Section */}
          <Section style={tipsSection}>
            <Heading style={h3}>Quick Tips to Get Started</Heading>
            <Text style={tipText}>
              <strong>1. Complete your profile:</strong> Add your shipping address and payment
              method for faster checkout.
            </Text>
            <Text style={tipText}>
              <strong>2. Save your favorites:</strong> Create wishlists to keep track of products
              you love.
            </Text>
            <Text style={tipText}>
              <strong>3. Turn on notifications:</strong> Stay updated on order status and exclusive
              deals.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help getting started? Our support team is here for you at{' '}
              <a href="mailto:support@shoppingapp.com" style={link}>
                support@shoppingapp.com
              </a>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} ShopApp. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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

const welcomeSection = {
  padding: '24px 24px 16px',
  textAlign: 'center' as const,
};

const welcomeIcon = {
  fontSize: '48px',
  margin: '0 0 16px',
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

const featuresSection = {
  padding: '0 24px',
};

const featureItem = {
  display: 'flex',
  marginBottom: '20px',
  alignItems: 'flex-start',
};

const featureIcon = {
  fontSize: '32px',
  marginRight: '16px',
  marginTop: '4px',
  flexShrink: 0,
};

const featureTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
  lineHeight: '1.4',
};

const featureDescription = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
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

const tipsSection = {
  padding: '0 24px',
};

const tipText = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 12px',
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

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};
