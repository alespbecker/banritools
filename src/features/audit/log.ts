import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "production.create" | "production.update" | "production.delete"
  | "goal.create" | "goal.update" | "goal.delete"
  | "role.update"
  | "campaign.create" | "campaign.update" | "campaign.delete"
  | "contact.delete";

export type AuditEntity = "production_entry" | "goal" | "user_role" | "campaign" | "contact";

/**
 * Best-effort audit logger. Never throws — logging failures should not block UX.
 */
export async function logAudit(input: {
  action: AuditAction;
  entity: AuditEntity;
  entity_id?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const actor = userRes.user?.id;
    if (!actor) return;
    const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", actor).maybeSingle();
    await supabase.from("audit_logs").insert({
      actor_id: actor,
      agency_id: profile?.agency_id ?? null,
      action: input.action,
      entity: input.entity,
      entity_id: input.entity_id ?? null,
      details: input.details ?? {},
    });
  } catch {
    // swallow
  }
}
