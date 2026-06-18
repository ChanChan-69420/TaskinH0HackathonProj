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
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Pixel-art T-in-circle logo matching the reference */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Taskin logo"
          className="drop-shadow-[0_0_8px_rgba(29,217,208,0.7)]"
        >
          {/* Outer circle ring */}
          <circle cx="20" cy="20" r="18" stroke="#1DD9D0" strokeWidth="2.2" fill="none" />

          {/* Pixel T — top horizontal bar (6 columns × 2 rows of 3px pixels) */}
          {/* Row 1 of top bar */}
          <rect x="8"  y="11" width="3" height="3" fill="#1AA89F" />
          <rect x="11" y="11" width="3" height="3" fill="#1AA89F" />
          <rect x="14" y="11" width="3" height="3" fill="#1AA89F" />
          <rect x="17" y="11" width="3" height="3" fill="#1AA89F" />
          <rect x="20" y="11" width="3" height="3" fill="#1AA89F" />
          <rect x="23" y="11" width="3" height="3" fill="#1AA89F" />
          <rect x="26" y="11" width="3" height="3" fill="#1AA89F" />

          {/* Row 2 of top bar */}
          <rect x="8"  y="14" width="3" height="3" fill="#1AA89F" />
          <rect x="11" y="14" width="3" height="3" fill="#1AA89F" />
          <rect x="14" y="14" width="3" height="3" fill="#1AA89F" />
          <rect x="17" y="14" width="3" height="3" fill="#1AA89F" />
          <rect x="20" y="14" width="3" height="3" fill="#1AA89F" />
          <rect x="23" y="14" width="3" height="3" fill="#1AA89F" />
          <rect x="26" y="14" width="3" height="3" fill="#1AA89F" />

          {/* Stem — 2 columns × 5 rows, centered */}
          <rect x="17" y="17" width="3" height="3" fill="#1AA89F" />
          <rect x="20" y="17" width="3" height="3" fill="#1AA89F" />

          <rect x="17" y="20" width="3" height="3" fill="#1AA89F" />
          <rect x="20" y="20" width="3" height="3" fill="#1AA89F" />

          <rect x="17" y="23" width="3" height="3" fill="#1AA89F" />
          <rect x="20" y="23" width="3" height="3" fill="#1AA89F" />

          <rect x="17" y="26" width="3" height="3" fill="#1AA89F" />
          <rect x="20" y="26" width="3" height="3" fill="#1AA89F" />
        </svg>
        <span className="font-sans text-lg font-bold tracking-wider text-cyan drop-shadow-[0_0_6px_rgba(29,217,208,0.4)] hidden sm:inline">
          Taskin
        </span>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-1">
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
      <button
        type="button"
        onClick={logout}
        className="ml-2 flex items-center gap-1.5 px-2 py-2 font-sans text-sm tracking-wider text-foreground/50 transition-colors hover:text-red-400 flex-shrink-0"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </nav>
  )
}
