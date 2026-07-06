"use client";

import { useActionState } from "react";
import { submitQuest } from "@/lib/actions/submissions";

export function SubmissionForm({
  questId,
  submissionType,
}: {
  questId: string;
  submissionType: "LINK" | "TEXT";
}) {
  const [state, action, pending] = useActionState(submitQuest, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="questId" value={questId} />
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted">
          {submissionType === "LINK" ? "Link to your proof" : "Your submission"}
        </span>
        {submissionType === "LINK" ? (
          <input
            name="content"
            type="url"
            placeholder="https://…"
            required
            className="rounded-md border border-border bg-transparent px-3 py-2 outline-none focus:border-foreground"
          />
        ) : (
          <textarea
            name="content"
            rows={4}
            required
            className="rounded-md border border-border bg-transparent px-3 py-2 outline-none focus:border-foreground"
          />
        )}
      </label>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
