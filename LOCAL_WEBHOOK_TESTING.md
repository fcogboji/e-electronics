# Testing Paystack Webhooks Locally

## Overview

Paystack webhooks require a public URL to send events to. Since your local development server (`localhost:3000`) isn't accessible from the internet, you need to create a tunnel.

## Method 1: Using ngrok (Recommended)

### Step 1: Install ngrok

```bash
# Using Homebrew (macOS)
brew install ngrok

# Or download from https://ngrok.com/download
```

### Step 2: Start Your Development Server

```bash
npm run dev
# Should be running on http://localhost:3000
```

### Step 3: Create ngrok Tunnel

```bash
# In a new terminal window
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       your-account
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the `https://` URL** (e.g., `https://abc123.ngrok.io`)

### Step 4: Configure Paystack Webhook

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings** → **Webhooks**
3. Add your webhook URL:
   ```
   https://abc123.ngrok.io/api/payments/webhook
   ```
   or
   ```
   https://abc123.ngrok.io/api/webhook
   ```
4. Save the webhook URL

### Step 5: Test the Webhook

1. **Make a test payment** through your app
2. **Watch the terminal** where your app is running for logs:
   ```
   🔔 Paystack webhook received
   ✅ Webhook signature verified
   💾 Creating order with data: ...
   🎉 Order processing completed successfully
   ```

3. **Check ngrok inspector** at `http://127.0.0.1:4040`
   - Shows all HTTP requests
   - You can inspect webhook payload
   - Replay requests

### Step 6: Verify Stock Reduction

```bash
# In another terminal
npx ts-node test-stock-reduction.ts orders <productId>
```

---

## Method 2: Using Paystack CLI (Alternative)

Paystack provides a CLI tool for webhook testing:

### Step 1: Install Paystack CLI

```bash
npm install -g @paystack/cli
# or
yarn global add @paystack/cli
```

### Step 2: Login to Paystack

```bash
paystack login
```

### Step 3: Forward Webhooks

```bash
paystack webhooks forward --port 3000 --path /api/payments/webhook
```

This forwards webhook events directly to your local server.

---

## Method 3: Using Cloudflare Tunnel (Free Alternative to ngrok)

### Step 1: Install Cloudflare Tunnel

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Or download from https://github.com/cloudflare/cloudflared
```

### Step 2: Create Tunnel

```bash
cloudflared tunnel --url http://localhost:3000
```

You'll get a URL like: `https://xyz.trycloudflare.com`

### Step 3: Use this URL in Paystack

Add to Paystack webhook settings:
```
https://xyz.trycloudflare.com/api/payments/webhook
```

---

## Complete Testing Workflow

### Setup (One-time)

1. **Install ngrok:**
   ```bash
   brew install ngrok
   ```

2. **Set up webhook secret** (if not already):
   ```bash
   # In your .env.local
   PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_from_paystack
   PAYSTACK_SECRET_KEY=sk_test_your_secret_key
   ```

### Every Test Session

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Start ngrok** (in new terminal):
   ```bash
   ngrok http 3000
   ```

3. **Copy ngrok URL** and update Paystack webhook settings

4. **Run test:**
   ```bash
   # Terminal 1: Watch your app logs
   npm run dev

   # Terminal 2: Monitor ngrok requests
   # Open http://127.0.0.1:4040 in browser

   # Terminal 3: Check stock before purchase
   npx ts-node test-stock-reduction.ts check <productId>
   ```

5. **Make payment** through your app

6. **Verify results:**
   ```bash
   # Check if stock reduced
   npx ts-node test-stock-reduction.ts verify <productId> <beforeStock> <quantityPurchased>
   ```

---

## Debugging Webhooks

### View Webhook Events in Paystack Dashboard

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Logs** → **Event Logs**
3. Filter by event type: `charge.success`
4. Check delivery status

### Check ngrok Inspector

1. Open `http://127.0.0.1:4040` in browser
2. See all requests to your local server
3. View webhook payload:
   ```json
   {
     "event": "charge.success",
     "data": {
       "reference": "ref_123456",
       "amount": 1000000,
       "metadata": {
         "cartItems": "[...]",
         "userId": "..."
       }
     }
   }
   ```

### Check Your Server Logs

Look for these log messages:

```bash
# Webhook received
🔔 Paystack webhook received

# Signature verified
✅ Webhook signature verified

# Processing
💾 Creating order with data: ...

# Success
🎉 Order processing completed successfully
✅ Order created with ID: ...
Inventory updated and email sent for order: ...
```

### Common Issues

#### 1. Webhook Not Received

**Problem:** No webhook logs in your app

**Solutions:**
- Verify ngrok is running: `curl https://your-ngrok-url.ngrok.io`
- Check Paystack webhook URL is correct
- Check ngrok didn't restart (URL changes on restart)
- Verify payment actually completed

#### 2. Signature Verification Failed

**Problem:** See `❌ Webhook signature verification failed`

**Solutions:**
```bash
# Check webhook secret is correct
echo $PAYSTACK_WEBHOOK_SECRET

# Get correct secret from Paystack Dashboard → Settings → Webhooks
# Update .env.local
PAYSTACK_WEBHOOK_SECRET=the_correct_secret

# Restart your dev server
npm run dev
```

#### 3. Stock Not Reducing

**Problem:** Webhook received but stock unchanged

**Solutions:**
- Check for error logs in terminal
- Verify product ID exists in database
- Check if order was created: `npx prisma studio`
- Look for "Stock error" messages
- Verify userId is valid

#### 4. Multiple Reductions

**Problem:** Stock reduced twice for same order

**Solutions:**
- Should not happen due to duplicate checks
- Check database for duplicate orders:
  ```sql
  SELECT paymentReference, COUNT(*)
  FROM "Order"
  GROUP BY paymentReference
  HAVING COUNT(*) > 1;
  ```
- Verify both webhook endpoints aren't configured

---

## Manual Webhook Testing (Without Payment)

You can manually trigger webhook events:

### Using curl

```bash
# Get the webhook secret
WEBHOOK_SECRET="your_webhook_secret"

# Create test payload
PAYLOAD='{
  "event": "charge.success",
  "data": {
    "reference": "test_ref_123",
    "amount": 1000000,
    "customer": {
      "email": "test@example.com"
    },
    "metadata": {
      "cartItems": "[{\"id\":\"product_id\",\"quantity\":2,\"price\":50000,\"name\":\"Test Product\"}]",
      "specifications": "{}",
      "userId": "user_123",
      "customerName": "Test User",
      "customerEmail": "test@example.com"
    },
    "paid_at": "2024-01-01T00:00:00.000Z",
    "channel": "card"
  }
}'

# Generate signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha512 -hmac "$WEBHOOK_SECRET" | awk '{print $2}')

# Send webhook
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Using the Test Script

Create a manual webhook trigger script:

```typescript
// test-webhook.ts
import crypto from 'crypto';

const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET!;
const webhookUrl = 'http://localhost:3000/api/webhook';

async function sendTestWebhook() {
  const payload = {
    event: 'charge.success',
    data: {
      reference: `test_${Date.now()}`,
      amount: 1000000,
      customer: { email: 'test@example.com' },
      metadata: {
        cartItems: JSON.stringify([{
          id: 'your_product_id',
          quantity: 2,
          price: 50000,
          name: 'Test Product'
        }]),
        specifications: JSON.stringify({}),
        userId: 'test_user_id',
        customerName: 'Test User',
        customerEmail: 'test@example.com'
      },
      paid_at: new Date().toISOString(),
      channel: 'card'
    }
  };

  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha512', webhookSecret)
    .update(payloadString)
    .digest('hex');

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-paystack-signature': signature,
    },
    body: payloadString,
  });

  console.log('Response:', await response.text());
}

sendTestWebhook();
```

Run it:
```bash
npx ts-node test-webhook.ts
```

---

## Best Practices

### 1. Use ngrok Auth Token (Free)

Prevents URL changes:
```bash
# Sign up at ngrok.com and get auth token
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Start with custom subdomain (requires paid plan)
ngrok http 3000 --subdomain=myapp
```

### 2. Keep ngrok Running

- Use tmux or screen to keep ngrok running
- Or use ngrok as a service

### 3. Test Multiple Scenarios

```bash
# Single item purchase
# Multiple items
# Different quantities
# Edge cases (low stock)
```

### 4. Monitor All Three Points

1. **Browser/App:** Payment completion
2. **Server logs:** Webhook processing
3. **Database:** Stock changes and orders

### 5. Use Different Webhook Endpoints

Test each endpoint separately:
- `/api/webhook` - Primary webhook
- `/api/payments/webhook` - Secondary webhook
- `/api/payments/verify` - Manual verification

---

## Quick Reference Commands

```bash
# Start development
npm run dev

# Start ngrok
ngrok http 3000

# Check stock before
npx ts-node test-stock-reduction.ts check <productId>

# Make test payment (use these test cards)
# Card: 4084 0840 8408 4081
# CVV: 408
# Expiry: 12/25
# OTP: 123456

# Check stock after
npx ts-node test-stock-reduction.ts verify <productId> <before> <quantity>

# View orders
npx ts-node test-stock-reduction.ts orders <productId>

# Check ngrok inspector
open http://127.0.0.1:4040
```

---

## Troubleshooting Checklist

- [ ] ngrok is running and shows forwarding URL
- [ ] Dev server is running on port 3000
- [ ] Webhook URL updated in Paystack dashboard
- [ ] PAYSTACK_WEBHOOK_SECRET is set correctly
- [ ] Payment completes successfully
- [ ] Webhook received (check logs)
- [ ] Signature verified (no 401 errors)
- [ ] Order created in database
- [ ] Stock reduced correctly
- [ ] Email sent (check logs)

---

**Pro Tip:** Keep a terminal window with this running to monitor everything:
```bash
npm run dev 2>&1 | grep -E "(webhook|stock|order|Inventory)"
```
