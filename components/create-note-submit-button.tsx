"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

type CreateNoteSubmitButtonProps = Omit<ButtonProps, "children" | "type"> & {
  children: ReactNode;
  pendingChildren?: ReactNode;
  pendingLabel?: string;
};

export function CreateNoteSubmitButton({
  children,
  pendingChildren,
  pendingLabel = "Creating note…",
  disabled,
  ...props
}: CreateNoteSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      aria-label={pending ? pendingLabel : props["aria-label"]}
    >
      {pending ? (
        pendingChildren ?? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            <span>{pendingLabel}</span>
          </>
        )
      ) : (
        children
      )}
    </Button>
  );
}
