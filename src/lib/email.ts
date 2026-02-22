import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
// Using uk2naijagadgets.com domain
// NOTE: Domain must be verified in Resend dashboard before emails will send
const EMAIL_FROM = process.env.EMAIL_FROM || 'E-Electronics <orders@uk2naijagadgets.com>';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'E-Electronics Support <support@uk2naijagadgets.com>';

// Order status type definitions
export type OrderStatus =
  | 'confirmed'      // Order confirmed / Payment successful
  | 'packed'         // Order packed / Ready for dispatch
  | 'shipped'        // Shipped / Out for delivery
  | 'delivered'      // Delivered
  | 'cancelled'      // Cancelled / Refunded
  | 'processing';    // Processing / Pending payment

// Base interfaces
interface BaseEmailData {
  to: string;
  customerName: string;
  orderId: string;
}

interface OrderConfirmationEmailData extends BaseEmailData {
  orderItems: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentReference: string;
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
  try {
    const { to, customerName, orderId, orderItems, totalAmount, paymentReference } = data;

    const itemsList = orderItems
      .map(
        (item) =>
          `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₦${(item.price / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₦${((item.price * item.quantity) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
          </tr>`
      )
      .join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #16a34a; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Order Confirmed!</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Hi ${customerName},
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Thank you for your order! We've received your payment and your order is being processed.
                      </p>

                      <!-- Order Details -->
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Order Details</h2>
                        <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #6b7280;"><strong>Payment Reference:</strong> ${paymentReference}</p>
                      </div>

                      <!-- Order Items Table -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border-collapse: collapse;">
                        <thead>
                          <tr style="background-color: #f3f4f6;">
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Product</th>
                            <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Qty</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Price</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsList}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colspan="3" style="padding: 16px 12px; text-align: right; font-weight: 600; font-size: 18px; color: #111827;">Total:</td>
                            <td style="padding: 16px 12px; text-align: right; font-weight: 600; font-size: 18px; color: #16a34a;">₦${(totalAmount / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                          </tr>
                        </tfoot>
                      </table>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          View Order Details
                        </a>
                      </div>

                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                        If you have any questions, please don't hesitate to contact us.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f3f4f6; padding: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">
                        © ${new Date().getFullYear()} E-Electronics. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Your order has been confirmed 🎉 - Order #${orderId}`,
      html: emailHtml,
    });

    console.log('Order confirmation email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}

// ============================================================================
// ORDER PACKED EMAIL
// ============================================================================
interface OrderPackedEmailData extends BaseEmailData {
  estimatedDispatchDate?: string;
}

export async function sendOrderPackedEmail(data: OrderPackedEmailData) {
  try {
    const { to, customerName, orderId, estimatedDispatchDate } = data;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Being Prepared</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #f59e0b; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">📦 Order Being Prepared!</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Hi ${customerName},
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Great news! Your order is being carefully packed and will be ready for dispatch soon.
                      </p>

                      <!-- Order Details -->
                      <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Order Status Update</h2>
                        <p style="margin: 5px 0; color: #78350f;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #78350f;"><strong>Status:</strong> Being Packed</p>
                        ${estimatedDispatchDate ? `<p style="margin: 5px 0; color: #78350f;"><strong>Estimated Dispatch:</strong> ${estimatedDispatchDate}</p>` : ''}
                      </div>

                      <!-- What's Next -->
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #111827;">What happens next?</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                          <li style="margin: 8px 0;">Your items are being carefully inspected and packed</li>
                          <li style="margin: 8px 0;">You'll receive a shipping confirmation with tracking details</li>
                          <li style="margin: 8px 0;">Your order will be dispatched within 24-48 hours</li>
                        </ul>
                      </div>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Track Your Order
                        </a>
                      </div>

                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                        Questions? We're here to help! Contact our support team anytime.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f3f4f6; padding: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">
                        © ${new Date().getFullYear()} E-Electronics. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Your order is being prepared 📦 - Order #${orderId}`,
      html: emailHtml,
    });

    console.log('Order packed email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send order packed email:', error);
    return { success: false, error };
  }
}

// ============================================================================
// ORDER SHIPPED EMAIL
// ============================================================================
interface OrderShippedEmailData extends BaseEmailData {
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDeliveryDate?: string;
  trackingUrl?: string;
}

export async function sendOrderShippedEmail(data: OrderShippedEmailData) {
  try {
    const { to, customerName, orderId, trackingNumber, shippingProvider, estimatedDeliveryDate, trackingUrl } = data;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Shipped</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #3b82f6; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🚚 Your Order is On Its Way!</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Hi ${customerName},
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Exciting news! Your order has been shipped and is heading your way.
                      </p>

                      <!-- Shipping Details -->
                      <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Shipping Information</h2>
                        <p style="margin: 5px 0; color: #1e3a8a;"><strong>Order ID:</strong> ${orderId}</p>
                        ${trackingNumber ? `<p style="margin: 5px 0; color: #1e3a8a;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
                        ${shippingProvider ? `<p style="margin: 5px 0; color: #1e3a8a;"><strong>Shipping Provider:</strong> ${shippingProvider}</p>` : ''}
                        ${estimatedDeliveryDate ? `<p style="margin: 5px 0; color: #1e3a8a;"><strong>Estimated Delivery:</strong> ${estimatedDeliveryDate}</p>` : ''}
                      </div>

                      ${trackingNumber ? `
                      <!-- Tracking Steps -->
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #111827;">Track Your Package</h3>
                        <p style="margin: 0 0 15px 0; color: #6b7280;">
                          You can track your package in real-time using the tracking number above.
                        </p>
                        ${trackingUrl ? `
                        <div style="text-align: center; margin: 15px 0;">
                          <a href="${trackingUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                            Track Package
                          </a>
                        </div>
                        ` : ''}
                      </div>
                      ` : ''}

                      <!-- Delivery Tips -->
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #111827;">Delivery Tips</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                          <li style="margin: 8px 0;">Keep an eye on your tracking updates</li>
                          <li style="margin: 8px 0;">Ensure someone is available to receive the package</li>
                          <li style="margin: 8px 0;">Have your ID ready for verification</li>
                          <li style="margin: 8px 0;">Contact us immediately if there are any delivery issues</li>
                        </ul>
                      </div>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          View Order Details
                        </a>
                      </div>

                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                        Questions about your delivery? Contact our support team for assistance.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f3f4f6; padding: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">
                        © ${new Date().getFullYear()} E-Electronics. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Your order is on its way 🚚 - Order #${orderId}`,
      html: emailHtml,
    });

    console.log('Order shipped email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send order shipped email:', error);
    return { success: false, error };
  }
}

// ============================================================================
// ORDER DELIVERED EMAIL
// ============================================================================
interface OrderDeliveredEmailData extends BaseEmailData {
  deliveredAt?: string;
}

export async function sendOrderDeliveredEmail(data: OrderDeliveredEmailData) {
  try {
    const { to, customerName, orderId, deliveredAt } = data;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Delivered</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #16a34a; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">✅ Order Delivered Successfully!</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Hi ${customerName},
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Great news! Your order has been successfully delivered. We hope you love your purchase!
                      </p>

                      <!-- Delivery Details -->
                      <div style="background-color: #dcfce7; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #16a34a;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Delivery Confirmation</h2>
                        <p style="margin: 5px 0; color: #14532d;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #14532d;"><strong>Status:</strong> Delivered</p>
                        ${deliveredAt ? `<p style="margin: 5px 0; color: #14532d;"><strong>Delivered On:</strong> ${deliveredAt}</p>` : ''}
                      </div>

                      <!-- Call to Action -->
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #111827;">How was your experience?</h3>
                        <p style="margin: 0 0 15px 0; color: #6b7280;">
                          Your feedback helps us improve and helps other customers make informed decisions.
                        </p>
                        <div style="text-align: center; margin: 15px 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}/review" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 5px;">
                            Leave a Review ⭐
                          </a>
                        </div>
                      </div>

                      <!-- Support Information -->
                      <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #78350f;">
                          <strong>Need Help?</strong> If you have any issues with your order, please contact us within 7 days for returns or exchanges.
                        </p>
                      </div>

                      <!-- CTA Buttons -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 5px;">
                          View Order Details
                        </a>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/shop" style="display: inline-block; background-color: #6b7280; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 5px;">
                          Continue Shopping
                        </a>
                      </div>

                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280; text-align: center;">
                        Thank you for shopping with E-Electronics!
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f3f4f6; padding: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">
                        © ${new Date().getFullYear()} E-Electronics. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Your order has been delivered ✅ - Order #${orderId}`,
      html: emailHtml,
    });

    console.log('Order delivered email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send order delivered email:', error);
    return { success: false, error };
  }
}

// ============================================================================
// ORDER CANCELLED EMAIL
// ============================================================================
interface OrderCancelledEmailData extends BaseEmailData {
  cancellationReason?: string;
  refundAmount?: number;
  refundMethod?: string;
  refundEta?: string;
}

export async function sendOrderCancelledEmail(data: OrderCancelledEmailData) {
  try {
    const { to, customerName, orderId, cancellationReason, refundAmount, refundMethod, refundEta } = data;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Cancelled</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #ef4444; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Order Cancelled</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Hi ${customerName},
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Your order has been cancelled as requested. ${refundAmount ? 'A full refund will be processed to your original payment method.' : ''}
                      </p>

                      <!-- Cancellation Details -->
                      <div style="background-color: #fee2e2; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Cancellation Details</h2>
                        <p style="margin: 5px 0; color: #7f1d1d;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #7f1d1d;"><strong>Status:</strong> Cancelled</p>
                        ${cancellationReason ? `<p style="margin: 5px 0; color: #7f1d1d;"><strong>Reason:</strong> ${cancellationReason}</p>` : ''}
                      </div>

                      ${refundAmount ? `
                      <!-- Refund Information -->
                      <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Refund Information</h2>
                        <p style="margin: 5px 0; color: #1e3a8a;"><strong>Refund Amount:</strong> ₦${(refundAmount / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                        ${refundMethod ? `<p style="margin: 5px 0; color: #1e3a8a;"><strong>Refund Method:</strong> ${refundMethod}</p>` : ''}
                        ${refundEta ? `<p style="margin: 5px 0; color: #1e3a8a;"><strong>Expected By:</strong> ${refundEta}</p>` : '<p style="margin: 5px 0; color: #1e3a8a;">Refunds typically take 5-10 business days to process</p>'}
                      </div>
                      ` : ''}

                      <!-- What's Next -->
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #111827;">What happens next?</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                          ${refundAmount ? '<li style="margin: 8px 0;">Your refund will be processed within 1-2 business days</li>' : ''}
                          <li style="margin: 8px 0;">You'll receive a confirmation once the refund is complete</li>
                          <li style="margin: 8px 0;">Feel free to place a new order anytime</li>
                        </ul>
                      </div>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/shop" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Browse Products
                        </a>
                      </div>

                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                        If you have any questions about this cancellation, please don't hesitate to contact our support team.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f3f4f6; padding: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">
                        © ${new Date().getFullYear()} E-Electronics. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Your order has been cancelled - Order #${orderId}`,
      html: emailHtml,
    });

    console.log('Order cancelled email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send order cancelled email:', error);
    return { success: false, error };
  }
}

interface RefundConfirmationEmailData {
  to: string;
  customerName: string;
  orderId: string;
  refundAmount: number;
  refundReference: string;
}

export async function sendRefundConfirmationEmail(data: RefundConfirmationEmailData) {
  try {
    const { to, customerName, orderId, refundAmount, refundReference } = data;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Refund Processed</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #3b82f6; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Refund Processed</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Hi ${customerName},
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Your refund request has been processed successfully.
                      </p>

                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Refund Details</h2>
                        <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #6b7280;"><strong>Refund Reference:</strong> ${refundReference}</p>
                        <p style="margin: 5px 0; color: #6b7280;"><strong>Refund Amount:</strong> ₦${(refundAmount / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                      </div>

                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                        The refund will be credited to your original payment method within 5-10 business days.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background-color: #f3f4f6; padding: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">
                        © ${new Date().getFullYear()} E-Electronics. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Refund Processed - ${orderId}`,
      html: emailHtml,
    });

    console.log('Refund confirmation email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send refund confirmation email:', error);
    return { success: false, error };
  }
}

interface NewChatMessageEmailData {
  to: string;
  subject: string;
  customerMessage: string;
  conversationId: string;
}

export async function sendNewChatMessageNotification(data: NewChatMessageEmailData) {
  try {
    const { to, subject, customerMessage, conversationId } = data;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Customer Message</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #3b82f6; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">💬 New Customer Message</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        You have a new message from a customer.
                      </p>

                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Subject: ${subject}</h2>
                        <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #3b82f6; margin-top: 15px;">
                          <p style="margin: 0; color: #374151; white-space: pre-wrap;">${customerMessage}</p>
                        </div>
                      </div>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/chat" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          View and Respond
                        </a>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="background-color: #f3f4f6; padding: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">
                        © ${new Date().getFullYear()} E-Electronics. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: SUPPORT_EMAIL,
      to,
      subject: `New Chat Message: ${subject}`,
      html: emailHtml,
    });

    console.log('New chat message notification sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send new chat message notification:', error);
    return { success: false, error };
  }
}

interface ChatResponseEmailData {
  to: string;
  subject: string;
  adminMessage: string;
  conversationId: string;
}

export async function sendChatResponseNotification(data: ChatResponseEmailData) {
  try {
    const { to, subject, adminMessage, conversationId } = data;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Support Response</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #16a34a; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Support Team Responded</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                        Our support team has responded to your inquiry.
                      </p>

                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Re: ${subject}</h2>
                        <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #16a34a; margin-top: 15px;">
                          <p style="margin: 0; color: #374151; white-space: pre-wrap;">${adminMessage}</p>
                        </div>
                      </div>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Continue Conversation
                        </a>
                      </div>

                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                        You can reply by logging into your account and opening the chat widget.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background-color: #f3f4f6; padding: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">
                        © ${new Date().getFullYear()} E-Electronics. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: SUPPORT_EMAIL,
      to,
      subject: `Support Response: ${subject}`,
      html: emailHtml,
    });

    console.log('Chat response notification sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send chat response notification:', error);
    return { success: false, error };
  }
}

// ============================================================================
// UNIFIED ORDER STATUS EMAIL SENDER
// ============================================================================

/**
 * Sends an email notification based on the order status
 * This is the main function to use when order status changes
 */
export async function sendOrderStatusEmail(
  status: OrderStatus,
  data: {
    to: string;
    customerName: string;
    orderId: string;
    // Optional fields depending on status
    orderItems?: Array<{
      productName: string;
      quantity: number;
      price: number;
    }>;
    totalAmount?: number;
    paymentReference?: string;
    estimatedDispatchDate?: string;
    trackingNumber?: string;
    shippingProvider?: string;
    estimatedDeliveryDate?: string;
    trackingUrl?: string;
    deliveredAt?: string;
    cancellationReason?: string;
    refundAmount?: number;
    refundMethod?: string;
    refundEta?: string;
  }
) {
  try {
    switch (status) {
      case 'confirmed':
        if (!data.orderItems || !data.totalAmount || !data.paymentReference) {
          throw new Error('Missing required fields for order confirmation email');
        }
        return await sendOrderConfirmationEmail({
          to: data.to,
          customerName: data.customerName,
          orderId: data.orderId,
          orderItems: data.orderItems,
          totalAmount: data.totalAmount,
          paymentReference: data.paymentReference,
        });

      case 'packed':
        return await sendOrderPackedEmail({
          to: data.to,
          customerName: data.customerName,
          orderId: data.orderId,
          estimatedDispatchDate: data.estimatedDispatchDate,
        });

      case 'shipped':
        return await sendOrderShippedEmail({
          to: data.to,
          customerName: data.customerName,
          orderId: data.orderId,
          trackingNumber: data.trackingNumber,
          shippingProvider: data.shippingProvider,
          estimatedDeliveryDate: data.estimatedDeliveryDate,
          trackingUrl: data.trackingUrl,
        });

      case 'delivered':
        return await sendOrderDeliveredEmail({
          to: data.to,
          customerName: data.customerName,
          orderId: data.orderId,
          deliveredAt: data.deliveredAt,
        });

      case 'cancelled':
        return await sendOrderCancelledEmail({
          to: data.to,
          customerName: data.customerName,
          orderId: data.orderId,
          cancellationReason: data.cancellationReason,
          refundAmount: data.refundAmount,
          refundMethod: data.refundMethod,
          refundEta: data.refundEta,
        });

      default:
        console.log(`No email template configured for status: ${status}`);
        return { success: false, error: 'Unknown status' };
    }
  } catch (error) {
    console.error(`Failed to send email for status ${status}:`, error);
    return { success: false, error };
  }
}
