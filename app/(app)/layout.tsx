import { BrandLogo } from "@/components/brand-logo";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getSidebarData } from "@/lib/notes";
import { AppShell } from "@/components/app-shell";
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
    <div className="flex min-h-svh flex-col clay-page-bg">
      <header className="clay-header flex items-center justify-between px-4 py-3 sm:px-6">
        <BrandLogo href="/dashboard" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu
            name={user.name}
            email={user.email}
            image={user.image}
          />
        </div>
      </header>
      <AppShell sidebar={sidebar}>{children}</AppShell>
    </div>
  );
}
