"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
import { GameProvider, useGame } from "@/lib/game-context"
import { TopNav, type Tab } from "@/components/top-nav"
import { DashboardTab } from "@/components/dashboard-tab"
import { TasksTab } from "@/components/tasks-tab"
import { PomodoroTab } from "@/components/pomodoro-tab"
import { ProfileTab } from "@/components/profile-tab"
import { ShopTab } from "@/components/shop-tab"

function AppShell({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("dashboard")
  const { loading, error, refreshAll } = useGame()

  return (
    <main
      className="pixelated relative min-h-screen w-full bg-cover bg-fixed bg-center"
      style={{ backgroundImage: "url(/desk-bg.gif)" }}
    >
      <div className="absolute inset-0 z-0 bg-background/55" aria-hidden />
      <div className="relative z-10">
        {/* Header: nav + logout */}
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-4 sm:pt-6">
          <TopNav active={tab} onChange={setTab} />
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 border border-panel-border bg-panel/60 px-3 py-2 font-sans text-xs tracking-wider text-foreground/80 backdrop-blur-sm transition-colors hover:border-urgent hover:text-urgent"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>

        {/* Initial loading state */}
        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="game-panel flex flex-col items-center gap-3 p-8 text-center">
              <p className="font-sans text-lg tracking-widest text-cyan">LOADING...</p>
              <p className="font-mono text-sm text-foreground/60">Fetching your quest data</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="game-panel flex flex-col items-center gap-4 p-8 text-center">
              <p className="font-sans text-lg tracking-widest text-urgent">CONNECTION ERROR</p>
              <p className="max-w-sm font-mono text-sm text-foreground/70">{error}</p>
              <button
                type="button"
                onClick={() => void refreshAll()}
                className="border border-cyan/60 bg-cyan/10 px-6 py-2 font-sans text-sm tracking-wider text-foreground transition-colors hover:bg-cyan/20"
              >
                RETRY
              </button>
            </div>
          </div>
        )}

        {/* Loaded content */}
        {!loading && !error && (
          <>
            {tab === "dashboard" && <DashboardTab onAddTask={() => setTab("tasks")} />}
            {tab === "tasks" && <TasksTab />}
            {tab === "pomodoro" && <PomodoroTab />}
            {tab === "profile" && <ProfileTab />}
            {tab === "shop" && <ShopTab />}
          </>
        )}
      </div>
    </main>
  )
}

export function MainApp({ onLogout }: { onLogout: () => void }) {
  return (
    <GameProvider>
      <AppShell onLogout={onLogout} />
    </GameProvider>
  )
}
