"use client";

import { useActionState } from "react";
import { reviewSubmission } from "@/lib/actions/submissions";

export function ReviewForm({ submissionId }: { submissionId: string }) {
  const [state, action, pending] = useActionState(reviewSubmission, undefined);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="submissionId" value={submissionId} />
      <textarea
        name="reviewNote"
        placeholder="Optional note (shown to the member, e.g. why it was rejected)"
        rows={2}
        className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
      />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="flex gap-2">
        {/* The clicked button's name/value pair is included in the submitted
            FormData, so `decision` arrives correctly without any client state. */}
        <button
          type="submit"
          name="decision"
          value="APPROVED"
          disabled={pending}
          className="rounded-md border border-success/50 px-3 py-1.5 text-sm text-success hover:bg-success/10 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="REJECTED"
          disabled={pending}
          className="rounded-md border border-danger/50 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </form>
  );
}
