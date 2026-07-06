import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getTotalPoints } from "@/lib/points";
import { StatusBadge } from "@/components/quest-card";

export default async function ProfilePage() {
  const user = await requireUser();

  const [totalPoints, submissions] = await Promise.all([
    getTotalPoints(user.id),
    prisma.submission.findMany({
      where: { userId: user.id },
      include: { quest: true },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold">{user.displayName}</h1>
      <p className="text-muted">{user.email}</p>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <div className="text-3xl font-semibold">{totalPoints}</div>
        <div className="text-xs uppercase tracking-wide text-muted">Total points</div>
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Submission history</h2>
      {submissions.length === 0 ? (
        <p className="text-muted">You haven&apos;t submitted any quests yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {submissions.map((submission) => (
            <li
              key={submission.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
            >
              <div>
                <div className="text-sm font-medium">{submission.quest.title}</div>
                <div className="text-xs text-muted">
                  {submission.submittedAt.toLocaleDateString()}
                </div>
              </div>
              <StatusBadge label={submission.status} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
