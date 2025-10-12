import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderConfirmationEmailData {
  to: string;
  customerName: string;
  orderId: string;
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
      from: 'E-Electronics <orders@yourdomain.com>', // Update with your domain
      to,
      subject: `Order Confirmation - ${orderId}`,
      html: emailHtml,
    });

    console.log('Order confirmation email sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
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
      from: 'E-Electronics <orders@yourdomain.com>',
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
      from: 'E-Electronics Support <support@yourdomain.com>',
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
      from: 'E-Electronics Support <support@yourdomain.com>',
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
