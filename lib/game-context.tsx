"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

/* ── Frontend types (unchanged for component compatibility) ──────────────── */

export type Difficulty = "Easy" | "Normal" | "Hard"
export type Urgency = "Urgent" | "Normal"

export type SubTask = {
  id: string
  title: string
  done: boolean
}

export type Task = {
  id: string
  title: string
  description?: string
  dueDate?: string
  done: boolean
  completedAt?: number
  urgency: Urgency
  difficulty: Difficulty
  subtasks: SubTask[]
}

export type ShopItem = {
  id: string
  name: string
  cost: number
  icon: "instagram" | "chips" | "book" | "coffee" | "diamond" | "chest"
}

export type Purchase = {
  id: string
  name: string
  cost: number
  purchasedAt: number
  icon: string
  redeemed: boolean
}

type GameState = {
  coins: number
  xp: number
  level: number
  streak: number
  tasks: Task[]
  shopItems: ShopItem[]
  purchases: Purchase[]
  isLoading: boolean
  toggleTask: (id: string) => void
  toggleSub: (taskId: string, subId: string) => void
  addTask: (task: Omit<Task, "id">) => Promise<void>
  addAiTask: (task: {
    title: string
    description: string
    urgency: Urgency
    difficulty: Difficulty
    dueDate?: string
  }) => Promise<void>
  buyItem: (id: string) => void
  redeemPurchase: (id: string) => Promise<void>
  addShopItem: (item: Omit<ShopItem, "id">) => Promise<void>
  removeShopItem: (id: string) => void
  refreshData: () => Promise<void>
}

const GameContext = createContext<GameState | null>(null)

/* ── Mappers: backend → frontend ─────────────────────────────────────────── */

function mapBackendTask(bt: any): Task {
  return {
    id: String(bt.id),
    title: bt.title,
    description: bt.description || undefined,
    dueDate: bt.due_date || undefined,
    done: bt.status === "completed",
    completedAt: bt.status === "completed" ? Date.now() : undefined,
    urgency: bt.priority === "high" ? "Urgent" : "Normal",
    difficulty: (bt.difficulty as Difficulty) || "Normal",
    subtasks: (bt.subtasks || []).map((s: any) => ({
      id: String(s.id),
      title: s.title,
      done: s.status === "completed",
    })),
  }
}

function mapBackendReward(r: any): ShopItem {
  return {
    id: String(r.id),
    name: r.name,
    cost: r.cost,
    icon: r.icon || "chest",
  }
}

function mapBackendPurchase(r: any): Purchase {
  return {
    id: String(r.id),
    name: r.name,
    cost: r.cost,
    purchasedAt: Date.now(),
    icon: r.icon || "chest",
    redeemed: r.redeemed || false,
  }
}

/* ── Mappers: frontend → backend ─────────────────────────────────────────── */

function urgencyToPriority(u: Urgency): string {
  return u === "Urgent" ? "high" : "medium"
}

/* ── Provider ────────────────────────────────────────────────────────────── */

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [coins, setCoins] = useState(0)
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [streak] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /* ── Fetch all data from API ─────────────────────────────────────────── */

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true)

      const [tasksData, rewardsData, statsData] = await Promise.all([
        api.get("/api/tasks"),
        api.get("/api/rewards"),
        api.get("/api/user/stats"),
      ])

      // Tasks
      setTasks(tasksData.map(mapBackendTask))

      // Rewards: unclaimed = shop items, claimed = purchase history
      const unclaimed = rewardsData.filter((r: any) => !r.claimed)
      const claimed = rewardsData.filter((r: any) => r.claimed)
      setShopItems(unclaimed.map(mapBackendReward))
      setPurchases(claimed.map(mapBackendPurchase))

      // Stats
      const pts = statsData.points_and_level
      setCoins(pts.total_points)
      setXp(pts.total_points)
      setLevel(pts.level)
    } catch (err) {
      console.error("Failed to load game data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  /* ── Auto-remove completed tasks after 24 hours ──────────────────────── */

  useEffect(() => {
    const interval = setInterval(() => {
      const oneDayMs = 24 * 60 * 60 * 1000
      setTasks((prev) => {
        const toRemove = prev.filter(
          (t) => t.done && t.completedAt && Date.now() - t.completedAt >= oneDayMs,
        )
        toRemove.forEach((t) => {
          api.delete(`/api/tasks/${t.id}`).catch(console.error)
        })
        return prev.filter((t) => !toRemove.some((r) => r.id === t.id))
      })
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  /* ── Toggle task done/undone ─────────────────────────────────────────── */

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id)
      if (!task) return prev

      const newDone = !task.done
      const newStatus = newDone ? "completed" : "not_started"

      // API call (fire-and-forget, refresh stats after)
      api
        .patch(`/api/tasks/${id}/status`, { status: newStatus })
        .then(() => api.get("/api/user/stats"))
        .then((stats) => {
          const pts = stats.points_and_level
          setCoins(pts.total_points)
          setXp(pts.total_points)
          setLevel(pts.level)
        })
        .catch(console.error)

      return prev.map((t) =>
        t.id === id
          ? { ...t, done: newDone, completedAt: newDone ? Date.now() : undefined }
          : t,
      )
    })
  }, [])

  /* ── Toggle subtask done ─────────────────────────────────────────────── */

  const toggleSub = useCallback((taskId: string, subId: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId)
      const sub = task?.subtasks.find((s) => s.id === subId)

      if (sub && !sub.done) {
        // Mark as completed via API → awards points
        api
          .patch(`/api/subtasks/${subId}/complete`)
          .then((result) => {
            setCoins(result.total_points)
            setXp(result.total_points)
            setLevel(result.level)
            // If this completed the whole task, mark it done locally
            if (result.task_completed) {
              setTasks((p) =>
                p.map((t) =>
                  t.id === taskId
                    ? { ...t, done: true, completedAt: Date.now() }
                    : t,
                ),
              )
            }
          })
          .catch(console.error)
      }

      return prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subId ? { ...s, done: !s.done } : s,
              ),
            }
          : t,
      )
    })
  }, [])

  /* ── Create a new task with subtasks ──────────────────────────────────── */

  const addTask = useCallback(async (task: Omit<Task, "id">) => {
    try {
      // 1. Create the task
      const created = await api.post("/api/tasks", {
        title: task.title,
        description: task.description || "",
        priority: urgencyToPriority(task.urgency),
        due_date: task.dueDate || null,
      })

      const taskId = String(created.id)

      // 2. Create each subtask
      for (const sub of task.subtasks) {
        await api.post(`/api/tasks/${taskId}/subtasks`, {
          title: sub.title,
        })
      }

      // 3. Re-fetch the task to get the full data with subtask IDs
      const fullTask = await api.get(`/api/tasks/${taskId}`)
      setTasks((prev) => [mapBackendTask(fullTask), ...prev])
    } catch (err) {
      console.error("Failed to create task:", err)
      throw err
    }
  }, [])

  const addAiTask = useCallback(async (task: {
    title: string
    description: string
    urgency: Urgency
    difficulty: Difficulty
    dueDate?: string
  }) => {
    try {
      // 1. Create the task via API
      const created = await api.post("/api/tasks", {
        title: task.title,
        description: task.description,
        priority: urgencyToPriority(task.urgency),
        difficulty: task.difficulty,
        due_date: task.dueDate || null,
      })

      const taskId = String(created.id)

      // 2. Call breakdown API with difficulty/priority in body
      await api.post(`/api/tasks/${taskId}/breakdown`, {
        difficulty: task.difficulty,
        priority: urgencyToPriority(task.urgency),
      })

      // 3. Re-fetch full task to update state
      const fullTask = await api.get(`/api/tasks/${taskId}`)
      setTasks((prev) => [mapBackendTask(fullTask), ...prev])
      
      // 4. Refresh stats to update points/levels from AI generation if any
      await refreshData()
    } catch (err) {
      console.error("Failed to create AI task:", err)
      throw err
    }
  }, [refreshData])

  /* ── Buy / claim a reward ────────────────────────────────────────────── */

  const buyItem = useCallback((id: string) => {
    const item = shopItems.find((i) => i.id === id)
    if (!item || coins < item.cost) return

    // Optimistic update
    setCoins((c) => c - item.cost)
    setShopItems((prev) => prev.filter((i) => i.id !== id))
    setPurchases((prev) => [
      ...prev,
      { id: String(item.id), name: item.name, cost: item.cost, purchasedAt: Date.now(), icon: item.icon, redeemed: false },
    ])

    // API call
    api
      .post(`/api/rewards/${id}/claim`)
      .then((result) => {
        setCoins(result.remaining_points)
        setXp(result.remaining_points)
        setLevel(result.level)
      })
      .catch((err) => {
        console.error("Failed to claim reward:", err)
        // Revert on failure
        setCoins((c) => c + item.cost)
        setShopItems((prev) => [...prev, item])
        setPurchases((prev) => prev.filter((p) => p.id !== item.id))
      })
  }, [shopItems, coins])

  const redeemPurchase = useCallback(async (id: string) => {
    try {
      await api.post(`/api/rewards/${id}/redeem`)
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, redeemed: true } : p))
      )
    } catch (err) {
      console.error("Failed to redeem reward:", err)
      throw err
    }
  }, [])

  /* ── Add a new shop item / reward ────────────────────────────────────── */

  const addShopItem = useCallback(async (item: Omit<ShopItem, "id">) => {
    try {
      const created = await api.post("/api/rewards", {
        name: item.name,
        cost: item.cost,
      })
      setShopItems((prev) => [...prev, mapBackendReward(created)])
    } catch (err) {
      console.error("Failed to add shop item:", err)
      throw err
    }
  }, [])

  /* ── Delete a shop item / reward ─────────────────────────────────────── */

  const removeShopItem = useCallback((id: string) => {
    setShopItems((prev) => prev.filter((item) => item.id !== id))
    api.delete(`/api/rewards/${id}`).catch((err) => {
      console.error("Failed to delete reward:", err)
      refreshData()
    })
  }, [refreshData])

  return (
    <GameContext.Provider
      value={{
        coins,
        xp,
        level,
        streak,
        tasks,
        shopItems,
        purchases,
        isLoading,
        toggleTask,
        toggleSub,
        addTask,
        addAiTask,
        buyItem,
        redeemPurchase,
        addShopItem,
        removeShopItem,
        refreshData,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}
