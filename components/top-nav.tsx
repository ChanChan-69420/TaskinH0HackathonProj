"use client"

import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { LogOut } from "lucide-react"

export type Tab = "dashboard" | "tasks" | "pomodoro" | "profile" | "shop"

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "DASHBOARD" },
  { id: "tasks", label: "TASKS" },
  { id: "pomodoro", label: "POMODORO" },
  { id: "profile", label: "PROFILE" },
  { id: "shop", label: "SHOP" },
]

export function TopNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const { logout } = useAuth()

  return (
    <nav className="flex items-center justify-between gap-4 border-b border-cyan/30 bg-background/40 px-4 py-3 backdrop-blur-sm sm:px-8 sm:py-4">
      {/* Logo and branding */}
      <div className="flex flex-1 items-center justify-start gap-3">
        {/* Pixel-art T-in-circle logo — faithful recreation of reference */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Taskin logo"
          className="drop-shadow-[0_0_8px_rgba(29,217,208,0.7)]"
          shapeRendering="crispEdges"
        >
          {/* Ring outer band — bright teal (evenodd cuts out the interior) */}
          <path
            fillRule="evenodd"
            d="M9,2H14V3H16V4H17V5H18V6H19V7H20V9H21V14H20V16H19V17H18V18H17V19H16V20H14V21H9V20H7V19H6V18H5V17H4V16H3V14H2V9H3V7H4V6H5V5H6V4H7V3H9Z M9,3H14V4H16V5H17V6H18V7H19V9H20V14H19V16H18V17H17V18H16V19H14V20H9V19H7V18H6V17H5V16H4V14H3V9H4V7H5V6H6V5H7V4H9Z"
            fill="#1DD9D0"
          />
          {/* Ring inner band — darker teal for depth (evenodd cuts out the interior) */}
          <path
            fillRule="evenodd"
            d="M9,3H14V4H16V5H17V6H18V7H19V9H20V14H19V16H18V17H17V18H16V19H14V20H9V19H7V18H6V17H5V16H4V14H3V9H4V7H5V6H6V5H7V4H9Z M9,4H14V5H16V6H17V7H18V9H19V14H18V16H17V17H16V18H14V19H9V18H7V17H6V16H5V14H4V9H5V7H6V6H7V5H9Z"
            fill="#158A82"
          />

          {/* ── T letter with 3D shading (half thickness) ── */}

          {/* Bar — highlight row */}
          <rect x="6" y="8" width="11" height="1" fill="#25D4CB" />
          {/* Bar — main body */}
          <rect x="6" y="9" width="11" height="1" fill="#1AA89F" />

          {/* Under-bar overhang shadow (left + right) */}
          <rect x="6" y="10" width="4" height="1" fill="#0A4A45" />
          <rect x="13" y="10" width="4" height="1" fill="#0A4A45" />

          {/* Stem — left highlight edge */}
          <rect x="10" y="10" width="1" height="7" fill="#1DD9D0" />
          {/* Stem — main body */}
          <rect x="11" y="10" width="1" height="7" fill="#1AA89F" />
          {/* Stem — right shadow edge */}
          <rect x="12" y="10" width="1" height="7" fill="#127A73" />

          {/* Stem bottom shadow */}
          <rect x="10" y="17" width="3" height="1" fill="#0A4A45" />
        </svg>
        <span className="font-heading text-lg font-bold uppercase tracking-[0.2em] text-cyan drop-shadow-[0_0_6px_rgba(29,217,208,0.4)] hidden sm:inline" style={{ textShadow: '0 0 8px rgba(29,217,208,0.35)' }}>
          Taskin
        </span>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative px-3 py-2 font-sans text-xs sm:text-sm tracking-widest transition-all",
                isActive
                  ? "text-cyan border border-cyan/50 rounded-sm drop-shadow-[0_0_8px_rgba(29,217,208,0.5)]"
                  : "text-foreground/60 border border-transparent hover:text-foreground/80 hover:border-foreground/30",
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Logout button */}
      <div className="flex flex-1 items-center justify-end">
        <button
          type="button"
          onClick={logout}
          className="ml-2 flex items-center gap-1.5 px-2 py-2 font-sans text-sm tracking-wider text-foreground/50 transition-colors hover:text-red-400"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
