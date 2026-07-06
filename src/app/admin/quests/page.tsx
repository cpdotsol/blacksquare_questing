import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminQuestsPage() {
  const quests = await prisma.quest.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quests</h1>
        <Link
          href="/admin/quests/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          New quest
        </Link>
      </div>

      {quests.length === 0 ? (
        <p className="text-muted">No quests yet — create the first one.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {quests.map((quest) => (
            <li
              key={quest.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{quest.title}</span>
                  {quest.isFeatured && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                      Featured
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted">
                  {quest.status.toLowerCase()} &middot; {quest.pointValue} pts
                </div>
              </div>
              <Link
                href={`/admin/quests/${quest.id}/edit`}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
