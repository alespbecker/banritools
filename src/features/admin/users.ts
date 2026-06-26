import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/features/auth/types";
import type { CargoValue, CargoEspecialidade } from "@/features/auth/cargos";

export interface AgencyUserRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  cargo: CargoValue | null;
  cargo_especialidade: CargoEspecialidade | null;
  avatar_url: string | null;
  agency_id: string | null;
  role: AppRole | null;
}

export interface ProfilePatch {
  name?: string | null;
  phone?: string | null;
  job_title?: string | null;
  cargo?: CargoValue | null;
  cargo_especialidade?: CargoEspecialidade | null;
}

export async function listAgencyUsers(agencyId: string): Promise<AgencyUserRow[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone, job_title, cargo, cargo_especialidade, avatar_url, agency_id")
    .eq("agency_id", agencyId)
    .order("name", { ascending: true });
  if (error) throw error;
  const ids = (profiles ?? []).map((p) => p.id);
  if (ids.length === 0) return [];
  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .in("user_id", ids);
  const roleByUser = new Map<string, AppRole>();
  (roles ?? []).forEach((r) => roleByUser.set(r.user_id, r.role as AppRole));
  return (profiles ?? []).map((p) => ({
    ...(p as Omit<AgencyUserRow, "role">),
    role: roleByUser.get(p.id) ?? null,
  }));
}

export async function updateProfileFields(userId: string, patch: ProfilePatch) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

export async function setUserRole(targetUserId: string, role: AppRole) {
  const { error } = await supabase.rpc("admin_set_user_role", {
    _target_user_id: targetUserId,
    _new_role: role,
  });
  if (error) throw error;
}

export interface ProductionEntryRow {
  id: string;
  entry_date: string;
  quantity: number | null;
  amount: number | null;
  notes: string | null;
  status: string | null;
  product_id: string;
  product_name: string | null;
}

export async function listUserEntries(userId: string): Promise<ProductionEntryRow[]> {
  const { data, error } = await supabase
    .from("production_entries")
    .select("id, entry_date, quantity, amount, notes, status, product_id, products(name)")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map((r: { id: string; entry_date: string; quantity: number | null; amount: number | null; notes: string | null; status: string | null; product_id: string; products: { name: string | null } | null }) => ({
    id: r.id,
    entry_date: r.entry_date,
    quantity: r.quantity,
    amount: r.amount,
    notes: r.notes,
    status: r.status,
    product_id: r.product_id,
    product_name: r.products?.name ?? null,
  }));
}

export interface EntryPatch {
  entry_date?: string;
  quantity?: number | null;
  amount?: number | null;
  notes?: string | null;
  status?: string;
}

export async function updateEntry(id: string, patch: EntryPatch) {
  const { error } = await supabase.from("production_entries").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteEntry(id: string) {
  const { error } = await supabase.from("production_entries").delete().eq("id", id);
  if (error) throw error;
}
