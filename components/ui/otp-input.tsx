"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Fired once the last digit is filled, so the form can auto-submit. */
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Marks every box invalid (e.g. after a rejected code). */
  invalid?: boolean;
  className?: string;
  /** Id of the label describing the group. */
  "aria-labelledby"?: string;
};

const DIGITS_ONLY = /\D/g;

/**
 * Segmented one-time-code input: `length` single-character boxes that behave
 * like one field. Supports typing, pasting a full code into any box, arrow
 * keys, and backspace stepping back into the previous box.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  autoFocus = false,
  invalid = false,
  className,
  "aria-labelledby": ariaLabelledBy,
}: OtpInputProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(
    () => Array.from({ length }, (_, index) => value[index] ?? ""),
    [value, length],
  );

  function focusBox(index: number) {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  }

  function commit(next: string, focusIndex: number) {
    const normalized = next.replace(DIGITS_ONLY, "").slice(0, length);
    onChange(normalized);
    focusBox(focusIndex);
    if (normalized.length === length) onComplete?.(normalized);
  }

  function handleChange(index: number, raw: string) {
    const typed = raw.replace(DIGITS_ONLY, "");
    if (!typed) {
      // Cleared this box.
      const next = value.split("");
      next[index] = "";
      commit(next.join("").slice(0, length), index);
      return;
    }

    if (typed.length > 1) {
      // Paste (or fast typing) landed in a single box: spread it forward.
      const merged = value.slice(0, index) + typed;
      commit(merged, Math.min(length - 1, index + typed.length));
      return;
    }

    const next = value.padEnd(index, " ").split("");
    next[index] = typed;
    commit(next.join("").replace(/ /g, ""), index + 1);
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = value.split("");
      if (next[index]) {
        next[index] = "";
        commit(next.join(""), index);
      } else {
        next[index - 1] = "";
        commit(next.join(""), index - 1);
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  }

  return (
    <div
      role="group"
      aria-labelledby={ariaLabelledBy}
      className={cn("flex items-center justify-center gap-2", className)}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.currentTarget.select()}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          maxLength={length}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          className={cn(
            "h-13 w-11 rounded-xl border border-input bg-transparent text-center font-mono text-xl font-semibold tabular-nums clay-inset transition-[color,background-color,box-shadow,border-color] duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-foreground/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-destructive/60 text-destructive",
          )}
        />
      ))}
    </div>
  );
}
