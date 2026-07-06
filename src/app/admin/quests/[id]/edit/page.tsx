import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuestForm } from "@/components/quest-form";
import { updateQuest } from "@/lib/actions/quests";

export default async function EditQuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quest = await prisma.quest.findUnique({ where: { id } });
  if (!quest) notFound();

  const boundUpdateQuest = updateQuest.bind(null, quest.id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Edit quest</h1>
      <QuestForm action={boundUpdateQuest} defaults={quest} submitLabel="Save changes" />
    </main>
  );
}
