"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/session";

const SubmissionSchema = z.object({
  questId: z.string().min(1),
  content: z.string().trim().min(1, "Please provide your submission before sending it in."),
});

export type SubmissionFormState = { error?: string } | undefined;

export async function submitQuest(
  _prevState: SubmissionFormState,
  formData: FormData
): Promise<SubmissionFormState> {
  const user = await requireUser();

  const parsed = SubmissionSchema.safeParse({
    questId: formData.get("questId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { questId, content } = parsed.data;

  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest || quest.status !== "ACTIVE") {
    return { error: "This quest is not currently open for submissions." };
  }

  const existing = await prisma.submission.findFirst({
    where: { questId, userId: user.id, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (existing) {
    return { error: "You've already submitted this quest." };
  }

  await prisma.submission.create({
    data: { questId, userId: user.id, content },
  });

  revalidatePath(`/dashboard/quests/${questId}`);
  revalidatePath("/dashboard");
  redirect(`/dashboard/quests/${questId}`);
}

const ReviewSchema = z.object({
  submissionId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().trim().optional(),
});

export type ReviewFormState = { error?: string } | undefined;

export async function reviewSubmission(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const admin = await requireAdmin();

  const parsed = ReviewSchema.safeParse({
    submissionId: formData.get("submissionId"),
    decision: formData.get("decision"),
    reviewNote: formData.get("reviewNote") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { submissionId, decision, reviewNote } = parsed.data;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { quest: true },
  });

  if (!submission || submission.status !== "PENDING") {
    return { error: "This submission has already been reviewed." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id: submissionId },
      data: {
        status: decision,
        reviewerId: admin.id,
        reviewNote: reviewNote || null,
        reviewedAt: new Date(),
      },
    });

    if (decision === "APPROVED") {
      await tx.pointsLedger.create({
        data: {
          userId: submission.userId,
          submissionId: submission.id,
          amount: submission.quest.pointValue,
        },
      });
    }
  });

  revalidatePath("/admin/review");
  revalidatePath("/dashboard/leaderboard");
  revalidatePath(`/dashboard/quests/${submission.questId}`);
}
