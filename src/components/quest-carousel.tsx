"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CarouselQuest = {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  category: string | null;
};

export function QuestCarousel({ quests }: { quests: CarouselQuest[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (quests.length < 2) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % quests.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [quests.length]);

  if (quests.length === 0) return null;

  const active = quests[index];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative flex min-h-[280px] flex-col justify-end p-8 sm:min-h-[360px] sm:p-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,245,245,0.08),transparent_60%)]"
        />
        <div className="relative">
          {active.category && (
            <span className="mb-3 inline-block rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide text-muted">
              {active.category}
            </span>
          )}
          <h2 className="max-w-xl text-2xl font-semibold sm:text-4xl">{active.title}</h2>
          <p className="mt-3 max-w-xl text-muted">{active.description}</p>
          <div className="mt-6 flex items-center gap-4">
            <Link
              href={`/dashboard/quests/${active.id}`}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              View quest
            </Link>
            <span className="text-sm text-muted">{active.pointValue} pts</span>
          </div>
        </div>
      </div>

      {quests.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          {quests.map((quest, i) => (
            <button
              key={quest.id}
              type="button"
              aria-label={`Show quest ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-foreground" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
