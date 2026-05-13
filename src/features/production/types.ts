export type MetricType = "quantity" | "amount" | "mixed";

export type FieldType = "number" | "currency" | "integer" | "text" | "select" | "date";

export interface FieldOption {
  value: string;
  label: string;
}

export interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  unit: string | null;
  points_per_unit: number;
  metric_type: MetricType;
  display_order: number;
  active: boolean;
  legacy_field: string | null;
  field_schema: SchemaField[];
}

export type VariantType =
  | "subtype" | "operation_type" | "client_type" | "modality"
  | "brand" | "stage" | "agreement" | "action" | "status"
  | "frequency" | "investment_type" | "machine_type";

export const VARIANT_TYPE_LABEL: Record<VariantType, string> = {
  subtype: "Subtipo",
  operation_type: "Tipo de operação",
  client_type: "Tipo de cliente",
  modality: "Modalidade",
  brand: "Bandeira",
  stage: "Estágio",
  agreement: "Tipo de acordo",
  action: "Ação",
  status: "Status",
  frequency: "Frequência",
  investment_type: "Tipo de investimento",
  machine_type: "Tipo de máquina",
};

export interface ProductVariant {
  id: string;
  product_id: string;
  slug: string;
  name: string;
  variant_type: VariantType;
  legacy_field: string | null;
  display_order: number;
  active: boolean;
}

export interface ProductionEntry {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  entry_date: string;
  quantity: number;
  amount: number | null;
  details: Record<string, unknown>;
  status: string;
  notes: string | null;
  created_at: string;
}
