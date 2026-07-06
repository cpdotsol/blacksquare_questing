import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await bcrypt.hash("adminpass123", 10);
  const memberPasswordHash = await bcrypt.hash("memberpass123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@blacksquare.test" },
    update: {},
    create: {
      email: "admin@blacksquare.test",
      passwordHash: adminPasswordHash,
      displayName: "BlackSquare Admin",
      role: "ADMIN",
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@blacksquare.test" },
    update: {},
    create: {
      email: "member@blacksquare.test",
      passwordHash: memberPasswordHash,
      displayName: "Test Member",
      role: "MEMBER",
    },
  });

  const questData = [
    {
      title: "Follow BlackSquare on X",
      description: "Follow our official account to stay up to date with news and drops.",
      instructions: "Follow @blacksquare on X, then submit a link to your profile as proof.",
      pointValue: 10,
      submissionType: "LINK" as const,
      status: "ACTIVE" as const,
      isFeatured: true,
      category: "Social",
    },
    {
      title: "Share the launch post",
      description: "Help spread the word by resharing our platform launch announcement.",
      instructions: "Repost our launch announcement and submit a link to your repost.",
      pointValue: 15,
      submissionType: "LINK" as const,
      status: "ACTIVE" as const,
      isFeatured: true,
      category: "Social",
    },
    {
      title: "Introduce yourself",
      description: "Tell the community a bit about yourself in the intros channel.",
      instructions: "Post a short introduction, then paste what you wrote here.",
      pointValue: 5,
      submissionType: "TEXT" as const,
      status: "ACTIVE" as const,
      isFeatured: false,
      category: "Community",
    },
    {
      title: "Write a feedback note",
      description: "Give us feedback on the Questing platform beta.",
      instructions: "Write 2-3 sentences of feedback about your experience so far.",
      pointValue: 8,
      submissionType: "TEXT" as const,
      status: "DRAFT" as const,
      isFeatured: false,
      category: "Feedback",
    },
  ];

  for (const quest of questData) {
    const existing = await prisma.quest.findFirst({ where: { title: quest.title } });
    if (!existing) {
      await prisma.quest.create({ data: quest });
    }
  }

  const introQuest = await prisma.quest.findFirst({ where: { title: "Introduce yourself" } });
  if (introQuest) {
    const existingSubmission = await prisma.submission.findFirst({
      where: { questId: introQuest.id, userId: member.id },
    });
    if (!existingSubmission) {
      await prisma.submission.create({
        data: {
          questId: introQuest.id,
          userId: member.id,
          content: "Hi, I'm the test member — excited to try out the new quests!",
        },
      });
    }
  }

  console.log("Seeded:");
  console.log(`  Admin  -> ${admin.email} / adminpass123`);
  console.log(`  Member -> ${member.email} / memberpass123`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
