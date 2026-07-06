import { QuestForm } from "@/components/quest-form";
import { createQuest } from "@/lib/actions/quests";

export default function NewQuestPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">New quest</h1>
      <QuestForm action={createQuest} submitLabel="Create quest" />
    </main>
  );
}
