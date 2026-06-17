"use client"

import Image from "next/image"
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
        <div className="relative h-10 w-10 drop-shadow-[0_0_8px_rgba(29,217,208,0.6)]">
          <Image
            src="/taskin-logo.svg"
            alt="Taskin"
            width={40}
            height={40}
            priority
          />
        </div>
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
