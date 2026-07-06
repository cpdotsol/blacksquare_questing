"use client";

import { useActionState } from "react";
import type { QuestFormState } from "@/lib/actions/quests";

type QuestFormAction = (state: QuestFormState, formData: FormData) => Promise<QuestFormState>;

type QuestDefaults = {
  title: string;
  description: string;
  instructions: string;
  pointValue: number;
  submissionType: "LINK" | "TEXT";
  category: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isFeatured: boolean;
};

const emptyQuest: QuestDefaults = {
  title: "",
  description: "",
  instructions: "",
  pointValue: 10,
  submissionType: "LINK",
  category: "",
  status: "DRAFT",
  isFeatured: false,
};

export function QuestForm({
  action,
  defaults = emptyQuest,
  submitLabel,
}: {
  action: QuestFormAction;
  defaults?: QuestDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Title" name="title" defaultValue={defaults.title} required />
      <TextArea label="Description" name="description" defaultValue={defaults.description} required />
      <TextArea
        label="Instructions for members"
        name="instructions"
        defaultValue={defaults.instructions}
        required
        rows={5}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Points"
          name="pointValue"
          type="number"
          min={1}
          defaultValue={String(defaults.pointValue)}
          required
        />
        <Field label="Category (optional)" name="category" defaultValue={defaults.category ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Submission type</span>
          <select
            name="submissionType"
            defaultValue={defaults.submissionType}
            className="rounded-md border border-border bg-transparent px-3 py-2 outline-none focus:border-foreground"
          >
            <option value="LINK">Link</option>
            <option value="TEXT">Text</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Status</span>
          <select
            name="status"
            defaultValue={defaults.status}
            className="rounded-md border border-border bg-transparent px-3 py-2 outline-none focus:border-foreground"
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={defaults.isFeatured} />
        <span>Feature on landing page carousel</span>
      </label>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        className="rounded-md border border-border bg-transparent px-3 py-2 outline-none focus:border-foreground"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  required,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={rows}
        className="rounded-md border border-border bg-transparent px-3 py-2 outline-none focus:border-foreground"
      />
    </label>
  );
}
