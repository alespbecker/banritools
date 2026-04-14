import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";

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
  const { signIn, signUp, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-foreground">Você já está logado.</p>
          <Link to="/dashboard" className="mt-2 inline-block text-sm text-primary hover:underline">
            Ir para o Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name);
        setSuccess("Conta criada! Verifique seu email para confirmar.");
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao autenticar");
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
            {isSignUp ? "Crie sua conta" : "Acesse sua conta"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Seu nome completo"
              />
            </div>
          )}
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-success">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Carregando..." : isSignUp ? "Criar Conta" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }}
            className="text-primary hover:underline"
          >
            {isSignUp ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>
    </div>
  );
}
