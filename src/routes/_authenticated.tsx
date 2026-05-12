import { createFileRoute, redirect, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Topbar } from "@/components/Topbar";
import { RegisterFAB } from "@/components/RegisterFAB";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { AppLoading } from "@/components/AppLoading";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading, signOut, profile, userRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <AppLoading />;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-[100dvh] bg-background">
      {/* Desktop sidebar */}
      {!isMobile && <DashboardSidebar onSignOut={signOut} theme={theme} onToggleTheme={toggleTheme} userRole={userRole} />}

      {/* Mobile sidebar overlay */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-60 p-0 border-0">
            <VisuallyHidden.Root>
              <SheetTitle>Menu de navegação</SheetTitle>
            </VisuallyHidden.Root>
            <DashboardSidebar
              onSignOut={signOut}
              theme={theme}
              onToggleTheme={toggleTheme}
              onNavigate={() => setSidebarOpen(false)}
              forceExpanded
              userRole={userRole}
            />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          userName={profile?.name ?? null}
          userRole={userRole}
          onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <RegisterFAB />
    </div>
  );
}
