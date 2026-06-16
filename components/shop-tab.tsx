"use client"

import { useState } from "react"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { useGame, type ShopItem } from "@/lib/game-context"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

function ItemCard({
  item,
  onBuy,
  onDelete,
  canAfford,
}: {
  item: ShopItem
  onBuy: () => void
  onDelete: () => void
  canAfford: boolean
}) {
  return (
    <div className="game-panel relative flex flex-col items-center gap-2 p-3 text-center group">
      {/* Task 14: Delete button */}
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-1.5 top-1.5 rounded p-1 text-foreground/30 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
        aria-label={`Delete ${item.name}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <Image src={`/icons/${item.icon}.png`} alt={item.name} width={48} height={48} className="pixelated" />
      <p className="font-sans text-xs leading-tight tracking-wide text-foreground">{item.name.toUpperCase()}</p>
      <p className="flex items-center gap-1">
        <Image src="/icons/coin.png" alt="" width={18} height={18} className="pixelated" />
        <span className="font-sans text-sm text-gold">{item.cost}</span>
      </p>
      <button
        type="button"
        onClick={onBuy}
        disabled={!canAfford}
        className="w-full border border-panel-border bg-input/40 py-1.5 font-sans text-xs tracking-wide text-foreground transition-colors hover:border-cyan disabled:cursor-not-allowed disabled:opacity-40"
      >
        BUY
      </button>
    </div>
  )
}

export function ShopTab() {
  const { shopItems, coins, buyItem, addShopItem, removeShopItem, purchases, redeemPurchase } = useGame()
  const [mode, setMode] = useState<"ai" | "manual">("ai")
  const [name, setName] = useState("")
  const [cost, setCost] = useState("")
  const [analyzed, setAnalyzed] = useState<number | null>(null)
  const [reasoning, setReasoning] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  // Task 13: Default icon changed to "chest"
  const addManual = () => {
    if (!name.trim() || !cost) return
    addShopItem({ name, cost: Number.parseInt(cost) || 0, icon: "chest" })
    setName("")
    setCost("")
  }

  const field = "w-full border border-panel-border bg-input/40 px-3 py-2 font-mono text-lg text-foreground outline-none focus:border-cyan"

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.6fr_1fr]">
      {/* Left Column: Rewards Market & Purchase History */}
      <div className="space-y-6">
        {/* Rewards Market */}
        <section className="game-panel p-5 sm:p-6">
          <h2 className="mb-5 font-sans text-2xl tracking-wide text-foreground">REWARDS MARKET</h2>

          <div className="thin-scroll grid max-h-[350px] grid-cols-2 gap-4 overflow-y-auto pr-2 sm:grid-cols-3 lg:grid-cols-4">
            {shopItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                canAfford={coins >= item.cost}
                onBuy={() => buyItem(item.id)}
                onDelete={() => removeShopItem(item.id)}
              />
            ))}
            {shopItems.length === 0 && (
              <p className="col-span-full py-12 text-center font-sans text-sm tracking-wide text-foreground/50">
                NO REWARDS CREATED YET
              </p>
            )}
          </div>
        </section>

        {/* Purchase History */}
        <section className="game-panel p-5 sm:p-6">
          <h2 className="mb-5 font-sans text-2xl tracking-wide text-foreground">PURCHASE HISTORY</h2>
          <div className="thin-scroll max-h-[350px] overflow-y-auto pr-2">
            {purchases.length === 0 ? (
              <p className="py-12 text-center font-sans text-sm tracking-wide text-foreground/50">
                NO PURCHASES YET
              </p>
            ) : (
              <ul className="space-y-3">
                {purchases.map((purchase) => (
                  <li
                    key={purchase.id}
                    className="flex flex-col gap-3 border border-panel-border/50 bg-input/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={`/icons/${purchase.icon}.png`}
                        alt=""
                        width={36}
                        height={36}
                        className="pixelated"
                      />
                      <div>
                        <p className="font-sans text-sm font-semibold uppercase tracking-wide text-foreground">
                          {purchase.name}
                        </p>
                        <p className="font-sans text-xs tracking-wide text-foreground/55">
                          Purchased: {new Date(purchase.purchasedAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="flex items-center gap-1 mt-1 font-sans text-xs tracking-wide text-foreground/70">
                          Status:{" "}
                          <span
                            className={cn(
                              "font-mono uppercase tracking-widest text-xs",
                              purchase.redeemed ? "text-easy font-semibold" : "text-cyan font-semibold"
                            )}
                          >
                            {purchase.redeemed ? "Redeemed" : "Purchased"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="flex items-center gap-1.5">
                        <Image src="/icons/coin.png" alt="" width={18} height={18} className="pixelated" />
                        <span className="font-sans text-base text-gold">{purchase.cost} Coins</span>
                      </span>
                      {!purchase.redeemed && (
                        <button
                          type="button"
                          onClick={() => redeemPurchase(purchase.id)}
                          className="border border-cyan bg-cyan/10 px-3 py-1.5 font-sans text-xs tracking-wide text-foreground transition-colors hover:bg-cyan/20"
                        >
                          REDEEM
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Right Column: Manage Inventory */}
      <section className="game-panel p-5 sm:p-6">
        <h2 className="mb-5 text-center font-sans text-2xl tracking-wide text-foreground">MANAGE INVENTORY</h2>

        <div className="mb-5 grid grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={cn(
              "border-b-2 py-2 font-sans text-sm tracking-wide transition-colors",
              mode === "ai" ? "border-cyan bg-cyan/10 text-cyan" : "border-panel-border text-foreground/70",
            )}
          >
            AI PRICING
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={cn(
              "border-b-2 py-2 font-sans text-sm tracking-wide transition-colors",
              mode === "manual" ? "border-cyan bg-cyan/10 text-cyan" : "border-panel-border text-foreground/70",
            )}
          >
            MANUAL
          </button>
        </div>

        {mode === "ai" ? (
          <div className="space-y-4">
            <button
              type="button"
              disabled={analyzing || !name.trim()}
              onClick={async () => {
                setAnalyzing(true)
                setAnalyzed(null)
                setReasoning(null)
                try {
                  const result = await api.post("/api/rewards/analyze-text", {
                    name: name,
                    description: "",
                  })
                  setAnalyzed(result.suggested_cost)
                  setReasoning(result.reasoning)
                } catch (err) {
                  console.error("AI analysis failed:", err)
                } finally {
                  setAnalyzing(false)
                }
              }}
              className="w-full border border-panel-border bg-input/40 py-3 font-sans text-sm tracking-wide text-foreground transition-colors hover:border-cyan disabled:cursor-not-allowed disabled:opacity-40"
            >
              {analyzing ? "ANALYZING..." : "ANALYZE REWARD VALUE"}
            </button>
            <p className="font-sans text-sm tracking-wide text-foreground/80">ESTIMATE COIN COSTS VIA AI</p>
            <div>
              <label className="mb-1 block font-sans text-xs tracking-wide text-foreground/80">REWARD NAME</label>
              <input
                className={field}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bag of Chips"
              />
            </div>
            {analyzed !== null && (
              <div className="border border-cyan/50 bg-cyan/10 p-3">
                <p className="font-sans text-sm tracking-wide text-foreground">
                  AI SUGGESTS: <span className="text-gold">{analyzed} COINS</span>
                </p>
                {reasoning && (
                  <p className="mt-2 font-sans text-xs italic leading-relaxed tracking-wide text-foreground/70">
                    {reasoning}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (name.trim()) addShopItem({ name, cost: analyzed, icon: "chest" })
                    setName("")
                    setAnalyzed(null)
                    setReasoning(null)
                  }}
                  className="mt-3 w-full border border-cyan/60 bg-cyan/10 py-2 font-sans text-xs tracking-wide text-foreground hover:bg-cyan/20"
                >
                  ADD TO SHOP
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-sans text-sm tracking-wide text-foreground">MANUAL</p>
            <div>
              <label className="mb-1 block font-sans text-xs tracking-wide text-foreground/80">ITEM NAME</label>
              <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block font-sans text-xs tracking-wide text-foreground/80">COIN COST</label>
              <input
                className={field}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                inputMode="numeric"
              />
            </div>
            <button
              type="button"
              onClick={addManual}
              className="w-full border border-cyan/60 bg-cyan/10 py-3 font-sans text-sm tracking-wide text-foreground transition-colors hover:bg-cyan/20"
            >
              ADD ITEM
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
