import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "@/public/android-chrome-512x512.png";
type BrandLogoProps = {
  href?: string;
  className?: string;
};

export function BrandLogo({ href = "/", className }: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative z-10 flex items-center gap-2.5 text-base font-semibold tracking-tight sm:text-lg",
        className,
      )}
    >
      <span className="clay-brand-mark overflow-hidden p-0.5 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-2">
        <Image
          src={logo}
          alt=""
          width={24}
          height={24}
          className="rounded-[calc(var(--radius)-4px)]"
          aria-hidden
        />
      </span>
      <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text transition-opacity duration-200 group-hover:opacity-90">
        Zenotion
      </span>
    </Link>
  );
}
