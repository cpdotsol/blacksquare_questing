import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { logout } from "@/lib/actions/auth";

export async function NavBar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/branding/logo.jpg"
            alt="BlackSquare"
            width={28}
            height={28}
            className="rounded-sm"
          />
          <span className="text-sm font-semibold tracking-wide uppercase">
            BlackSquare Quests
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="text-muted hover:text-foreground"
              >
                Dashboard
              </Link>
              {user.role === "MEMBER" && (
                <Link href="/dashboard/leaderboard" className="text-muted hover:text-foreground">
                  Leaderboard
                </Link>
              )}
              <span className="text-muted hidden sm:inline">{user.displayName}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
