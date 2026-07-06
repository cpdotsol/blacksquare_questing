"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

const SignupSchema = z.object({
  displayName: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const LoginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Password is required."),
});

export type AuthFormState = {
  error?: string;
} | undefined;

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = SignupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { displayName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { displayName, email, passwordHash },
  });

  await createSession(user.id, user.role);
  redirect("/dashboard");
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id, user.role);
  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
