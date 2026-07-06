import { getLeaderboard } from "@/lib/points";
import { requireUser } from "@/lib/session";

export default async function LeaderboardPage() {
  const user = await requireUser();
  const leaderboard = await getLeaderboard(50);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Leaderboard</h1>
      {leaderboard.length === 0 ? (
        <p className="text-muted">No points awarded yet — be the first.</p>
      ) : (
        <ol className="divide-y divide-border rounded-xl border border-border bg-surface">
          {leaderboard.map((entry, i) => (
            <li
              key={entry.userId}
              className={`flex items-center justify-between px-5 py-3 ${
                entry.userId === user.id ? "bg-white/5" : ""
              }`}
            >
              <span className="text-sm">
                <span className="mr-3 text-muted">#{i + 1}</span>
                {entry.displayName}
                {entry.userId === user.id && (
                  <span className="ml-2 text-xs text-muted">(you)</span>
                )}
              </span>
              <span className="text-sm font-medium">{entry.totalPoints} pts</span>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
