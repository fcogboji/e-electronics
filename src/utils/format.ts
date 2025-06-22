// utils/format.ts
export const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount / 100);

export const formatDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
