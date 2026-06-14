"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { apiFetch, clearToken } from "@/lib/api"

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror the FastAPI backend response shapes exactly.
// ─────────────────────────────────────────────────────────────────────────────

export type TaskStatus = "not_started" | "in_progress" | "completed"
export type Priority = "low" | "medium" | "high"

export type Subtask = {
  id: string
  title: string
  status: TaskStatus
  estimated_time: number | null
  points: number
  ai_suggested: boolean
}

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  due_date: string | null
  subtasks: Subtask[]
  subtask_count: number
  completed_subtask_count: number
  bonus_points: number
  bonus_reason: string
}

export type Reward = {
  id: string
  name: string
  description: string
  cost: number
  ai_suggested_cost: number | null
  ai_reason: string
  claimed: boolean
}

export type UserProfile = {
  id: string
  email: string
  username: string
  member_since: string
  total_points: number
  level: number
  level_title: string
}

export type UserStats = {
  points_and_level: {
    total_points: number
    level: number
    level_progress: {
      percentage_to_next_level: number
      points_needed_for_next_level: number
    }
  }
  tasks: {
    total: number
    completed: number
    in_progress: number
    not_started: number
  }
  subtasks: {
    total: number
    completed: number
    ai_generated: number
  }
  rewards: {
    total: number
    claimed: number
    available: number
  }
}

export type UserProgress = {
  total_points: number
  level: number
  percentage_to_next_level: number
  points_needed_for_next_level: number
}

// ── Request payload helper types ──────────────────────────────────────────────

export type TaskCreateInput = {
  title: string
  description?: string
  priority?: Priority
  due_date?: string | null
}

export type TaskUpdateInput = Partial<TaskCreateInput>

export type RewardCreateInput = {
  name: string
  description?: string
  cost: number
}

export type RewardUpdateInput = Partial<RewardCreateInput>

export type SubtaskCreateInput = {
  title: string
  description?: string
  estimated_time?: number
  points?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────────────────────

type GameState = {
  // Server data
  tasks: Task[]
  rewards: Reward[]
  stats: UserStats | null
  profile: UserProfile | null
  progress: UserProgress | null

  // UI state
  loading: boolean
  error: string | null

  // Lifecycle
  refreshAll: () => Promise<void>

  // Task actions
  createTask: (input: TaskCreateInput) => Promise<void>
  updateTask: (taskId: string, input: TaskUpdateInput) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>
  breakdownTask: (taskId: string) => Promise<void>

  // Subtask actions
  addSubtask: (taskId: string, input: SubtaskCreateInput) => Promise<void>
  completeSubtask: (subtaskId: string) => Promise<void>
  deleteSubtask: (subtaskId: string) => Promise<void>

  // Reward actions
  createReward: (input: RewardCreateInput) => Promise<void>
  updateReward: (rewardId: string, input: RewardUpdateInput) => Promise<void>
  deleteReward: (rewardId: string) => Promise<void>
  analyzeReward: (rewardId: string) => Promise<void>
  claimReward: (rewardId: string) => Promise<void>
}

const GameContext = createContext<GameState | null>(null)

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Granular refreshers ─────────────────────────────────────────────────────
  const refreshTasks = useCallback(async () => {
    const data = await apiFetch<Task[]>("/api/tasks")
    setTasks(data)
  }, [])

  const refreshRewards = useCallback(async () => {
    const data = await apiFetch<Reward[]>("/api/rewards")
    setRewards(data)
  }, [])

  const refreshStats = useCallback(async () => {
    const data = await apiFetch<UserStats>("/api/user/stats")
    setStats(data)
  }, [])

  const refreshProfile = useCallback(async () => {
    const data = await apiFetch<UserProfile>("/api/user/profile")
    setProfile(data)
  }, [])

  const refreshProgress = useCallback(async () => {
    const data = await apiFetch<UserProgress>("/api/user/progress")
    setProgress(data)
  }, [])

  // Refresh the gamification-derived data (points/level/stats/progress).
  const refreshGamification = useCallback(async () => {
    await Promise.all([refreshStats(), refreshProfile(), refreshProgress()])
  }, [refreshStats, refreshProfile, refreshProgress])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        refreshTasks(),
        refreshRewards(),
        refreshStats(),
        refreshProfile(),
        refreshProgress(),
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your data.")
    } finally {
      setLoading(false)
    }
  }, [refreshTasks, refreshRewards, refreshStats, refreshProfile, refreshProgress])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  // ── Task actions ────────────────────────────────────────────────────────────
  const createTask = useCallback(
    async (input: TaskCreateInput) => {
      await apiFetch("/api/tasks", { method: "POST", body: input })
      await Promise.all([refreshTasks(), refreshGamification()])
    },
    [refreshTasks, refreshGamification],
  )

  const updateTask = useCallback(
    async (taskId: string, input: TaskUpdateInput) => {
      await apiFetch(`/api/tasks/${taskId}`, { method: "PUT", body: input })
      await refreshTasks()
    },
    [refreshTasks],
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" })
      await Promise.all([refreshTasks(), refreshGamification()])
    },
    [refreshTasks, refreshGamification],
  )

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      await apiFetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        body: { status },
      })
      await Promise.all([refreshTasks(), refreshGamification()])
    },
    [refreshTasks, refreshGamification],
  )

  const breakdownTask = useCallback(
    async (taskId: string) => {
      await apiFetch(`/api/tasks/${taskId}/breakdown`, { method: "POST" })
      await refreshTasks()
    },
    [refreshTasks],
  )

  // ── Subtask actions ─────────────────────────────────────────────────────────
  const addSubtask = useCallback(
    async (taskId: string, input: SubtaskCreateInput) => {
      await apiFetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        body: input,
      })
      await refreshTasks()
    },
    [refreshTasks],
  )

  const completeSubtask = useCallback(
    async (subtaskId: string) => {
      await apiFetch(`/api/subtasks/${subtaskId}/complete`, { method: "PATCH" })
      await Promise.all([refreshTasks(), refreshGamification()])
    },
    [refreshTasks, refreshGamification],
  )

  const deleteSubtask = useCallback(
    async (subtaskId: string) => {
      await apiFetch(`/api/subtasks/${subtaskId}`, { method: "DELETE" })
      await Promise.all([refreshTasks(), refreshGamification()])
    },
    [refreshTasks, refreshGamification],
  )

  // ── Reward actions ──────────────────────────────────────────────────────────
  const createReward = useCallback(
    async (input: RewardCreateInput) => {
      await apiFetch("/api/rewards", { method: "POST", body: input })
      await refreshRewards()
    },
    [refreshRewards],
  )

  const updateReward = useCallback(
    async (rewardId: string, input: RewardUpdateInput) => {
      await apiFetch(`/api/rewards/${rewardId}`, { method: "PUT", body: input })
      await refreshRewards()
    },
    [refreshRewards],
  )

  const deleteReward = useCallback(
    async (rewardId: string) => {
      await apiFetch(`/api/rewards/${rewardId}`, { method: "DELETE" })
      await refreshRewards()
    },
    [refreshRewards],
  )

  const analyzeReward = useCallback(
    async (rewardId: string) => {
      await apiFetch(`/api/rewards/${rewardId}/analyze`, { method: "POST" })
      await refreshRewards()
    },
    [refreshRewards],
  )

  const claimReward = useCallback(
    async (rewardId: string) => {
      await apiFetch(`/api/rewards/${rewardId}/claim`, { method: "POST" })
      await Promise.all([refreshRewards(), refreshGamification()])
    },
    [refreshRewards, refreshGamification],
  )

  return (
    <GameContext.Provider
      value={{
        tasks,
        rewards,
        stats,
        profile,
        progress,
        loading,
        error,
        refreshAll,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        breakdownTask,
        addSubtask,
        completeSubtask,
        deleteSubtask,
        createReward,
        updateReward,
        deleteReward,
        analyzeReward,
        claimReward,
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

// Convenience: clear the session token (used by logout flows).
export { clearToken }
