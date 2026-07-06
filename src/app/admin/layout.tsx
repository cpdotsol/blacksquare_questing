import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border">
        <nav className="mx-auto flex max-w-6xl gap-6 px-6 py-3 text-sm">
          <Link href="/admin/review" className="text-muted hover:text-foreground">
            Review queue
          </Link>
          <Link href="/admin/quests" className="text-muted hover:text-foreground">
            Quests
          </Link>
          <Link href="/admin/members" className="text-muted hover:text-foreground">
            Members
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
