"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SHARP_MASK =
  "linear-gradient(to bottom, #000 0%, #000 42%, rgba(0,0,0,0.6) 64%, transparent 86%)";

const BLUR_MASK =
  "linear-gradient(to bottom, transparent 0%, transparent 38%, #000 66%, transparent 94%)";

function MaskedBackground({
  src,
  mask,
  blurred,
  preload,
  className,
}: {
  src: string;
  mask: string;
  blurred?: boolean;
  preload?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("absolute inset-x-0 top-0 h-4/5", className)}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      <div className={cn("absolute inset-0", blurred && "blur-xl")}>
        <Image
          src={src}
          alt=""
          fill
          sizes="100vw"
          preload={blurred ? undefined : preload}
          className="object-cover object-[50%_35%] grayscale-100"
        />
      </div>
    </div>
  );
}

export type ShellProps = {
  image?: string;
  preload?: boolean;
  className?: string;
  /** Classes for the centered container that wraps the content */
  innerClassName?: string;
  content?: ReactNode;
  children?: ReactNode;
};

export default function Shell({
  image = "/images/banner_black.png",
  preload = true,
  className,
  innerClassName,
  content,
  children,
}: ShellProps) {
  const inner = content ?? children;

  return (
    <section
      className={cn(
        "relative isolate w-full overflow-x-clip",
        "supports-[overflow:clip]:overflow-y-clip",
        className,
      )}
    >
      <MaskedBackground src={image} mask={BLUR_MASK} blurred className="z-10" />
      <MaskedBackground
        src={image}
        mask={SHARP_MASK}
        preload={preload}
        className="z-10"
      />

      <div
        className={cn(
          "relative z-40 mx-auto max-w-7xl items-center px-6 pt-12 pb-6 space-y-8",
          innerClassName,
        )}
      >
        {inner}
      </div>
    </section>
  );
}
