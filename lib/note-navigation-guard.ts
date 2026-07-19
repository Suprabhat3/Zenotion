/**
 * Lets the active note editor flush or confirm before programmatic navigations
 * (quick switcher, router.push) — same behavior as the link-click interceptor.
 */

type NoteNavGuard = {
  isDirty: () => boolean;
  flush: () => Promise<boolean>;
};

let activeGuard: NoteNavGuard | null = null;

export function registerNoteNavGuard(guard: NoteNavGuard | null): void {
  activeGuard = guard;
}

function isInternalPath(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export async function navigateWithNoteGuard(
  href: string,
  navigate: (href: string) => void,
): Promise<void> {
  if (!isInternalPath(href)) {
    navigate(href);
    return;
  }

  const guard = activeGuard;
  if (!guard?.isDirty()) {
    navigate(href);
    return;
  }

  const ok = await guard.flush();
  if (!ok || guard.isDirty()) {
    const leave = window.confirm(
      "You have unsaved changes. Leave this note anyway?",
    );
    if (!leave) return;
  }

  navigate(href);
}
