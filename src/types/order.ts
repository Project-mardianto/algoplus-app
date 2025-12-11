export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  type: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'arrived'
  | 'completed';

export interface Order {
  id: number;
  created_at: string; 
  total_amount: number;
  status: OrderStatus;
  user_id: string;
  driver_id?: string;
  shipping_address: string;

  order_items: CartItem[];
  profiles?: { 
    full_name: string;
    address: string;
    phone: string;
  } | null;
  driver?: {
    id: string;
    full_name: string;
    avatar_url: string;
  } | null;
}

export interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  phone: string;
  vehicleNumber: string;
}
