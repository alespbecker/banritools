import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { KeyRound, Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { CargoSelect, type CargoSelectValue } from "@/features/auth/CargoSelect";

export const Route = createFileRoute("/primeiro-acesso")({
  head: () => ({
    meta: [
      { title: "Primeiro acesso — BanriTools" },
      {
        name: "description",
        content:
          "Já tem um código de convite? Entre com ele. Ainda não tem? Solicite seu acesso ao BanriTools.",
      },
      { property: "og:title", content: "Primeiro acesso — BanriTools" },
      {
        property: "og:description",
        content: "Use seu código de convite ou solicite acesso ao BanriTools.",
      },
    ],
  }),
  component: PrimeiroAcessoPage,
});

const requestSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  agency_name: z.string().trim().min(2, "Informe sua agência").max(120),
  cargo: z.string().min(1, "Selecione seu cargo"),
  cargo_especialidade: z.string().max(10).optional(),
  message: z.string().max(500).optional(),
});

function PrimeiroAcessoPage() {
  const navigate = useNavigate();

  // Bloco A — código
  const [code, setCode] = useState("");
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) return;
    navigate({ to: "/convite/$code", params: { code: trimmed } });
  };

  // Bloco B — solicitação
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [cargo, setCargo] = useState<CargoSelectValue>({ cargo: "", especialidade: "" });
  const [cargoError, setCargoError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setCargoError("");

    const parsed = requestSchema.safeParse({
      name,
      email,
      agency_name: agencyName,
      cargo: cargo.cargo,
      cargo_especialidade: cargo.especialidade,
      message,
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      if (first.path[0] === "cargo") setCargoError(first.message);
      else setFormError(first.message);
      return;
    }
    if (cargo.cargo === "gerente_mercado" && !cargo.especialidade) {
      setCargoError("Selecione PJ ou PF");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("invite_requests").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      agency_name: parsed.data.agency_name,
      cargo: parsed.data.cargo,
      cargo_especialidade: cargo.especialidade || null,
      message: parsed.data.message || null,
    });
    setSubmitting(false);

    if (error) {
      setFormError("Não foi possível enviar sua solicitação. Tente novamente.");
      return;
    }
    setSuccess(true);
    setName("");
    setEmail("");
    setAgencyName("");
    setCargo({ cargo: "", especialidade: "" });
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={56} className="rounded-md" />
          <h1
            className="mt-3 text-2xl font-[450] tracking-[0.048em] text-foreground"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            banritools
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Primeiro acesso</p>
        </div>

        {/* Bloco A */}
        <section className="mb-6 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Já tenho um código de convite
            </h2>
          </div>
          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={12}
              placeholder="Ex.: A1B2C3D4"
              className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-center font-mono text-lg tracking-[0.3em] text-foreground uppercase focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Código de convite"
            />
            <button
              type="submit"
              className="h-11 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              disabled={code.trim().length < 4}
            >
              Continuar
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Você criará ou entrará na sua conta em seguida para ativar o convite.
          </p>
        </section>

        {/* Bloco B */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Ainda não tenho convite
            </h2>
          </div>

          {success ? (
            <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-foreground">
              <p className="font-medium">Solicitação enviada!</p>
              <p className="mt-1 text-muted-foreground">
                Um administrador vai revisar seu pedido. Quando aprovado, você receberá o
                código de convite por email ou diretamente pelo seu gerente.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Enviar outra solicitação
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Nome completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Email corporativo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={255}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="voce@banrisul.com.br"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Agência</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  required
                  maxLength={120}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Nome ou número da sua agência"
                />
              </div>

              <CargoSelect
                value={cargo}
                onChange={(v) => { setCargo(v); setCargoError(""); }}
                error={cargoError}
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Mensagem <span className="text-muted-foreground">(opcional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Alguma observação para o administrador?"
                />
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Enviando..." : "Solicitar convite"}
              </button>
            </form>
          )}
        </section>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <Link to="/login" className="text-primary hover:underline">
            Já tenho conta — Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
