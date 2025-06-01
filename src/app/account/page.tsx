// --- MY ACCOUNT ---
// File: /src/app/account/page.tsx
"use client";
import { useUser } from "@clerk/nextjs";

export default function MyAccountPage() {
  const { user } = useUser();

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>
      <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
      <p><strong>Username:</strong> {user.username || user.firstName}</p>
    </div>
  );
}