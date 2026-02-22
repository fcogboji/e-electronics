# E-Commerce Email Notification System

Complete guide for implementing professional email notifications using Resend for your e-commerce order flow.

## Table of Contents

1. [Overview](#overview)
2. [Email Templates](#email-templates)
3. [Setup & Configuration](#setup--configuration)
4. [Usage Examples](#usage-examples)
5. [API Integration](#api-integration)
6. [Customization](#customization)
7. [Testing](#testing)
8. [Best Practices](#best-practices)

---

## Overview

This email notification system provides professional, mobile-responsive email templates for all critical order status updates. All emails are sent using [Resend](https://resend.com), a modern email API service.

### Features

- **Professional Templates**: Beautiful, mobile-responsive HTML email templates
- **Status-Based Emails**: Automated emails for each order status
- **Type-Safe**: Full TypeScript support with proper interfaces
- **Error Handling**: Graceful failure handling - order updates succeed even if emails fail
- **Unified API**: Single function to send emails based on order status

---

## Email Templates

### Order Status Emails

| Status | Template | Subject Line | Purpose |
|--------|----------|--------------|---------|
| **confirmed** | Order Confirmation | "Your order has been confirmed 🎉" | Confirms payment and order creation |
| **packed** | Order Packed | "Your order is being prepared 📦" | Reassures customer that order is being processed |
| **shipped** | Order Shipped | "Your order is on its way 🚚" | Provides tracking information |
| **delivered** | Order Delivered | "Your order has been delivered ✅" | Confirms delivery and requests feedback |
| **cancelled** | Order Cancelled | "Your order has been cancelled" | Explains cancellation and refund details |

### Additional Email Templates

- **Refund Confirmation**: Sent when a refund is processed
- **Chat Message Notifications**: For customer support interactions

---

## Setup & Configuration

### 1. Environment Variables

Ensure your `.env` file has the Resend API key configured:

```env
# Email Service - Resend
RESEND_API_KEY="re_your_api_key_here"

# Application URL (used in email links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Email Configuration

Update the sender email addresses in `/src/lib/email.ts`:

```typescript
const EMAIL_FROM = 'E-Electronics <orders@yourdomain.com>';
const SUPPORT_EMAIL = 'E-Electronics Support <support@yourdomain.com>';
```

**Important**: Replace `yourdomain.com` with your verified domain in Resend.

### 3. Verify Domain in Resend

1. Log in to [Resend Dashboard](https://resend.com/domains)
2. Add and verify your domain
3. Update DNS records as instructed
4. Wait for verification (usually takes a few minutes)

---

## Usage Examples

### Basic Usage - Send Single Email

```typescript
import { sendOrderConfirmationEmail } from '@/lib/email';

// Send order confirmation email
const result = await sendOrderConfirmationEmail({
  to: 'customer@example.com',
  customerName: 'John Doe',
  orderId: 'ORD-12345',
  orderItems: [
    {
      productName: 'iPhone 15 Pro',
      quantity: 1,
      price: 45000000 // Price in kobo (₦450,000)
    }
  ],
  totalAmount: 45000000, // Total in kobo
  paymentReference: 'PAY-ABC123'
});

if (result.success) {
  console.log('Email sent successfully');
} else {
  console.error('Email failed:', result.error);
}
```

### Unified Status-Based Emails

Use the `sendOrderStatusEmail` function for automatic email selection:

```typescript
import { sendOrderStatusEmail } from '@/lib/email';

// Automatically sends the right email based on status
await sendOrderStatusEmail('shipped', {
  to: 'customer@example.com',
  customerName: 'John Doe',
  orderId: 'ORD-12345',
  trackingNumber: 'TRK-98765',
  shippingProvider: 'DHL Express',
  estimatedDeliveryDate: '2025-10-20',
  trackingUrl: 'https://dhl.com/track/TRK-98765'
});
```

### All Status Examples

#### 1. Order Confirmed

```typescript
await sendOrderStatusEmail('confirmed', {
  to: 'customer@example.com',
  customerName: 'John Doe',
  orderId: 'ORD-12345',
  orderItems: [
    { productName: 'iPhone 15 Pro', quantity: 1, price: 45000000 },
    { productName: 'AirPods Pro', quantity: 1, price: 9000000 }
  ],
  totalAmount: 54000000,
  paymentReference: 'PAY-ABC123'
});
```

#### 2. Order Packed

```typescript
await sendOrderStatusEmail('packed', {
  to: 'customer@example.com',
  customerName: 'John Doe',
  orderId: 'ORD-12345',
  estimatedDispatchDate: 'October 15, 2025' // Optional
});
```

#### 3. Order Shipped

```typescript
await sendOrderStatusEmail('shipped', {
  to: 'customer@example.com',
  customerName: 'John Doe',
  orderId: 'ORD-12345',
  trackingNumber: 'TRK-98765',
  shippingProvider: 'DHL Express',
  estimatedDeliveryDate: 'October 20, 2025',
  trackingUrl: 'https://dhl.com/track/TRK-98765'
});
```

#### 4. Order Delivered

```typescript
await sendOrderStatusEmail('delivered', {
  to: 'customer@example.com',
  customerName: 'John Doe',
  orderId: 'ORD-12345',
  deliveredAt: 'October 18, 2025, 2:30 PM'
});
```

#### 5. Order Cancelled

```typescript
await sendOrderStatusEmail('cancelled', {
  to: 'customer@example.com',
  customerName: 'John Doe',
  orderId: 'ORD-12345',
  cancellationReason: 'Customer requested cancellation',
  refundAmount: 54000000, // Amount in kobo
  refundMethod: 'Original payment method',
  refundEta: '5-10 business days'
});
```

---

## API Integration

### Update Order Status with Email Notification

The order status API route (`/api/orders/[id]/status`) automatically sends emails when status changes.

#### API Endpoint

```
PUT /api/orders/[orderId]/status
```

#### Request Examples

**Mark Order as Packed:**

```bash
curl -X PUT http://localhost:3000/api/orders/ORD-12345/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "packed",
    "changedBy": "admin@example.com",
    "notes": "Order packed and ready for dispatch"
  }'
```

**Mark Order as Shipped (with tracking):**

```bash
curl -X PUT http://localhost:3000/api/orders/ORD-12345/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "changedBy": "admin@example.com",
    "notes": "Shipped via DHL",
    "trackingNumber": "TRK-98765",
    "shippingProvider": "DHL Express",
    "estimatedDeliveryDate": "2025-10-20",
    "trackingUrl": "https://dhl.com/track/TRK-98765"
  }'
```

**Mark Order as Delivered:**

```bash
curl -X PUT http://localhost:3000/api/orders/ORD-12345/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "delivered",
    "changedBy": "system",
    "notes": "Delivered successfully",
    "deliveredAt": "October 18, 2025, 2:30 PM"
  }'
```

**Cancel Order (with refund):**

```bash
curl -X PUT http://localhost:3000/api/orders/ORD-12345/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled",
    "changedBy": "admin@example.com",
    "notes": "Cancelled per customer request",
    "cancellationReason": "Customer requested cancellation",
    "refundAmount": 540000,
    "refundMethod": "Original payment method",
    "refundEta": "5-10 business days"
  }'
```

### Frontend Integration Example

```typescript
// In your admin dashboard or order management page
async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        changedBy: currentUser.email,
        notes: `Status updated to ${newStatus}`,
        // Add additional fields based on status
        ...(newStatus === 'shipped' && {
          trackingNumber: trackingInput.value,
          shippingProvider: providerSelect.value,
          estimatedDeliveryDate: deliveryDateInput.value
        })
      })
    });

    if (response.ok) {
      toast.success('Order status updated and customer notified!');
    }
  } catch (error) {
    toast.error('Failed to update order status');
  }
}
```

---

## Customization

### 1. Modify Email Templates

Email templates are in `/src/lib/email.ts`. Each function contains inline HTML with template literals.

**Example: Customize Order Confirmed Email Header Color**

```typescript
// Change from green (#16a34a) to blue (#3b82f6)
<td style="background-color: #3b82f6; padding: 30px; text-align: center;">
  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Order Confirmed!</h1>
</td>
```

### 2. Add Custom Fields

To add custom data to emails, update the interface and template:

```typescript
interface OrderShippedEmailData extends BaseEmailData {
  trackingNumber?: string;
  shippingProvider?: string;
  // Add your custom field
  courierPhone?: string;
}

// Then use it in the template
${courierPhone ? `<p><strong>Courier Phone:</strong> ${courierPhone}</p>` : ''}
```

### 3. Brand Customization

Update colors, fonts, and logos:

```typescript
// Primary color scheme
const PRIMARY_COLOR = '#16a34a';  // Green
const SECONDARY_COLOR = '#3b82f6'; // Blue
const DANGER_COLOR = '#ef4444';    // Red

// Font family
const FONT_FAMILY = 'Arial, Helvetica, sans-serif';

// Add logo
<img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="Logo" style="max-width: 150px;" />
```

### 4. Create New Email Templates

Follow this pattern:

```typescript
interface MyCustomEmailData extends BaseEmailData {
  customField: string;
}

export async function sendMyCustomEmail(data: MyCustomEmailData) {
  try {
    const { to, customerName, orderId, customField } = data;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <!-- Your HTML template here -->
      </html>
    `;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Your Custom Subject',
      html: emailHtml,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
```

---

## Testing

### Test Email Sending Locally

Create a test script or API route:

```typescript
// /src/app/api/test-email/route.ts
import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function GET() {
  const result = await sendOrderConfirmationEmail({
    to: 'test@example.com',
    customerName: 'Test User',
    orderId: 'TEST-001',
    orderItems: [
      { productName: 'Test Product', quantity: 1, price: 1000000 }
    ],
    totalAmount: 1000000,
    paymentReference: 'TEST-PAY-001'
  });

  return NextResponse.json(result);
}
```

Visit: `http://localhost:3000/api/test-email`

### Email Preview Tools

1. **Email on Acid**: Test email rendering across clients
2. **Litmus**: Preview emails in 90+ email clients
3. **Resend Testing**: Use Resend's test mode to preview emails

### Test in Development

In development, Resend provides a test mode:

```typescript
// Add to .env for testing
RESEND_API_KEY="re_test_your_test_key_here"
```

All emails will be captured in your Resend dashboard without actual delivery.

---

## Best Practices

### 1. Email Deliverability

- ✅ **Verify your domain** with Resend
- ✅ **Add SPF and DKIM records** to your DNS
- ✅ **Use professional sender addresses** (e.g., orders@yourdomain.com)
- ✅ **Avoid spam trigger words** in subject lines
- ✅ **Include unsubscribe links** for marketing emails

### 2. Error Handling

Always handle email failures gracefully:

```typescript
try {
  await sendOrderStatusEmail(status, emailData);
} catch (emailError) {
  // Log the error but don't fail the order update
  console.error('Email notification failed:', emailError);
  // Optionally: Queue for retry, send to fallback service, etc.
}
```

### 3. Email Content

- Keep subject lines under 50 characters
- Use clear, action-oriented CTAs
- Make emails mobile-responsive
- Include order ID for reference
- Provide customer support contact info

### 4. Performance

- Send emails asynchronously (don't block API responses)
- Consider using a queue (e.g., Bull, BullMQ) for high-volume sends
- Batch similar emails when possible

### 5. Privacy & Security

- Don't include sensitive payment details (full card numbers)
- Use HTTPS for all links
- Comply with GDPR/data protection laws
- Allow customers to opt out of marketing emails

---

## Troubleshooting

### Common Issues

**1. Emails not sending**
- Check `RESEND_API_KEY` is set correctly
- Verify domain in Resend dashboard
- Check Resend API logs for errors

**2. Emails going to spam**
- Add SPF, DKIM, and DMARC records
- Warm up your sending domain
- Avoid spam trigger words

**3. TypeScript errors**
- Ensure all required fields are provided
- Check interface definitions match usage
- Run `npm run type-check`

**4. Email styling issues**
- Test in multiple email clients
- Use inline CSS (no external stylesheets)
- Avoid complex CSS (no flexbox, grid)
- Use tables for layout

---

## Support

For issues or questions:

1. Check [Resend Documentation](https://resend.com/docs)
2. Review this guide
3. Check application logs for errors
4. Contact your development team

---

## Summary

This email notification system provides:

- ✅ Professional templates for all order statuses
- ✅ Type-safe TypeScript implementation
- ✅ Automatic email sending on status updates
- ✅ Easy customization and extension
- ✅ Robust error handling
- ✅ Mobile-responsive designs

**Next Steps:**
1. Update sender email addresses with your domain
2. Verify your domain in Resend
3. Test email sending in development
4. Customize templates to match your brand
5. Deploy and monitor email deliverability

---

**Last Updated:** October 2025
**Version:** 1.0.0
