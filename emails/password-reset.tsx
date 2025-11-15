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
// PASSWORD RESET EMAIL TEMPLATE (React Email)
// ============================================================================

export interface PasswordResetEmailProps {
  resetUrl: string;
}

export const PasswordResetEmail = ({
  resetUrl = 'http://localhost:3000/reset-password/token123',
}: PasswordResetEmailProps) => {
  const previewText = 'Reset your ShopApp password';

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

          {/* Main Message */}
          <Section style={messageSection}>
            <Text style={lockIcon}>🔒</Text>
            <Heading style={h2}>Reset Your Password</Heading>
            <Text style={paragraph}>
              We received a request to reset the password for your ShopApp account. If you made
              this request, click the button below to create a new password.
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>

          <Section style={infoSection}>
            <Text style={paragraph}>
              This link will expire in <strong>1 hour</strong> for security reasons.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Alternative Link */}
          <Section style={alternativeSection}>
            <Text style={smallParagraph}>
              If the button above doesn't work, you can copy and paste this link into your browser:
            </Text>
            <Text style={linkText}>{resetUrl}</Text>
          </Section>

          <Hr style={hr} />

          {/* Security Notice */}
          <Section style={securitySection}>
            <Heading style={h3}>Didn't request this?</Heading>
            <Text style={paragraph}>
              If you didn't request a password reset, you can safely ignore this email. Your
              password will remain unchanged.
            </Text>
            <Text style={paragraph}>
              For security reasons, we recommend that you:
            </Text>
            <ul style={list}>
              <li style={listItem}>Use a strong, unique password</li>
              <li style={listItem}>Never share your password with anyone</li>
              <li style={listItem}>Enable two-factor authentication when available</li>
            </ul>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If you have any questions or concerns, please contact our support team at{' '}
              <a href="mailto:support@shoppingapp.com" style={link}>
                support@shoppingapp.com
              </a>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} ShopApp. All rights reserved.
            </Text>
            <Text style={footerText}>
              This is an automated message. Please do not reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

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

const messageSection = {
  padding: '24px 24px 16px',
  textAlign: 'center' as const,
};

const lockIcon = {
  fontSize: '48px',
  margin: '0 0 16px',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 16px',
};

const smallParagraph = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
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

const infoSection = {
  padding: '0 24px',
  textAlign: 'center' as const,
};

const alternativeSection = {
  padding: '0 24px',
  textAlign: 'center' as const,
};

const linkText = {
  color: '#2563eb',
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '0',
  wordBreak: 'break-all' as const,
  padding: '12px',
  backgroundColor: '#f3f4f6',
  borderRadius: '4px',
};

const securitySection = {
  padding: '0 24px',
};

const list = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px',
  paddingLeft: '20px',
};

const listItem = {
  marginBottom: '8px',
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
