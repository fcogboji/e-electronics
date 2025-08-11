"use client";

import { ClerkProvider } from '@clerk/nextjs';
import ToasterProvider from '@/components/ToasterProvider';
import React from 'react';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <>
        <ToasterProvider />
        {children}
      </>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ToasterProvider />
      {children}
    </ClerkProvider>
  );
}