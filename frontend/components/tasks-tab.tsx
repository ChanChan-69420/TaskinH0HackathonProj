"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, X, Settings, CalendarDays } from "lucide-react"
import { useGame, type Difficulty, type Urgency } from "@/lib/game-context"
import { PixelCheckbox } from "@/components/pixel-checkbox"
import { cn } from "@/lib/utils"

function Tag({ kind, label }: { kind: "urgent" | "easy" | "hard" | "normal"; label: string }) {
  return (
    <span
      className={cn(
        "font-sans text-sm tracking-wide",
        kind === "urgent" && "text-urgent",
        kind === "hard" && "text-hard",
        kind === "easy" && "text-easy",
        kind === "normal" && "text-foreground/70",
      )}
    >
      {label}
    </span>
  )
}

function TaskRow() {
  const { tasks, toggleTask, toggleSub } = useGame()
  return (
    <ul className="thin-scroll max-h-[460px] space-y-1 overflow-y-auto pr-2">
      {tasks.map((task, i) => (
        <li key={task.id} className={cn(i !== 0 && "border-t border-panel-border/50 pt-3")}>
          <div className="flex items-center gap-3 pb-1">
            <PixelCheckbox checked={task.done} onChange={() => toggleTask(task.id)} />
            <span
              className={cn(
                "flex-1 font-sans text-base uppercase tracking-wide sm:text-lg",
                task.done ? "text-foreground/55" : "text-foreground",
              )}
            >
              {task.title}
            </span>
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-sans text-xs tracking-wide text-gold/80">
                <Image src="/icons/coin.png" alt="points" width={14} height={14} className="pixelated" />
                {task.totalPoints}
              </span>
              <span className="text-foreground/30">|</span>
              <Tag kind={task.urgency === "Urgent" ? "urgent" : "normal"} label={task.urgency} />
              <span className="text-foreground/40">,</span>
              <Tag
                kind={task.difficulty === "Easy" ? "easy" : task.difficulty === "Hard" ? "hard" : "normal"}
                label={task.difficulty}
              />
            </span>
          </div>
          {/* Description */}
          {task.description && (
            <p className="pb-1 pl-9 font-sans text-xs leading-relaxed tracking-wide text-foreground/60">
              {task.description}
            </p>
          )}
          {/* Due Date */}
          {task.dueDate && (
            <p className="flex items-center gap-1.5 pb-2 pl-9 font-sans text-xs tracking-wide text-cyan/70">
              <CalendarDays className="h-3 w-3" />
              Due: {task.dueDate}
            </p>
          )}
          {task.subtasks.map((sub) => (
            <div key={sub.id} className="flex items-center gap-3 pb-2 pl-6">
              {/* Pixel-art corner arrow for subtask indent */}
              <svg viewBox="0 0 14 14" className="h-4 w-4 shrink-0 text-cyan/70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M2 2 L2 10 L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
                <path d="M9 7 L12 10 L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
              <PixelCheckbox checked={sub.done} onChange={() => toggleSub(task.id, sub.id)} className="h-5 w-5" />
              <span
                className={cn(
                  "flex-1 font-mono text-xl tracking-wide",
                  sub.done ? "text-foreground/55" : "text-foreground",
                )}
              >
                {sub.title}
              </span>
              <span className="flex items-center gap-1 font-sans text-xs tracking-wide text-gold/60">
                +{sub.points}
              </span>
            </div>
          ))}
        </li>
      ))}
      {tasks.length === 0 && (
        <li className="py-12 text-center font-sans text-sm tracking-wide text-foreground/50">
          NO TASKS YET — CREATE ONE!
        </li>
      )}
    </ul>
  )
}

function AiGrading() {
  const { addAiTask } = useGame()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [urgency, setUrgency] = useState<Urgency>("Normal")
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy")
  const [analyzing, setAnalyzing] = useState(false)

  const CHAR_LIMIT = 100

  const handleAnalyze = async () => {
    if (!title.trim() || !description.trim() || analyzing) return
    setAnalyzing(true)
    try {
      await addAiTask({
        title: title.slice(0, CHAR_LIMIT),
        description: description.trim(),
        urgency,
        difficulty,
        dueDate: dueDate || undefined,
      })
      setTitle("")
      setDescription("")
      setDueDate("")
      setUrgency("Normal")
      setDifficulty("Easy")
    } catch (err) {
      console.error("AI breakdown failed:", err)
    } finally {
      setAnalyzing(false)
    }
  }

  const field = "w-full border border-panel-border bg-input/40 px-3 py-2 font-mono text-lg text-foreground outline-none focus:border-cyan"
  const label = "mb-1 block font-sans text-xs tracking-wide text-foreground/80"

  return (
    <div className="space-y-3">
      {/* Task Name */}
      <div>
        <label className={label}>TASK NAME</label>
        <input
          className={field}
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, CHAR_LIMIT))}
          placeholder="Enter task name..."
          maxLength={CHAR_LIMIT}
        />
        <p className="mt-0.5 text-right font-sans text-[10px] tracking-wide text-foreground/50">
          {title.length}/{CHAR_LIMIT}
        </p>
      </div>

      {/* Description / Prompt */}
      <div>
        <label className={label}>PROMPT / DESCRIPTION FOR AI</label>
        <textarea
          className={cn(field, "min-h-[100px] resize-y")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task in detail. AI will use this prompt to divide the task into subtasks and scale rewards accordingly..."
          rows={4}
        />
      </div>

      {/* Due Date */}
      <div>
        <label className={label}>DUE DATE</label>
        <input
          type="date"
          className={cn(field, "text-foreground")}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ colorScheme: "dark" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>URGENCY</label>
          <select
            className={cn(field, "text-white")}
            style={{ backgroundColor: "#1B2D34" }}
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as Urgency)}
          >
            <option>Urgent</option>
            <option>Normal</option>
          </select>
        </div>
        <div>
          <label className={label}>DIFFICULTY</label>
          <select
            className={cn(field, "text-white")}
            style={{ backgroundColor: "#1B2D34" }}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option>Easy</option>
            <option>Normal</option>
            <option>Hard</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={analyzing || !title.trim() || !description.trim()}
        className="mt-2 flex w-full items-center justify-center gap-2 border border-cyan/60 bg-cyan/10 py-4 font-sans text-lg tracking-wider text-foreground transition-colors hover:bg-cyan/20 disabled:opacity-50"
      >
        {analyzing ? "AI GENERATING SUBTASKS..." : "ANALYZE & CREATE WITH AI"} <Settings className={cn("h-5 w-5", analyzing && "animate-spin")} />
      </button>
    </div>
  )
}

function ManualGrading() {
  const { addTask } = useGame()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [urgency, setUrgency] = useState<Urgency>("Normal")
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy")
  const [creating, setCreating] = useState(false)

  // Task 6: Manual subtask input — list of named subtasks
  const [subtaskInput, setSubtaskInput] = useState("")
  const [subtaskList, setSubtaskList] = useState<string[]>([])

  const addSubtask = () => {
    const trimmed = subtaskInput.trim()
    if (!trimmed) return
    setSubtaskList((prev) => [...prev, trimmed])
    setSubtaskInput("")
  }

  const removeSubtask = (index: number) => {
    setSubtaskList((prev) => prev.filter((_, i) => i !== index))
  }

  const CHAR_LIMIT = 100

  const create = async () => {
    if (!title.trim() || creating) return
    setCreating(true)
    try {
      await addTask({
        title: title.slice(0, CHAR_LIMIT),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        done: false,
        urgency,
        difficulty,
        subtasks: subtaskList.map((name, i) => ({
          id: `temp-${i}`,
          title: name,
          done: false,
          points: 10,
        })),
      })
      setTitle("")
      setDescription("")
      setDueDate("")
      setSubtaskInput("")
      setSubtaskList([])
    } catch (err) {
      console.error("Failed to create task:", err)
    } finally {
      setCreating(false)
    }
  }

  const field = "w-full border border-panel-border bg-input/40 px-3 py-2 font-mono text-lg text-foreground outline-none focus:border-cyan"
  const label = "mb-1 block font-sans text-xs tracking-wide text-foreground/80"

  return (
    <div className="space-y-3">
      {/* Task Name with char limit */}
      <div>
        <label className={label}>TASK NAME</label>
        <input
          className={field}
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, CHAR_LIMIT))}
          placeholder="Enter task..."
          maxLength={CHAR_LIMIT}
        />
        <p className="mt-0.5 text-right font-sans text-[10px] tracking-wide text-foreground/50">
          {title.length}/{CHAR_LIMIT}
        </p>
      </div>

      {/* Description */}
      <div>
        <label className={label}>DESCRIPTION</label>
        <textarea
          className={cn(field, "min-h-[60px] resize-y")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task..."
          rows={2}
        />
      </div>

      {/* Due Date */}
      <div>
        <label className={label}>DUE DATE</label>
        <input
          type="date"
          className={cn(field, "text-foreground")}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ colorScheme: "dark" }}
        />
      </div>

      {/* Manual Subtask Input */}
      <div>
        <label className={label}>SUBTASKS</label>
        <div className="flex gap-2">
          <input
            className={cn(field, "flex-1")}
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            placeholder="Enter subtask name..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addSubtask()
              }
            }}
          />
          <button
            type="button"
            onClick={addSubtask}
            className="flex items-center gap-1 border border-cyan/60 bg-cyan/10 px-3 font-sans text-xs tracking-wide text-foreground transition-colors hover:bg-cyan/20"
          >
            <Plus className="h-3.5 w-3.5" /> ADD
          </button>
        </div>
        {/* Subtask list preview */}
        {subtaskList.length > 0 && (
          <ul className="mt-2 space-y-1">
            {subtaskList.map((sub, i) => (
              <li
                key={i}
                className="flex items-center gap-2 border border-panel-border/50 bg-input/20 px-3 py-1.5 font-sans text-sm tracking-wide text-foreground/80"
              >
                <span className="text-cyan/60 font-mono text-xs">{i + 1}.</span>
                <span className="flex-1">{sub}</span>
                <button
                  type="button"
                  onClick={() => removeSubtask(i)}
                  className="text-foreground/40 transition-colors hover:text-red-400"
                  aria-label={`Remove subtask ${sub}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>URGENCY</label>
          <select
            className={cn(field, "text-white")}
            style={{ backgroundColor: "#1B2D34" }}
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as Urgency)}
          >
            <option>Urgent</option>
            <option>Normal</option>
          </select>
        </div>
        <div>
          <label className={label}>DIFFICULTY</label>
          <select
            className={cn(field, "text-white")}
            style={{ backgroundColor: "#1B2D34" }}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option>Easy</option>
            <option>Normal</option>
            <option>Hard</option>
          </select>
        </div>
      </div>

      {/* Create button */}
      <button
        type="button"
        onClick={create}
        disabled={creating || !title.trim()}
        className="mt-2 w-full border border-cyan/60 bg-cyan/10 py-4 font-sans text-lg tracking-wider text-foreground transition-colors hover:bg-cyan/20 disabled:opacity-50"
      >
        {creating ? "CREATING..." : "CREATE NEW TASK"}
      </button>
    </div>
  )
}

export function TasksTab() {
  const { isLoading } = useGame()
  const [mode, setMode] = useState<"ai" | "manual">("manual")

  return (
    <div id="tasks-tab-container" className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="game-panel p-5 sm:p-6">
        {isLoading ? (
          <p className="py-12 text-center font-sans text-sm tracking-wide text-foreground/50">
            LOADING TASKS...
          </p>
        ) : (
          <TaskRow />
        )}
      </section>

      <section className="game-panel flex flex-col p-5 sm:p-6">
        <h2 className="mb-5 font-sans text-2xl tracking-wide text-foreground">REWARDS &amp; GRADING</h2>

        <div className="mb-5 grid grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={cn(
              "border-b-2 py-2 font-sans text-sm tracking-wide transition-colors",
              mode === "ai" ? "border-cyan bg-cyan/10 text-cyan" : "border-panel-border text-foreground/70",
            )}
          >
            AI GRADING
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

        <div className="flex-1">{mode === "ai" ? <AiGrading /> : <ManualGrading />}</div>
      </section>
    </div>
  )
}
