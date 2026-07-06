import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { StatusBadge } from "@/components/quest-card";
import { SubmissionForm } from "@/components/submission-form";

export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const quest = await prisma.quest.findUnique({ where: { id } });
  if (!quest) notFound();

  const submission = await prisma.submission.findFirst({
    where: { questId: id, userId: user.id },
    orderBy: { submittedAt: "desc" },
  });

  const canSubmit = quest.status === "ACTIVE" && (!submission || submission.status === "REJECTED");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        {quest.category && (
          <span className="text-xs uppercase tracking-wide text-muted">{quest.category}</span>
        )}
        <span className="text-sm font-medium">{quest.pointValue} pts</span>
      </div>

      <h1 className="text-2xl font-semibold">{quest.title}</h1>
      <p className="mt-3 text-muted">{quest.description}</p>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          How to complete this quest
        </h2>
        <p className="whitespace-pre-wrap text-sm">{quest.instructions}</p>
      </div>

      <div className="mt-8">
        {submission && (
          <div className="mb-4 rounded-xl border border-border bg-surface p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold">Your submission</span>
              <StatusBadge label={submission.status} />
            </div>
            <p className="break-words text-sm text-muted">{submission.content}</p>
            {submission.reviewNote && (
              <p className="mt-3 text-sm">
                <span className="font-medium">Reviewer note: </span>
                {submission.reviewNote}
              </p>
            )}
          </div>
        )}

        {canSubmit ? (
          <SubmissionForm questId={quest.id} submissionType={quest.submissionType} />
        ) : quest.status !== "ACTIVE" ? (
          <p className="text-sm text-muted">This quest is not currently open for submissions.</p>
        ) : null}
      </div>
    </main>
  );
}
