export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: string;
  unit?: string; // e.g., gallon, pack
}
