import { prisma } from "@/lib/prisma";
import { getTotalPoints } from "@/lib/points";
import { requireAdmin } from "@/lib/session";
import { setUserRole } from "@/lib/actions/users";

export default async function AdminMembersPage() {
  const currentAdmin = await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { submissions: true } } },
  });

  const points = await Promise.all(users.map((u) => getTotalPoints(u.id)));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Members</h1>

      <ul className="flex flex-col gap-3">
        {users.map((user, i) => (
          <li
            key={user.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
          >
            <div>
              <div className="text-sm font-semibold">
                {user.displayName}{" "}
                <span className="ml-1 text-xs font-normal uppercase text-muted">{user.role}</span>
              </div>
              <div className="text-xs text-muted">
                {user.email} &middot; {points[i]} pts &middot; {user._count.submissions} submissions
              </div>
            </div>

            {user.id !== currentAdmin.id && (
              <form action={setUserRole}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="role" value={user.role === "ADMIN" ? "MEMBER" : "ADMIN"} />
                <button
                  type="submit"
                  className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground"
                >
                  {user.role === "ADMIN" ? "Demote to member" : "Promote to reviewer"}
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
