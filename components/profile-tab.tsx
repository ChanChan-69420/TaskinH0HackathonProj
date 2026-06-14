"use client"

import Image from "next/image"
import { useGame } from "@/lib/game-context"

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-panel-border/50 py-2">
      <span className="font-sans text-sm tracking-wide text-foreground/70">{label}</span>
      <span className="font-sans text-base text-foreground">{value}</span>
    </div>
  )
}

export function ProfileTab() {
  const { profile, stats, progress } = useGame()

  const level = profile?.level ?? progress?.level ?? 1
  const totalPoints = profile?.total_points ?? progress?.total_points ?? 0
  const xpPct = progress?.percentage_to_next_level ?? 0
  const pointsNeeded = progress?.points_needed_for_next_level ?? 100

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <section className="game-panel p-6 sm:p-8">
        <h2 className="mb-5 font-sans text-2xl tracking-widest text-foreground">USER PROFILE</h2>

        {/* Top row: avatar | identity | treasure */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="game-panel flex-shrink-0 overflow-hidden" style={{ width: 120, height: 120 }}>
            <Image
              src="/icons/avatar-male.png"
              alt="User avatar"
              width={120}
              height={120}
              className="pixelated h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <p className="font-sans text-2xl tracking-widest text-foreground">
              {(profile?.username ?? "PLAYER").toUpperCase()}
            </p>
            <p className="font-sans text-base tracking-widest text-foreground/80">
              LEVEL {level}
              {profile?.level_title ? ` — ${profile.level_title.toUpperCase()}` : ""}
            </p>

            {/* XP progress bar */}
            <div
              className="h-4 w-full border border-panel-border"
              style={{ background: "oklch(0.25 0.02 220 / 60%)" }}
              role="progressbar"
              aria-valuenow={xpPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress to next level ${xpPct}%`}
            >
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${xpPct}%`, background: "oklch(0.72 0.22 142)" }}
              />
            </div>
            <p className="font-mono text-sm text-foreground/70">
              {pointsNeeded} points to level {level + 1}
            </p>
          </div>

          <div className="game-panel flex min-w-[140px] flex-shrink-0 flex-col items-center justify-center gap-1 px-5 py-4 text-center">
            <p className="font-sans text-sm tracking-widest text-foreground/80">TREASURE</p>
            <div className="flex items-center gap-2">
              <Image src="/icons/coin.png" alt="Points" width={40} height={40} className="pixelated" />
              <span className="font-sans text-3xl tracking-wide text-gold">
                {totalPoints.toLocaleString()}
              </span>
            </div>
            <p className="font-sans text-xs tracking-widest text-foreground/70">TOTAL POINTS</p>
          </div>
        </div>

        <div className="my-6 w-full border-t" style={{ borderColor: "var(--panel-border)" }} aria-hidden />

        {/* Account details */}
        <h3 className="mb-3 font-sans text-2xl tracking-widest text-foreground">ACCOUNT DETAILS</h3>
        <div className="mb-6">
          <StatRow label="USERNAME" value={profile?.username ?? "—"} />
          <StatRow label="EMAIL" value={profile?.email ?? "—"} />
          <StatRow label="MEMBER SINCE" value={profile?.member_since ?? "—"} />
          <StatRow label="TOTAL POINTS" value={totalPoints.toLocaleString()} />
          <StatRow label="LEVEL" value={`${level}${profile?.level_title ? ` (${profile.level_title})` : ""}`} />
        </div>

        {/* Stats grids */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <h3 className="mb-2 font-sans text-lg tracking-widest text-foreground">TASKS</h3>
            <StatRow label="TOTAL" value={stats?.tasks.total ?? 0} />
            <StatRow label="COMPLETED" value={stats?.tasks.completed ?? 0} />
            <StatRow label="IN PROGRESS" value={stats?.tasks.in_progress ?? 0} />
            <StatRow label="NOT STARTED" value={stats?.tasks.not_started ?? 0} />
          </div>
          <div>
            <h3 className="mb-2 font-sans text-lg tracking-widest text-foreground">SUBTASKS</h3>
            <StatRow label="TOTAL" value={stats?.subtasks.total ?? 0} />
            <StatRow label="COMPLETED" value={stats?.subtasks.completed ?? 0} />
            <StatRow label="AI GENERATED" value={stats?.subtasks.ai_generated ?? 0} />
          </div>
          <div>
            <h3 className="mb-2 font-sans text-lg tracking-widest text-foreground">REWARDS</h3>
            <StatRow label="TOTAL" value={stats?.rewards.total ?? 0} />
            <StatRow label="CLAIMED" value={stats?.rewards.claimed ?? 0} />
            <StatRow label="AVAILABLE" value={stats?.rewards.available ?? 0} />
          </div>
        </div>
      </section>
    </div>
  )
}
