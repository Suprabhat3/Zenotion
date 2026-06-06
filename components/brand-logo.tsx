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
      className={cn("flex items-center gap-2.5 text-lg font-semibold tracking-tight", className)}
    >
        <Image src={logo} alt="Zenotion Logo" width={28} height={28} />
      Zenotion
    </Link>
  );
}
