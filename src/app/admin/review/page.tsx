import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/review-form";

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ questId?: string }>;
}) {
  const { questId } = await searchParams;

  const [submissions, quests] = await Promise.all([
    prisma.submission.findMany({
      where: { status: "PENDING", ...(questId ? { questId } : {}) },
      include: { quest: true, user: true },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.quest.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Review queue</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/review"
          className={`rounded-full border px-3 py-1 text-sm ${
            !questId ? "border-foreground text-foreground" : "border-border text-muted"
          }`}
        >
          All quests
        </Link>
        {quests.map((quest) => (
          <Link
            key={quest.id}
            href={`/admin/review?questId=${quest.id}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              questId === quest.id ? "border-foreground text-foreground" : "border-border text-muted"
            }`}
          >
            {quest.title}
          </Link>
        ))}
      </div>

      {submissions.length === 0 ? (
        <p className="text-muted">Nothing waiting on review. Nicely caught up.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {submissions.map((submission) => (
            <li key={submission.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{submission.quest.title}</div>
                  <div className="text-xs text-muted">
                    {submission.user.displayName} ({submission.user.email}) &middot;{" "}
                    {submission.submittedAt.toLocaleString()}
                  </div>
                </div>
                <span className="text-sm font-medium">{submission.quest.pointValue} pts</span>
              </div>
              <p className="mb-4 break-words rounded-md bg-background/60 p-3 text-sm">
                {submission.content}
              </p>
              <ReviewForm submissionId={submission.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
