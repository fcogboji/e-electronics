// utils/format.ts
export const formatAmount = (amount: number): string =>
  `₦${(amount / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export const formatDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
