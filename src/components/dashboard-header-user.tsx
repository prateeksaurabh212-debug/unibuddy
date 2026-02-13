"use client";

import { signOut, useSession } from "next-auth/react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardHeaderUser() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const user = session?.user;
  const name = user?.name ?? user?.email ?? "User";
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const credits = user?.credits ?? 0;

  if (status === "unauthenticated") return null;

  return (
    <div className="flex items-center gap-2">
      {!isLoading && (
        <span
          className="relative inline-flex h-6 w-6 items-center justify-center"
          title={`${credits} credits`}
        >
          <Star className="absolute h-6 w-6 fill-amber-400 text-amber-400" aria-hidden />
          <span className="relative z-10 text-[11px] font-bold tabular-nums text-amber-950">
            {credits}
          </span>
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0" aria-label="Account menu">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? undefined} alt={name} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {isLoading ? "…" : initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {user && (
            <>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{name}</span>
                  {user.email && (
                    <span className="text-muted-foreground text-xs font-normal">
                      {user.email}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
