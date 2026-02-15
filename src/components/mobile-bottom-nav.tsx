"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, ClipboardList } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, key: "home" as const },
  { href: "/dashboard/modules", icon: BookOpen, key: "myModules" as const },
  { href: "/dashboard/past-tests", icon: ClipboardList, key: "myPastTests" as const },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-white/10 bg-background/95 backdrop-blur-xl pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] md:hidden">
      {navItems.map(({ href, icon: Icon, key }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`h-6 w-6 ${isActive ? "text-primary" : ""}`} />
            <span>{t(`sidebar.${key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
