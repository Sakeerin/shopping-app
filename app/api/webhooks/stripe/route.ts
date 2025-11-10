import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { constructWebhookEvent } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await constructWebhookEvent(body, signature);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.succeeded':
        console.log('Charge succeeded:', event.data.object.id);
        break;

      case 'charge.failed':
        console.log('Charge failed:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    console.error('No orderId in payment intent metadata');
    return;
  }

  // Update order payment status
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'SUCCEEDED',
      status: 'PROCESSING',
      paymentIntentId: paymentIntent.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Send order confirmation email
  try {
    await sendOrderConfirmationEmail({
      email: order.userEmail,
      orderNumber: order.orderNumber,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: Number(item.priceSnapshot),
      })),
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }

  console.log(`Payment succeeded for order ${order.orderNumber}`);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    console.error('No orderId in payment intent metadata');
    return;
  }

  // Update order payment status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'FAILED',
      paymentIntentId: paymentIntent.id,
    },
  });

  console.log(`Payment failed for order ${orderId}`);
}
