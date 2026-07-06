import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { QuestCard } from "@/components/quest-card";

const FILTERS = ["all", "not_started", "pending", "approved", "rejected"] as const;
type Filter = (typeof FILTERS)[number];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const { status } = await searchParams;
  const filter: Filter = FILTERS.includes(status as Filter) ? (status as Filter) : "all";

  const [quests, submissions] = await Promise.all([
    prisma.quest.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),
    prisma.submission.findMany({ where: { userId: user.id } }),
  ]);

  const submissionByQuest = new Map(submissions.map((s) => [s.questId, s]));

  const visibleQuests = quests.filter((quest) => {
    const submission = submissionByQuest.get(quest.id);
    if (filter === "all") return true;
    if (filter === "not_started") return !submission;
    return submission?.status.toLowerCase() === filter;
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Quests</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/dashboard" : `/dashboard?status=${f}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              filter === f ? "border-foreground text-foreground" : "border-border text-muted"
            }`}
          >
            {f.replace("_", " ")}
          </Link>
        ))}
      </div>

      {visibleQuests.length === 0 ? (
        <p className="text-muted">No quests match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleQuests.map((quest) => {
            const submission = submissionByQuest.get(quest.id);
            return (
              <QuestCard
                key={quest.id}
                id={quest.id}
                title={quest.title}
                description={quest.description}
                pointValue={quest.pointValue}
                category={quest.category}
                href={`/dashboard/quests/${quest.id}`}
                statusLabel={submission?.status}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
