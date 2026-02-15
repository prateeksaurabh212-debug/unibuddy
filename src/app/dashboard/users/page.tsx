import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/users-table";

export default async function DashboardUsersPage() {
  const session = await getServerSession(authOptions);
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!session?.user?.email || !ownerEmail || session.user.email !== ownerEmail) {
    redirect("/dashboard");
  }

  let users: Array<{
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: Date;
    creditsBalance: number;
    interestedInPremium: boolean;
    interestedInPro: boolean;
  }>;
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        creditsBalance: true,
        interestedInPremium: true,
        interestedInPro: true,
      },
    });
  } catch (err) {
    console.error("[Dashboard Users] prisma.user.findMany failed:", err);
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Users (email list)</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              Could not load users. This is often a database connection issue on the server. Check Vercel logs (Deployments → your deployment → Functions / Runtime Logs) for details.
            </p>
            <p className="mt-2 text-muted-foreground text-sm">
              Error: {err instanceof Error ? err.message : String(err)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users (email list)</h1>
        <p className="text-muted-foreground text-sm">
          Everyone who has signed in with Google. Use this list to build your email list.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All signed-in users</CardTitle>
          <CardDescription>
            {users.length} user{users.length !== 1 ? "s" : ""} total. Export as CSV below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} isOwner />
        </CardContent>
      </Card>
    </div>
  );
}
