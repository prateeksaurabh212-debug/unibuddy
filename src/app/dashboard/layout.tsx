"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { SidebarHeader, SidebarContent } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DashboardHeaderUser } from "@/components/dashboard-header-user";
import { Logo } from "@/components/logo";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { update: updateSession } = useSession();
  const hasSynced = useRef(false);
  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;
    fetch("/api/sync-user")
      .then(() => updateSession())
      .catch(() => {});
  }, [updateSession]);

  return (
    <LocaleProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="border-b border-white/10 bg-sidebar/90 backdrop-blur-xl">
            <div className="flex items-center gap-2 px-4 py-3">
              <SidebarTrigger />
              <Logo className="text-[1.3rem]" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <AppSidebar />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center justify-between gap-2 border-b border-white/10 bg-background/80 backdrop-blur-xl px-4 pt-[env(safe-area-inset-top)]">
            <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-initial md:flex-none">
              <SidebarTrigger className="md:hidden" />
              <Logo className="shrink-0 text-lg md:hidden" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LanguageSwitcher />
              <DashboardHeaderUser />
            </div>
          </header>
          <div className="flex-1 bg-grid-subtle px-4 py-4 pb-[max(6rem,calc(6rem+env(safe-area-inset-bottom)))] md:py-6 md:pb-6">{children}</div>
          <MobileBottomNav />
        </SidebarInset>
      </SidebarProvider>
    </LocaleProvider>
  );
}
