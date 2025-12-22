export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  sizes: string[];
  colors: string[];
  color_images?: Record<string, string> | null; // Maps color names to image URLs
  in_stock: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  total_amount: number;
  delivery_fee: number;
  promo_code: string | null;
  discount_amount: number;
  status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}
