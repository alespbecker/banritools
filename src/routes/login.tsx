import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/PageSkeleton";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — BanriTools" },
      { name: "description", content: "Acesse sua conta BanriTools" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: "/dashboard-v3", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Já autenticado: mostra o esqueleto do dashboard enquanto o redirect acontece
  // (ao invés de uma versão skeleton da própria tela de login).
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <PageSkeleton kpis={4} rows={6} />
        </div>
      </div>
    );
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (err: any) {
      setError(err.message || "Erro ao enviar email");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Tempo esgotado. Verifique sua conexão e tente novamente.")), 15000)
    );
    try {
      if (isSignUp) {
        await Promise.race([signUp(email, password, name), timeout]);
        setSuccess("Conta criada! Verifique seu email para confirmar.");
      } else {
        await Promise.race([signIn(email, password), timeout]);
        navigate({ to: "/dashboard-v3", replace: true });
      }
    } catch (err: any) {
      console.error("[login] auth failed:", err);
      setError(err?.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">BanriTools</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isForgot ? "Recuperar senha" : isSignUp ? "Crie sua conta" : "Acesse sua conta"}
          </p>
        </div>

        {isForgot ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="seu@email.com"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-success">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar email de recuperação"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              <button onClick={() => { setIsForgot(false); setError(""); setSuccess(""); }} className="text-primary hover:underline">
                Voltar ao login
              </button>
            </p>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Nome</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required={isSignUp}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Seu nome completo" />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="seu@email.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="text-right">
                  <button type="button" onClick={() => { setIsForgot(true); setError(""); setSuccess(""); }}
                    className="text-xs text-primary hover:underline">
                    Esqueceu a senha?
                  </button>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-success">{success}</p>}

              <button type="submit" disabled={loading}
                className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                {loading ? "Carregando..." : isSignUp ? "Criar Conta" : "Entrar"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }} className="text-primary hover:underline">
                {isSignUp ? "Entrar" : "Criar conta"}
              </button>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Recebeu um código de convite?{" "}
              <a href="/convite" className="text-primary hover:underline" onClick={(e) => { e.preventDefault(); const c = prompt("Digite seu código de convite:"); if (c?.trim()) navigate({ to: "/convite/$code", params: { code: c.trim().toUpperCase() } }); }}>
                Use seu convite
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
