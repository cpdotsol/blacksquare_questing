"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const QuestSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
  instructions: z.string().trim().min(10, "Instructions must be at least 10 characters."),
  pointValue: z.coerce.number().int().min(1, "Points must be at least 1."),
  submissionType: z.enum(["LINK", "TEXT"]),
  category: z.string().trim().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  isFeatured: z.boolean(),
});

export type QuestFormState = { error?: string } | undefined;

function parseQuestForm(formData: FormData) {
  return QuestSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    instructions: formData.get("instructions"),
    pointValue: formData.get("pointValue"),
    submissionType: formData.get("submissionType"),
    category: formData.get("category") || undefined,
    status: formData.get("status"),
    isFeatured: formData.get("isFeatured") === "on",
  });
}

export async function createQuest(
  _prevState: QuestFormState,
  formData: FormData
): Promise<QuestFormState> {
  await requireAdmin();

  const parsed = parseQuestForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.quest.create({ data: parsed.data });

  revalidatePath("/admin/quests");
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect("/admin/quests");
}

export async function updateQuest(
  questId: string,
  _prevState: QuestFormState,
  formData: FormData
): Promise<QuestFormState> {
  await requireAdmin();

  const parsed = parseQuestForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.quest.update({ where: { id: questId }, data: parsed.data });

  revalidatePath("/admin/quests");
  revalidatePath(`/dashboard/quests/${questId}`);
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect("/admin/quests");
}
