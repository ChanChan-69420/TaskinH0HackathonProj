"use client"

import { cn } from "@/lib/utils"

/**
 * Pixel-art checkbox matching the reference image:
 * - Unchecked: transparent square with a cyan/white border
 * - Checked:   dark filled square with a bold cyan pixel-style checkmark SVG
 */
export function PixelCheckbox({
  checked,
  onChange,
  className,
}: {
  checked: boolean
  onChange?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "flex shrink-0 items-center justify-center border transition-colors",
        "h-7 w-7",
        checked
          ? "border-cyan bg-[oklch(0.22_0.04_220/80%)]"
          : "border-foreground/50 bg-transparent hover:border-cyan",
        className,
      )}
    >
      {checked && (
        /* Pixel-art cyan checkmark — chunky block-style tick */
        <svg
          viewBox="0 0 14 14"
          className="h-4 w-4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          {/* Bold pixelated tick path: bottom-left → midpoint → top-right */}
          <path
            d="M1 7 L4 11 L13 2"
            stroke="#22e5e5"
            strokeWidth="2.8"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      )}
    </button>
  )
}
