"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/lib/actions/auth";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Join BlackSquare Quests</h1>
      <form action={action} className="flex flex-col gap-4">
        <Field label="Display name" name="displayName" type="text" autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password" name="password" type="password" autoComplete="new-password" />
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already a member?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </main>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="rounded-md border border-border bg-transparent px-3 py-2 outline-none focus:border-foreground"
      />
    </label>
  );
}
