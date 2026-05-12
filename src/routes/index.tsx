import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AppLoading } from "@/components/AppLoading";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AppLoading />;
  return <Navigate to={isAuthenticated ? "/dashboard-v3" : "/login"} />;
}
