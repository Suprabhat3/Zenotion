import { SiteHeaderClient } from "@/components/site-header-client";
import { AppShell } from "@/components/app-shell";
import { PostHogIdentify } from "@/components/posthog-identify";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getSidebarData } from "@/lib/notes";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sidebarPromise = getSidebarData(user.id);

  return (
    <div className="flex min-h-svh flex-col clay-page-bg">
      <PostHogIdentify user={user} />
      <header className="site-header">
        <SiteHeaderClient
          user={user}
          showNavLinks={false}
          logoHref="/dashboard"
        />
      </header>
      <AppShell sidebarPromise={sidebarPromise}>{children}</AppShell>
    </div>
  );
}
