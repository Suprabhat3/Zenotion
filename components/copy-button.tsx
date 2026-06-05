"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CopyButtonProps = {
  text?: string;
  getText?: () => string;
  label?: string;
  className?: string;
  size?: "sm" | "icon";
  onCopied?: () => void;
};

export function CopyButton({
  text,
  getText,
  label = "Copy",
  className,
  size = "sm",
  onCopied,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const value = getText?.() ?? text ?? "";
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (size === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7 shrink-0", className)}
        onClick={handleCopy}
        title={copied ? "Copied!" : label}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("gap-1.5", className)}
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied" : label}
    </Button>
  );
}
