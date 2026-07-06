"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function setUserRole(formData: FormData) {
  const admin = await requireAdmin();

  const userId = formData.get("userId");
  const role = formData.get("role");
  if (typeof userId !== "string" || (role !== "ADMIN" && role !== "MEMBER")) {
    return;
  }

  if (userId === admin.id) {
    // Prevent an admin from locking themselves out of the admin panel.
    return;
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/members");
}
