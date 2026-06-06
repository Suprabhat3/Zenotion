import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getSidebarData } from "@/lib/notes";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sidebar = await getSidebarData(user.id);

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3 clay-surface">
        <Link href="/dashboard" className="text-lg font-semibold">
          Zenotion
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu
            name={user.name}
            email={user.email}
            image={user.image}
          />
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <AppSidebar sidebar={sidebar} />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
