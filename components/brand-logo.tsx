import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
};

export function BrandLogo({ href = "/", className }: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5 text-lg font-semibold tracking-tight", className)}
    >
      <span className="clay-brand-mark" aria-hidden>
        Z
      </span>
      Zenotion
    </Link>
  );
}
