// Payment Options: /src/app/payment-options/page.tsx
export default function PaymentOptions() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Payment Options</h1>
        <ul className="list-disc pl-6">
          <li>Credit/Debit Cards</li>
          <li>Stripe Checkout</li>
          <li>Pay on Delivery (where available)</li>
        </ul>
      </div>
    );
  }