"use client"

import { useState } from "react"
import Image from "next/image"
import { useGame, type Task } from "@/lib/game-context"
import { PixelCheckbox } from "@/components/pixel-checkbox"

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="game-panel flex flex-col items-center justify-center gap-1 px-3 py-3 text-center">
      <span className="font-sans text-2xl text-cyan">{value}</span>
      <span className="font-sans text-[10px] tracking-widest text-foreground/70">{label}</span>
    </div>
  )
}

export function DashboardTab({ onAddTask }: { onAddTask: () => void }) {
  const { tasks, stats, profile, progress, updateTaskStatus } = useGame()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const totalPoints = profile?.total_points ?? progress?.total_points ?? 0
  const level = profile?.level ?? progress?.level ?? 1
  const xpPct = progress?.percentage_to_next_level ?? 0
  const pointsNeeded = progress?.points_needed_for_next_level ?? 100

  async function handleToggle(task: Task) {
    if (pendingId) return
    const nextStatus = task.status === "completed" ? "not_started" : "completed"
    setPendingId(task.id)
    try {
      await updateTaskStatus(task.id, nextStatus)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.6fr_1fr]">
      {/* Tasks at hand */}
      <section className="game-panel p-5 sm:p-6">
        <h2 className="mb-5 font-sans text-2xl tracking-wide text-foreground sm:text-3xl">TASKS AT HAND</h2>
        {tasks.length === 0 ? (
          <p className="font-mono text-base text-foreground/60">
            No tasks yet. Create your first quest!
          </p>
        ) : (
          <ul className="thin-scroll max-h-[420px] space-y-4 overflow-y-auto pr-2">
            {tasks.map((task) => {
              const done = task.status === "completed"
              return (
                <li key={task.id} className="flex items-center gap-4">
                  <PixelCheckbox checked={done} onChange={() => void handleToggle(task)} />
                  <span
                    className={`font-sans text-base uppercase tracking-wide sm:text-lg ${
                      done ? "text-foreground/55 line-through" : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        <button
          type="button"
          onClick={onAddTask}
          className="mt-6 w-full border border-cyan/60 bg-cyan/10 py-3 font-sans text-sm tracking-wider text-foreground transition-colors hover:bg-cyan/20 sm:w-auto sm:px-12"
        >
          ADD NEW TASK
        </button>
      </section>

      {/* Right column */}
      <div className="flex flex-col gap-6">
        {/* Treasure */}
        <div className="game-panel flex items-center justify-between px-5 py-4">
          <span className="font-sans text-lg tracking-wide text-foreground sm:text-xl">TREASURE</span>
          <span className="flex items-center gap-2">
            <Image src="/icons/coin.png" alt="points" width={28} height={28} className="pixelated" />
            <span className="font-sans text-lg text-gold sm:text-xl">{totalPoints.toLocaleString()}</span>
          </span>
        </div>

        {/* Stats */}
        <div className="game-panel p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-4">
            <Image
              src="/icons/avatar-male.png"
              alt="User avatar"
              width={56}
              height={56}
              className="pixelated border border-panel-border"
            />
            <p className="font-sans text-base leading-tight tracking-wide text-foreground">
              WELCOME
              <br />
              BACK, {(profile?.username ?? "USER").toUpperCase()}!
            </p>
          </div>

          <div className="mb-3 h-px w-full bg-panel-border" />

          <h3 className="mb-4 font-sans text-xl tracking-wide text-foreground sm:text-2xl">STATS</h3>
          <p className="mb-2 font-sans text-base tracking-wide text-foreground">
            LEVEL {level}
            {profile?.level_title ? ` — ${profile.level_title.toUpperCase()}` : ""}
          </p>
          <div className="mb-2 h-3 w-full border border-panel-border bg-input/40">
            <div className="h-full bg-cyan/70" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="mb-5 font-mono text-sm text-foreground/70">
            {pointsNeeded} points to level {level + 1}
          </p>

          {/* Counts from /api/user/stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="TASKS DONE" value={`${stats?.tasks.completed ?? 0}/${stats?.tasks.total ?? 0}`} />
            <StatBox
              label="SUBTASKS"
              value={`${stats?.subtasks.completed ?? 0}/${stats?.subtasks.total ?? 0}`}
            />
            <StatBox label="REWARDS" value={`${stats?.rewards.claimed ?? 0}/${stats?.rewards.total ?? 0}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
