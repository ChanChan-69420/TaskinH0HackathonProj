"use client"

import { useState } from "react"
import Image from "next/image"
import { Sparkles, Pencil, Trash2, X, Check } from "lucide-react"
import { useGame, type Reward } from "@/lib/game-context"
import { cn } from "@/lib/utils"

const field =
  "w-full border border-panel-border bg-input/40 px-3 py-2 font-mono text-base text-foreground outline-none focus:border-cyan"
const labelCls = "mb-1 block font-sans text-xs tracking-wide text-foreground/80"

// ── Edit reward inline form ─────────────────────────────────────────────────
function EditRewardForm({ reward, onDone }: { reward: Reward; onDone: () => void }) {
  const { updateReward } = useGame()
  const [name, setName] = useState(reward.name)
  const [description, setDescription] = useState(reward.description)
  const [cost, setCost] = useState(String(reward.cost))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!name.trim() || busy) return
    setError(null)
    setBusy(true)
    try {
      await updateReward(reward.id, {
        name: name.trim(),
        description: description.trim(),
        cost: Math.max(1, Number.parseInt(cost) || 1),
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update reward.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-2 space-y-2 border border-cyan/40 bg-cyan/5 p-2 text-left">
      <input className={cn(field, "py-1 text-sm")} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input
        className={cn(field, "py-1 text-sm")}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <input
        className={cn(field, "py-1 text-sm")}
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        inputMode="numeric"
        placeholder="Cost"
      />
      {error && <p className="font-mono text-xs text-urgent">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-1 border border-cyan/60 bg-cyan/10 py-1.5 font-sans text-xs tracking-wide text-foreground hover:bg-cyan/20 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" /> SAVE
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex flex-1 items-center justify-center gap-1 border border-panel-border py-1.5 font-sans text-xs tracking-wide text-foreground/70 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" /> CANCEL
        </button>
      </div>
    </div>
  )
}

// ── Reward card ─────────────────────────────────────────────────────────────
function RewardCard({ reward, canAfford }: { reward: Reward; canAfford: boolean }) {
  const { claimReward, deleteReward, analyzeReward } = useGame()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState<null | "claim" | "analyze" | "delete">(null)
  const [error, setError] = useState<string | null>(null)

  async function run(kind: "claim" | "analyze" | "delete", fn: () => Promise<void>) {
    if (busy) return
    setError(null)
    setBusy(kind)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div
      className={cn(
        "game-panel flex flex-col gap-2 p-3 text-center",
        reward.claimed && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="flex-1 text-left font-sans text-xs leading-tight tracking-wide text-foreground">
          {reward.name.toUpperCase()}
        </p>
        {!reward.claimed && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              title="Edit reward"
              className="text-foreground/60 transition-colors hover:text-cyan"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => void run("delete", () => deleteReward(reward.id))}
              title="Delete reward"
              className="text-urgent/70 transition-colors hover:text-urgent"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {reward.description && (
        <p className="text-left font-mono text-xs text-foreground/60">{reward.description}</p>
      )}

      <p className="flex items-center justify-center gap-1">
        <Image src="/icons/coin.png" alt="" width={18} height={18} className="pixelated" />
        <span className="font-sans text-sm text-gold">{reward.cost}</span>
      </p>

      {reward.ai_suggested_cost != null && (
        <div className="border border-cyan/40 bg-cyan/5 p-2 text-left">
          <p className="font-sans text-[11px] tracking-wide text-foreground">
            AI SUGGESTS: <span className="text-gold">{reward.ai_suggested_cost}</span>
          </p>
          {reward.ai_reason && (
            <p className="mt-1 font-mono text-[11px] italic text-foreground/60">{reward.ai_reason}</p>
          )}
        </div>
      )}

      {error && <p className="font-mono text-[11px] text-urgent">{error}</p>}

      {reward.claimed ? (
        <p className="border border-easy/50 bg-easy/10 py-1.5 font-sans text-xs tracking-wide text-easy">
          CLAIMED
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => void run("analyze", () => analyzeReward(reward.id))}
            disabled={busy !== null}
            className="flex items-center justify-center gap-1 border border-panel-border bg-input/40 py-1.5 font-sans text-xs tracking-wide text-cyan transition-colors hover:border-cyan disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {busy === "analyze" ? "ANALYZING..." : "AI PRICE"}
          </button>
          <button
            type="button"
            onClick={() => void run("claim", () => claimReward(reward.id))}
            disabled={busy !== null || !canAfford}
            title={!canAfford ? "Not enough points" : undefined}
            className="border border-cyan/60 bg-cyan/10 py-1.5 font-sans text-xs tracking-wide text-foreground transition-colors hover:bg-cyan/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === "claim" ? "CLAIMING..." : "CLAIM"}
          </button>
        </div>
      )}

      {editing && !reward.claimed && <EditRewardForm reward={reward} onDone={() => setEditing(false)} />}
    </div>
  )
}

// ── Create reward form ──────────────────────────────────────────────────────
function CreateRewardForm() {
  const { createReward } = useGame()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [cost, setCost] = useState("100")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create() {
    if (!name.trim() || busy) return
    setError(null)
    setBusy(true)
    try {
      await createReward({
        name: name.trim(),
        description: description.trim(),
        cost: Math.max(1, Number.parseInt(cost) || 1),
      })
      setName("")
      setDescription("")
      setCost("100")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reward.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="font-sans text-sm tracking-wide text-foreground/80">
        Create a real-life reward, set a cost, then claim it with your points.
      </p>
      <div>
        <label className={labelCls}>REWARD NAME</label>
        <input
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. 30 mins of gaming"
        />
      </div>
      <div>
        <label className={labelCls}>DESCRIPTION</label>
        <input
          className={field}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
        />
      </div>
      <div>
        <label className={labelCls}>COST (POINTS)</label>
        <input className={field} value={cost} onChange={(e) => setCost(e.target.value)} inputMode="numeric" />
      </div>

      {error && <p className="font-mono text-xs text-urgent">{error}</p>}

      <button
        type="button"
        onClick={() => void create()}
        disabled={busy}
        className="w-full border border-cyan/60 bg-cyan/10 py-3 font-sans text-sm tracking-wide text-foreground transition-colors hover:bg-cyan/20 disabled:opacity-50"
      >
        {busy ? "ADDING..." : "ADD REWARD"}
      </button>
      <p className="font-mono text-xs text-foreground/50">
        Use the AI PRICE button on a reward to get a suggested fair cost.
      </p>
    </div>
  )
}

export function ShopTab() {
  const { rewards, profile, progress } = useGame()
  const balance = profile?.total_points ?? progress?.total_points ?? 0

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.6fr_1fr]">
      {/* Rewards Market */}
      <section className="game-panel p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-sans text-2xl tracking-wide text-foreground">REWARDS MARKET</h2>
          <span className="flex items-center gap-2">
            <Image src="/icons/coin.png" alt="points" width={22} height={22} className="pixelated" />
            <span className="font-sans text-lg text-gold">{balance.toLocaleString()}</span>
          </span>
        </div>
        {rewards.length === 0 ? (
          <p className="font-mono text-base text-foreground/60">
            No rewards yet. Create one to start spending your points.
          </p>
        ) : (
          <div className="thin-scroll grid max-h-[520px] grid-cols-2 gap-4 overflow-y-auto pr-2 sm:grid-cols-3">
            {rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} canAfford={balance >= reward.cost} />
            ))}
          </div>
        )}
      </section>

      {/* Manage Inventory */}
      <section className="game-panel p-5 sm:p-6">
        <h2 className="mb-5 text-center font-sans text-2xl tracking-wide text-foreground">MANAGE REWARDS</h2>
        <CreateRewardForm />
      </section>
    </div>
  )
}
