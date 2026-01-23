export interface Product {
  id: number;
  sno: number;
  category: string;
  description: string;
  quantity_in_hand: number;
  cost: number;
  extra_expenses: number;
  advertisement: number;
  packaging: number;
  shipment: number;
  gst: number;
  return_rate: number;
  margin: number;
  amazon_commission: number;
  meesho_commission: number;
  flipkart_commission: number;
  instagram_commission: number;
  selling_price: number;
  sp_at_stall: number;
  stall_margin: number;
  actual_selling_price: number;
  created_at?: string;
  updated_at?: string;
}

export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at">;

export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}
