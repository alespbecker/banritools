import { createFileRoute, redirect, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Topbar } from "@/components/Topbar";
import { RegisterFAB } from "@/components/RegisterFAB";
import { ScrollToTopFAB } from "@/components/ScrollToTopFAB";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { AppLoading } from "@/components/AppLoading";
import { cn } from "@/lib/utils";

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
    <div className="relative flex h-[100dvh] bg-background">
      {/* Desktop floating sidebar */}
      {!isMobile && (
        <div className="absolute left-3 top-3 bottom-3 z-40">
          <DashboardSidebar onSignOut={signOut} theme={theme} onToggleTheme={toggleTheme} userRole={userRole} />
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-60 p-0 border-0 bg-sidebar/85 backdrop-blur-md top-2 bottom-2 left-2 rounded-2xl h-auto duration-200 [will-change:transform]">
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

      <div className={cn("flex flex-1 flex-col overflow-hidden", !isMobile && "pl-[80px]")}>
        <Topbar
          userName={profile?.name ?? null}
          userRole={userRole}
          onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined}
        />
        <main data-app-scroll className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <RegisterFAB />
      <ScrollToTopFAB />
    </div>
  );
}
