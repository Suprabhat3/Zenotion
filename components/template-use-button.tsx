"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ApiResponse } from "@/lib/api";

type TemplateUsButtonProps = {
  templateTitle: string;
  templateContent: string;
  isLoggedIn: boolean;
};

type CreatedNote = { id: string };

export function TemplateUseButton({
  templateTitle,
  templateContent,
  isLoggedIn,
}: TemplateUsButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/signup");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: templateTitle,
            content: templateContent,
          }),
        });
        const json = (await res.json()) as ApiResponse<CreatedNote>;
        if (!json.success || !json.data) {
          toast.error("Could not create note from template.");
          return;
        }
        toast.success("Note created from template!");
        router.push(`/notes/${json.data.id}`);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="gap-1.5"
    >
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {isLoggedIn ? "Use this template" : "Use after signup"}
    </Button>
  );
}
