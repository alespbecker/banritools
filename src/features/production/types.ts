export type MetricType = "quantity" | "amount" | "mixed";

export interface Product {
  id: string;
  name: string;
  category: string | null;
  unit: string | null;
  points_per_unit: number;
  metric_type: MetricType;
  display_order: number;
  active: boolean;
}

export interface ProductionEntry {
  id: string;
  user_id: string;
  product_id: string;
  entry_date: string;
  quantity: number;
  amount: number | null;
  status: string;
  notes: string | null;
  created_at: string;
}
