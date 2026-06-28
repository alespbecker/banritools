import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AppLoading } from "@/components/AppLoading";
import { Landing } from "@/features/marketing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "banritools — sua produção, em tempo real" },
      {
        name: "description",
        content:
          "Plataforma interna Banrisul para registro de produção, ranking, metas e relatórios da agência em tempo real.",
      },
      { property: "og:title", content: "banritools — sua produção, em tempo real" },
      {
        property: "og:description",
        content:
          "Registro rápido, painel da agência, ranking e relatórios prontos para reunião.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AppLoading />;
  if (isAuthenticated) return <Navigate to="/dashboard-v3" />;
  return <Landing />;
}
