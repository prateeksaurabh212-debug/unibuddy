"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookOpen, ClipboardList, GraduationCap, LayoutDashboard, Users } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useLocale } from "@/contexts/LocaleContext";

const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "";

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { data: session } = useSession();
  const isOwner = !!ownerEmail && session?.user?.email === ownerEmail;

  const navItems = [
    { titleKey: "sidebar.myModules", href: "/dashboard/modules", icon: BookOpen },
    { titleKey: "sidebar.myPastTests", href: "/dashboard/past-tests", icon: ClipboardList },
    { titleKey: "sidebar.learnGerman", href: "/dashboard/learn-german", icon: GraduationCap },
  ];

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{t("sidebar.navUnibuddy")}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span>{t("sidebar.home")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>{t("sidebar.navNavigate")}</SidebarGroupLabel>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{t(item.titleKey)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {isOwner && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/users")}>
                <Link href="/dashboard/users">
                  <Users className="h-4 w-4" />
                  <span>{t("sidebar.users")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
