import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";

export async function HeaderAuthActions() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <UserMenu
        name={user.name}
        email={user.email}
        image={user.image}
      />
    );
  }

  return (
    <>
      <Button variant="ghost" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Get started</Link>
      </Button>
    </>
  );
}
