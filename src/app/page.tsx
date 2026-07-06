import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLeaderboard } from "@/lib/points";
import { QuestCarousel } from "@/components/quest-carousel";
import { QuestCard } from "@/components/quest-card";

export default async function Home() {
  const [featuredQuests, activeQuests, leaderboard, memberCount, approvedCount] =
    await Promise.all([
      prisma.quest.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.quest.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 9,
      }),
      getLeaderboard(5),
      prisma.user.count({ where: { role: "MEMBER" } }),
      prisma.submission.count({ where: { status: "APPROVED" } }),
    ]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <section className="mb-12">
        <QuestCarousel quests={featuredQuests} />
      </section>

      <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Members" value={memberCount} />
        <Stat label="Quests completed" value={approvedCount} />
        <Stat label="Active quests" value={activeQuests.length} />
        <Stat label="Signal" value="No noise" isText />
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active quests</h2>
          <Link href="/signup" className="text-sm text-muted hover:text-foreground">
            Sign up to take part &rarr;
          </Link>
        </div>
        {activeQuests.length === 0 ? (
          <p className="text-muted">No active quests right now — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                id={quest.id}
                title={quest.title}
                description={quest.description}
                pointValue={quest.pointValue}
                category={quest.category}
                href="/signup"
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <p className="text-muted">No points awarded yet — be the first.</p>
        ) : (
          <ol className="divide-y divide-border rounded-xl border border-border bg-surface">
            {leaderboard.map((entry, i) => (
              <li key={entry.userId} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm">
                  <span className="mr-3 text-muted">#{i + 1}</span>
                  {entry.displayName}
                </span>
                <span className="text-sm font-medium">{entry.totalPoints} pts</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, isText }: { label: string; value: number | string; isText?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className={isText ? "text-lg font-semibold" : "text-2xl font-semibold"}>{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
