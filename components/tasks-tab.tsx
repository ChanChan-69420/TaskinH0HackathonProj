"use client"

import { useState } from "react"
import { Sparkles, Plus, Pencil, Trash2, X, Check } from "lucide-react"
import { useGame, type Task, type Priority } from "@/lib/game-context"
import { PixelCheckbox } from "@/components/pixel-checkbox"
import { cn } from "@/lib/utils"

const field =
  "w-full border border-panel-border bg-input/40 px-3 py-2 font-mono text-base text-foreground outline-none focus:border-cyan"
const labelCls = "mb-1 block font-sans text-xs tracking-wide text-foreground/80"
const selectStyle = { backgroundColor: "#1B2D34" }

function PriorityTag({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "font-sans text-xs uppercase tracking-wide",
        priority === "high" && "text-urgent",
        priority === "medium" && "text-foreground/70",
        priority === "low" && "text-easy",
      )}
    >
      {priority}
    </span>
  )
}

// ── Subtask add inline form ────────────────────────────────────────────────
function AddSubtaskForm({ taskId }: { taskId: string }) {
  const { addSubtask } = useGame()
  const [title, setTitle] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!title.trim() || busy) return
    setBusy(true)
    try {
      await addSubtask(taskId, { title: title.trim() })
      setTitle("")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2 pl-6">
      <input
        className={cn(field, "py-1.5 text-sm")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void submit()
        }}
        placeholder="Add a subtask..."
      />
      <button
        type="button"
        onClick={() => void submit()}
        disabled={busy}
        className="flex items-center gap-1 border border-cyan/60 bg-cyan/10 px-3 py-1.5 font-sans text-xs tracking-wide text-foreground transition-colors hover:bg-cyan/20 disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" /> ADD
      </button>
    </div>
  )
}

// ── Edit task inline form ──────────────────────────────────────────────────
function EditTaskForm({ task, onDone }: { task: Task; onDone: () => void }) {
  const { updateTask } = useGame()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [dueDate, setDueDate] = useState(task.due_date ?? "")
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!title.trim() || busy) return
    setBusy(true)
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description,
        priority,
        due_date: dueDate || null,
      })
      onDone()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 space-y-3 border border-cyan/40 bg-cyan/5 p-3">
      <div>
        <label className={labelCls}>TITLE</label>
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>DESCRIPTION</label>
        <input className={field} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>PRIORITY</label>
          <select
            className={cn(field, "text-white")}
            style={selectStyle}
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>DUE DATE</label>
          <input
            type="date"
            className={cn(field, "text-white")}
            style={selectStyle}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="flex items-center gap-1 border border-cyan/60 bg-cyan/10 px-4 py-2 font-sans text-xs tracking-wide text-foreground hover:bg-cyan/20 disabled:opacity-50"
        >
          <Check className="h-4 w-4" /> SAVE
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex items-center gap-1 border border-panel-border px-4 py-2 font-sans text-xs tracking-wide text-foreground/70 hover:text-foreground"
        >
          <X className="h-4 w-4" /> CANCEL
        </button>
      </div>
    </div>
  )
}

// ── Single task card ───────────────────────────────────────────────────────
function TaskCard({ task }: { task: Task }) {
  const { updateTaskStatus, deleteTask, breakdownTask, completeSubtask, deleteSubtask } = useGame()
  const [editing, setEditing] = useState(false)
  const [breakingDown, setBreakingDown] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const done = task.status === "completed"

  async function toggleTask() {
    if (busyId) return
    setBusyId("task")
    try {
      await updateTaskStatus(task.id, done ? "not_started" : "completed")
    } finally {
      setBusyId(null)
    }
  }

  async function handleBreakdown() {
    setActionError(null)
    setBreakingDown(true)
    try {
      await breakdownTask(task.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "AI breakdown failed.")
    } finally {
      setBreakingDown(false)
    }
  }

  async function handleCompleteSub(subId: string) {
    if (busyId) return
    setBusyId(subId)
    try {
      await completeSubtask(subId)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDeleteSub(subId: string) {
    if (busyId) return
    setBusyId(subId)
    try {
      await deleteSubtask(subId)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <li className="border-t border-panel-border/50 pt-3 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-3 pb-1">
        <PixelCheckbox checked={done} onChange={() => void toggleTask()} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "font-sans text-base uppercase tracking-wide sm:text-lg",
                done ? "text-foreground/55 line-through" : "text-foreground",
              )}
            >
              {task.title}
            </span>
            <PriorityTag priority={task.priority} />
            {task.due_date && (
              <span className="font-mono text-xs text-foreground/50">due {task.due_date}</span>
            )}
          </div>
          {task.description && (
            <p className="mt-1 font-mono text-sm text-foreground/60">{task.description}</p>
          )}
          <p className="mt-1 font-mono text-xs text-foreground/50">
            {task.completed_subtask_count}/{task.subtask_count} subtasks
            {task.bonus_points > 0 && (
              <span className="ml-2 text-gold">+{task.bonus_points} bonus</span>
            )}
          </p>
          {task.bonus_reason && (
            <p className="mt-1 font-mono text-xs italic text-cyan/80">{task.bonus_reason}</p>
          )}
        </div>

        {/* Task action buttons */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => void handleBreakdown()}
            disabled={breakingDown}
            title="AI breakdown"
            className="border border-panel-border bg-input/40 p-1.5 text-cyan transition-colors hover:border-cyan disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            title="Edit task"
            className="border border-panel-border bg-input/40 p-1.5 text-foreground/70 transition-colors hover:border-cyan hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void deleteTask(task.id)}
            title="Delete task"
            className="border border-panel-border bg-input/40 p-1.5 text-urgent/80 transition-colors hover:border-urgent hover:text-urgent"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {breakingDown && (
        <p className="pl-9 font-mono text-xs text-cyan">Generating subtasks with AI...</p>
      )}
      {actionError && <p className="pl-9 font-mono text-xs text-urgent">{actionError}</p>}

      {/* Subtasks */}
      {task.subtasks.map((sub) => {
        const subDone = sub.status === "completed"
        return (
          <div key={sub.id} className="flex items-center gap-3 pb-2 pl-6 pt-2">
            <svg
              viewBox="0 0 14 14"
              className="h-4 w-4 shrink-0 text-cyan/70"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path d="M2 2 L2 10 L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              <path d="M9 7 L12 10 L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
            <PixelCheckbox
              checked={subDone}
              onChange={() => {
                if (!subDone) void handleCompleteSub(sub.id)
              }}
              className="h-5 w-5"
            />
            <span
              className={cn(
                "flex-1 font-mono text-lg tracking-wide",
                subDone ? "text-foreground/55 line-through" : "text-foreground",
              )}
            >
              {sub.title}
              {sub.ai_suggested && <span className="ml-2 font-sans text-[10px] text-cyan">AI</span>}
              <span className="ml-2 text-xs text-gold">+{sub.points}</span>
            </span>
            <button
              type="button"
              onClick={() => void handleDeleteSub(sub.id)}
              title="Delete subtask"
              className="p-1 text-urgent/70 transition-colors hover:text-urgent"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}

      {!editing && <AddSubtaskForm taskId={task.id} />}
      {editing && <EditTaskForm task={task} onDone={() => setEditing(false)} />}
    </li>
  )
}

// ── Create task form ───────────────────────────────────────────────────────
function CreateTaskForm() {
  const { createTask } = useGame()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [dueDate, setDueDate] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create() {
    if (!title.trim() || busy) return
    setError(null)
    setBusy(true)
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate || null,
      })
      setTitle("")
      setDescription("")
      setPriority("medium")
      setDueDate("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>TASK TITLE</label>
        <input
          className={field}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task..."
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>PRIORITY</label>
          <select
            className={cn(field, "text-white")}
            style={selectStyle}
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>DUE DATE</label>
          <input
            type="date"
            className={cn(field, "text-white")}
            style={selectStyle}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="font-mono text-xs text-urgent">{error}</p>}

      <button
        type="button"
        onClick={() => void create()}
        disabled={busy}
        className="mt-2 w-full border border-cyan/60 bg-cyan/10 py-4 font-sans text-lg tracking-wider text-foreground transition-colors hover:bg-cyan/20 disabled:opacity-50"
      >
        {busy ? "CREATING..." : "CREATE NEW TASK"}
      </button>
      <p className="font-mono text-xs text-foreground/50">
        Tip: after creating, use the AI breakdown button to auto-generate subtasks.
      </p>
    </div>
  )
}

export function TasksTab() {
  const { tasks } = useGame()

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="game-panel p-5 sm:p-6">
        <h2 className="mb-5 font-sans text-2xl tracking-wide text-foreground">YOUR TASKS</h2>
        {tasks.length === 0 ? (
          <p className="font-mono text-base text-foreground/60">
            No tasks yet. Create one on the right to get started.
          </p>
        ) : (
          <ul className="thin-scroll max-h-[560px] space-y-4 overflow-y-auto pr-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </ul>
        )}
      </section>

      <section className="game-panel flex flex-col p-5 sm:p-6">
        <h2 className="mb-5 font-sans text-2xl tracking-wide text-foreground">CREATE TASK</h2>
        <CreateTaskForm />
      </section>
    </div>
  )
}
