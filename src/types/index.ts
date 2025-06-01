export type Product = {
  id: string;
  name: string;
  price: number;
  discount: number | null;
  image: string;
  description: string;
  stock: number;
  brand: string;
  category: string;
  createdAt: Date;
  avgRating: number | null;
  totalReviews: number;
};