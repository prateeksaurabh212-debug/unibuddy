"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export type UserRow = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date | string;
  creditsBalance: number;
  interestedInPremium?: boolean;
  interestedInPro?: boolean;
};

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exportCsv(users: UserRow[]) {
  const header = "Email,Name,Credits,Interested Premium,Interested Pro,Signed up (UTC)\n";
  const rows = users
    .map((u) => {
      const d = typeof u.createdAt === "string" ? new Date(u.createdAt) : u.createdAt;
      const dateStr = d.toISOString();
      const name = (u.name ?? "").replace(/"/g, '""');
      const email = (u.email ?? "").replace(/"/g, '""');
      const premium = u.interestedInPremium ? "Yes" : "No";
      const pro = u.interestedInPro ? "Yes" : "No";
      return `"${email}","${name}",${u.creditsBalance},${premium},${pro},${dateStr}`;
    })
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `studybuddy-users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function UsersTable({ users, isOwner }: { users: UserRow[]; isOwner?: boolean }) {
  const router = useRouter();
  const [editingCredits, setEditingCredits] = useState<string | null>(null);
  const [creditsValue, setCreditsValue] = useState<number>(0);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function saveCredits(userId: string) {
    setSaving(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditsBalance: creditsValue }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditingCredits(null);
      router.refresh();
    } finally {
      setSaving(null);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Permanently delete this user and their data?")) return;
    setDeleting(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  if (users.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No users have signed in yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => exportCsv(users)}>
          Export CSV
        </Button>
      </div>
      <ScrollArea className="w-full rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Credits</th>
              {isOwner && (
                <>
                  <th className="px-4 py-3 text-left font-medium">Interested in Premium</th>
                  <th className="px-4 py-3 text-left font-medium">Interested in Pro</th>
                </>
              )}
              <th className="px-4 py-3 text-left font-medium">Signed up</th>
              {isOwner && (
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.name ?? "—"}</td>
                <td className="px-4 py-3">
                  {isOwner ? (
                    editingCredits === user.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          value={creditsValue}
                          onChange={(e) => setCreditsValue(parseInt(e.target.value, 10) || 0)}
                          className="h-8 w-20"
                        />
                        <Button
                          size="sm"
                          disabled={saving === user.id}
                          onClick={() => saveCredits(user.id)}
                        >
                          {saving === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCredits(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCredits(user.id);
                          setCreditsValue(user.creditsBalance);
                        }}
                        className="inline-flex items-center gap-1 rounded hover:bg-muted/50 px-2 py-1"
                        title="Click to edit credits"
                      >
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{user.creditsBalance}</span>
                      </button>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {user.creditsBalance}
                    </span>
                  )}
                </td>
                {isOwner && (
                  <td className="px-4 py-3 text-center">
                    {user.interestedInPremium ? (
                      <Check className="mx-auto h-5 w-5 text-green-600" aria-label="Yes" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                )}
                {isOwner && (
                  <td className="px-4 py-3 text-center">
                    {user.interestedInPro ? (
                      <Check className="mx-auto h-5 w-5 text-green-600" aria-label="Yes" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                {isOwner && (
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deleting === user.id}
                      onClick={() => deleteUser(user.id)}
                    >
                      {deleting === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
