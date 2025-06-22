// types/index.ts

// Represents a single product
export type Product = {
  id: string;
  name: string;
  price: number; // in kobo/lowest unit if you're using Stripe/NGN
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

// Represents a single item in an order
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// Represents a customer's full order
export interface Order {
  id: string;
  amount: number; // total before discount or tax, if any
  total: number;  // final total amount (used in OrdersTable)
  status: string; // e.g. 'pending', 'shipped', 'delivered'
  customerName?: string;
  email: string;
  phone?: string;
  orderItems: OrderItem[];
  createdAt: string | Date;
}

// Represents pagination data for order listings or products
export interface PaginationData {
  total: number;       // total number of items
  totalPages: number;  // total pages based on limit
  limit: number;       // items per page
}
