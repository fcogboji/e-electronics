# Stock Reduction Testing Guide

This guide explains how to test if stock reduction is working correctly after payment processing.

## Overview

Stock reduction happens in **three locations** in your codebase:

1. **Payment Verification API** (`/api/payments/verify/route.ts:122-132`)
2. **Payment Webhook** (`/api/payments/webhook/route.ts:129-139`)
3. **Alternative Webhook** (`/api/webhook/route.ts:124-127`)

All three locations use Prisma's `decrement` function to reduce stock atomically.

## Quick Test Methods

### Method 1: Using the Test Script

1. **Check current stock before purchase:**
   ```bash
   npx ts-node test-stock-reduction.ts check <productId>
   ```

2. **Make a test purchase** through your application

3. **Verify the stock was reduced:**
   ```bash
   npx ts-node test-stock-reduction.ts verify <productId> <beforeStock> <quantityPurchased>
   ```

4. **View recent orders for the product:**
   ```bash
   npx ts-node test-stock-reduction.ts orders <productId>
   ```

### Method 2: Using Prisma Studio

1. **Open Prisma Studio:**
   ```bash
   npx prisma studio
   ```

2. **Navigate to the Product table** and note the stock value

3. **Make a test purchase**

4. **Refresh Prisma Studio** and verify the stock decreased by the purchased quantity

### Method 3: Direct Database Query

```bash
# Before purchase
npx prisma db execute --stdin <<< "SELECT id, name, stock FROM Product WHERE id='<productId>';"

# After purchase
npx prisma db execute --stdin <<< "SELECT id, name, stock FROM Product WHERE id='<productId>';"
```

### Method 4: Check Application Logs

When your Next.js app is running, watch for these log messages:

```
✅ Success indicators:
- "Inventory updated and email sent for order: [orderId]"
- "Order created via verification: [orderId]"
- "🎉 Order processing completed successfully"

❌ Error indicators:
- "Stock error for product [productId]"
- "Payment verification error:"
- "Webhook handler failed:"
```

## Complete Test Flow

### Step-by-Step Testing Process

1. **Prepare Test Environment:**
   ```bash
   # Ensure your app is running
   npm run dev

   # Keep logs visible
   tail -f .next/server.log  # if you're logging to file
   ```

2. **Record Initial State:**
   ```bash
   # Note the product ID you want to test
   PRODUCT_ID="your-product-id"

   # Check initial stock
   npx ts-node test-stock-reduction.ts check $PRODUCT_ID
   ```

3. **Perform Test Purchase:**
   - Log into your application
   - Add the product to cart (note the quantity)
   - Complete checkout
   - Use Paystack test card: `4084 0840 8408 4081`
   - CVV: `408`, Expiry: Any future date
   - OTP: `123456`

4. **Wait for Processing:**
   - Payment verification should happen immediately
   - Webhook may take a few seconds

5. **Verify Stock Reduction:**
   ```bash
   # Replace values with your actual data
   npx ts-node test-stock-reduction.ts verify $PRODUCT_ID <before-stock> <quantity-purchased>
   ```

6. **Check Database Consistency:**
   ```bash
   npx ts-node test-stock-reduction.ts orders $PRODUCT_ID
   ```

## What to Look For

### ✅ Successful Stock Reduction

- Stock value decreased by exact quantity purchased
- Order created with status "PAID" or "completed"
- Console logs show "Inventory updated"
- Email confirmation sent

### ❌ Issues to Watch For

1. **Stock not reduced:**
   - Check if order was created in database
   - Verify payment actually succeeded
   - Check logs for errors

2. **Stock reduced multiple times:**
   - Check for duplicate orders with same payment reference
   - This should NOT happen due to duplicate checks

3. **Stock reduced by wrong amount:**
   - Verify cart items metadata is correct
   - Check order items in database

## Advanced Testing

### Test Edge Cases

1. **Multiple Items in Cart:**
   ```bash
   # Add 2+ products to cart
   # After purchase, verify each product's stock reduced correctly
   ```

2. **Insufficient Stock:**
   ```bash
   # Set product stock to 1
   # Try to purchase quantity > 1
   # Should see error: "Stock error for product [id]"
   ```

3. **Webhook vs Verification Race Condition:**
   - Both endpoints check for existing orders
   - Stock should only reduce once even if both fire
   - Check order count: `SELECT COUNT(*) FROM Order WHERE paymentReference = '<ref>'`

### Automated Test Script

You can create an automated test:

```typescript
// test-payment-flow.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStockReduction() {
  // 1. Get product and initial stock
  const product = await prisma.product.findFirst();
  const initialStock = product.stock;

  console.log('Initial stock:', initialStock);

  // 2. Simulate purchase (you'd need to make actual API call)
  // await makePurchase(product.id, 2);

  // 3. Wait for processing
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 4. Verify stock
  const updatedProduct = await prisma.product.findUnique({
    where: { id: product.id }
  });

  const reduction = initialStock - updatedProduct.stock;
  console.log('Stock reduced by:', reduction);
  console.log('Test:', reduction === 2 ? '✅ PASSED' : '❌ FAILED');
}

testStockReduction();
```

## Troubleshooting

### Stock Not Reducing

1. Check payment is actually succeeding:
   ```bash
   # Check order status
   npx prisma studio
   # Navigate to Order table, verify status is "PAID" or "completed"
   ```

2. Check webhook is being called:
   ```bash
   # In your server logs, look for:
   "🔔 Paystack webhook received"
   "✅ Webhook signature verified"
   ```

3. Verify environment variables:
   ```bash
   # Ensure these are set:
   PAYSTACK_SECRET_KEY=sk_test_...
   PAYSTACK_WEBHOOK_SECRET=...
   ```

### Stock Reduced Multiple Times

- Check for duplicate orders:
  ```sql
  SELECT paymentReference, COUNT(*)
  FROM Order
  GROUP BY paymentReference
  HAVING COUNT(*) > 1;
  ```

- This should be prevented by the duplicate check code, but verify it's working

## Manual Database Verification

```sql
-- Check stock changes
SELECT id, name, stock, updatedAt
FROM Product
WHERE id = '<productId>';

-- Check recent orders
SELECT o.id, o.paymentReference, o.status, o.amount, o.createdAt,
       oi.productId, oi.quantity
FROM Order o
JOIN OrderItem oi ON o.id = oi.orderId
WHERE oi.productId = '<productId>'
ORDER BY o.createdAt DESC
LIMIT 5;

-- Verify no duplicate orders
SELECT paymentReference, COUNT(*) as order_count
FROM Order
GROUP BY paymentReference
HAVING COUNT(*) > 1;
```

## Integration Test Example

For automated testing, you can mock the payment flow:

```typescript
// __tests__/stock-reduction.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { prisma } from '@/lib/prisma';

describe('Stock Reduction', () => {
  it('should reduce stock after successful payment', async () => {
    // Create test product
    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        price: 10000,
        stock: 10,
        // ... other fields
      }
    });

    const initialStock = product.stock;

    // Simulate payment verification
    // (You'd call your actual API endpoint here)

    // Verify stock reduced
    const updated = await prisma.product.findUnique({
      where: { id: product.id }
    });

    expect(updated.stock).toBe(initialStock - 2);
  });
});
```

## Monitoring in Production

To monitor stock reduction in production:

1. **Set up logging:**
   ```typescript
   // Add to your webhook handlers
   console.log({
     event: 'stock_reduced',
     productId: item.id,
     quantity: item.quantity,
     orderId: order.id,
     timestamp: new Date().toISOString()
   });
   ```

2. **Create database trigger (optional):**
   ```sql
   -- PostgreSQL example
   CREATE OR REPLACE FUNCTION log_stock_changes()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO stock_audit_log (product_id, old_stock, new_stock, changed_at)
     VALUES (NEW.id, OLD.stock, NEW.stock, NOW());
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER stock_change_trigger
   AFTER UPDATE OF stock ON Product
   FOR EACH ROW
   EXECUTE FUNCTION log_stock_changes();
   ```

3. **Set up alerts** for low stock or negative stock values

## Summary Checklist

- [ ] Stock value decreases after payment
- [ ] Decrease amount matches quantity purchased
- [ ] No duplicate reductions for same order
- [ ] Order record created with correct status
- [ ] Email confirmation sent
- [ ] Console logs show success messages
- [ ] Works for single and multiple items
- [ ] Handles insufficient stock gracefully
- [ ] No race condition issues

---

**Need Help?**
- Check server logs: Look for error messages
- Verify payment status in Paystack dashboard
- Check database for order records
- Ensure webhook endpoint is accessible (use ngrok for local testing)
