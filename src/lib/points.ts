import { prisma } from "@/lib/prisma";

export async function getTotalPoints(userId: string) {
  const result = await prisma.pointsLedger.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getLeaderboard(limit = 20) {
  const grouped = await prisma.pointsLedger.groupBy({
    by: ["userId"],
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, displayName: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.displayName]));

  return grouped.map((g) => ({
    userId: g.userId,
    displayName: userMap.get(g.userId) ?? "Unknown member",
    totalPoints: g._sum.amount ?? 0,
  }));
}
