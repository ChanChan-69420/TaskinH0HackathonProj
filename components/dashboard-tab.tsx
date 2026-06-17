"use client"

import { useState } from "react"
import Image from "next/image"
import { useGame } from "@/lib/game-context"
import { useAuth } from "@/lib/auth-context"
import { PixelCheckbox } from "@/components/pixel-checkbox"

export function DashboardTab({ onAddTask }: { onAddTask: () => void }) {
  const { tasks, coins, level, xp, streak, toggleTask, isLoading } = useGame()
  const { user, updateAvatar } = useAuth()
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const xpPct = Math.min(100, Math.round(((xp % 100) / 100) * 100)) || 0

  return (
    <div id="dashboard-tab-container" className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.6fr_1fr]">
      {/* Tasks at hand */}
      <section className="game-panel p-5 sm:p-6">
        <h2 className="mb-5 font-sans text-2xl tracking-wide text-foreground sm:text-3xl">TASKS AT HAND</h2>
        {isLoading ? (
          <p className="py-12 text-center font-sans text-sm tracking-wide text-foreground/50">
            LOADING TASKS...
          </p>
        ) : (
          <ul className="thin-scroll max-h-[420px] space-y-4 overflow-y-auto pr-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-4">
                <PixelCheckbox checked={task.done} onChange={() => toggleTask(task.id)} />
                <span
                  className={`flex-1 font-sans text-base uppercase tracking-wide sm:text-lg ${
                    task.done ? "text-foreground/55" : "text-foreground"
                  }`}
                >
                  {task.title}
                </span>
                <span className="flex items-center gap-1 font-sans text-xs tracking-wide text-gold/80 sm:text-sm">
                  <Image src="/icons/coin.png" alt="points" width={16} height={16} className="pixelated" />
                  {task.totalPoints}
                </span>
              </li>
            ))}
            {tasks.length === 0 && (
              <li className="py-8 text-center font-sans text-sm tracking-wide text-foreground/50">
                NO TASKS YET
              </li>
            )}
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
            <Image src="/icons/coin.png" alt="coins" width={28} height={28} className="pixelated" />
            <span className="font-sans text-lg text-gold sm:text-xl">{coins.toLocaleString()}</span>
          </span>
        </div>

        {/* User profile + stats */}
        <div id="dashboard-stats-card" className="game-panel p-5 sm:p-6">
          <h3 className="mb-4 font-sans text-xl tracking-wide text-foreground sm:text-2xl">USER PROFILE</h3>
          <div className="mb-5 flex items-center gap-4">
            <div 
              className="relative group cursor-pointer h-14 w-14 border border-panel-border transition-all duration-300 hover:border-cyan hover:shadow-[0_0_12px_#22e5e5]"
              onClick={() => setShowAvatarModal(true)}
            >
              <Image
                src={`/icons/${user?.avatar_id || "avatar-male"}.png`}
                alt="User avatar"
                width={56}
                height={56}
                className="pixelated h-full w-full object-cover"
              />
              {/* Pencil Edit overlay icon in top-right */}
              <div className="absolute top-0.5 right-0.5 bg-[#1b2d34]/95 border border-cyan/50 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-[0_0_4px_#22e5e5]">
                <PencilIcon className="h-3 w-3 text-cyan" />
              </div>
            </div>
            <p className="font-sans text-base leading-tight tracking-wide text-foreground">
              WELCOME
              <br />
              BACK, {(user?.username || "USER").toUpperCase()}!
            </p>
          </div>

          <div className="mb-3 h-px w-full bg-panel-border" />

          <h3 className="mb-4 font-sans text-xl tracking-wide text-foreground sm:text-2xl">STATS</h3>
          <p className="mb-2 font-sans text-base tracking-wide text-foreground">LEVEL {level}</p>
          <div className="mb-5 h-3 w-full border border-panel-border bg-input/40">
            <div className="h-full bg-cyan/70" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="flex items-center gap-2 font-sans text-base tracking-wide text-foreground">
            {streak} DAY STREAK{" "}
            <Image
              src="/icons/fire.png"
              alt="streak fire"
              width={22}
              height={22}
              className="pixelated"
            />
          </p>
        </div>
      </div>

      <ChooseAvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatarId={user?.avatar_id || "avatar-male"}
        onSave={updateAvatar}
      />
    </div>
  )
}

// ── Pencil Icon for avatar editing ───────────────────────────────────────────
function PencilIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

// ── Avatar Options collection ────────────────────────────────────────────────
const AVATAR_OPTIONS = [
  { id: "avatar-male", name: "Pixel Boy 1" },
  { id: "avatar-female", name: "Pixel Girl 1" },
]

type ChooseAvatarModalProps = {
  isOpen: boolean
  onClose: () => void
  currentAvatarId: string
  onSave: (avatarId: string) => void
}

function ChooseAvatarModal({ isOpen, onClose, currentAvatarId, onSave }: ChooseAvatarModalProps) {
  const [selectedId, setSelectedId] = useState(currentAvatarId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Self-contained animations style block */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.15s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Dark backdrop overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-fade-in pointer-events-auto cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal Dialog container with cyberpunk aesthetic */}
      <div 
        className="relative z-10 w-full max-w-lg border border-cyan bg-[#1b2d34]/95 p-6 shadow-[0_0_20px_rgba(34,229,229,0.5),inset_0_0_8px_rgba(34,229,229,0.25)] text-foreground animate-scale-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan/25 pb-3">
          <h3 className="font-sans text-xl font-bold tracking-widest text-cyan uppercase">
            Choose Your Avatar
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-foreground/60 hover:text-cyan font-mono text-base transition-colors"
          >
            [X]
          </button>
        </div>

        {/* Grid of Avatars */}
        <div className="thin-scroll grid grid-cols-2 gap-4 py-6 overflow-y-auto sm:grid-cols-3 md:grid-cols-4 max-h-[50vh]">
          {AVATAR_OPTIONS.map((avatar) => {
            const isSelected = selectedId === avatar.id
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setSelectedId(avatar.id)}
                className={`
                  flex flex-col items-center gap-2 border p-2 transition-all rounded-sm
                  ${isSelected 
                    ? "border-cyan bg-cyan/10 shadow-[0_0_10px_rgba(34,229,229,0.4)]" 
                    : "border-panel-border/60 bg-input/10 hover:border-foreground/50 hover:bg-input/20"}
                `}
              >
                <div className="h-16 w-16 overflow-hidden border border-panel-border/30">
                  <Image
                    src={`/icons/${avatar.id}.png`}
                    alt={avatar.name}
                    width={64}
                    height={64}
                    className="pixelated h-full w-full object-cover"
                  />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-center line-clamp-1 w-full text-foreground/80">
                  {avatar.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 border-t border-cyan/25 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="border border-panel-border bg-panel px-4 py-2 font-sans text-xs tracking-wider text-foreground/80 hover:border-cyan hover:text-cyan transition-colors"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(selectedId)
              onClose()
            }}
            className="border border-cyan bg-cyan/15 px-6 py-2 font-sans text-xs tracking-wider text-cyan hover:bg-cyan/25 transition-colors shadow-[0_0_8px_rgba(34,229,229,0.3)]"
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  )
}
