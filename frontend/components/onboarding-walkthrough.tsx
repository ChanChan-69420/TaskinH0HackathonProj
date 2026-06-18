"use client"

import React, { useState, useEffect } from "react"
import { Tab } from "@/components/top-nav"

type Step = {
  id: string
  title: string
  content: string
  tab: Tab | null
  targetSelector: string | null
}

const STEPS: Step[] = [
  {
    id: "welcome",
    title: "WELCOME TO TASKIN!",
    content: "Welcome to Taskin! Let's get you started.",
    tab: "dashboard",
    targetSelector: null,
  },
  {
    id: "dashboard",
    title: "DASHBOARD",
    content: "View your XP, level, streaks, achievements, and overall progress.",
    tab: "dashboard",
    targetSelector: "#dashboard-stats-card",
  },
  {
    id: "tasks",
    title: "TASKS",
    content: "Create tasks, complete them, and earn rewards.",
    tab: "tasks",
    targetSelector: "#tasks-tab-container",
  },
  {
    id: "pomodoro",
    title: "POMODORO",
    content: "Use focus sessions to gain bonus XP and improve productivity.",
    tab: "pomodoro",
    targetSelector: "#pomodoro-timer-card",
  },
  {
    id: "profile",
    title: "PROFILE",
    content: "Track your level, streak, badges, and account information.",
    tab: "profile",
    targetSelector: "#profile-main-card",
  },
  {
    id: "shop",
    title: "SHOP",
    content: "Spend coins earned from completing tasks.",
    tab: "shop",
    targetSelector: "#shop-tab-container",
  },
  {
    id: "completion",
    title: "COMPLETION SCREEN",
    content: "Tutorial complete! Begin your productivity journey.",
    tab: "dashboard",
    targetSelector: null,
  },
]

type OnboardingWalkthroughProps = {
  isOpen: boolean
  currentTab: Tab
  onTabChange: (tab: Tab) => void
  onClose: () => void
}

export function OnboardingWalkthrough({
  isOpen,
  currentTab,
  onTabChange,
  onClose,
}: OnboardingWalkthroughProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [highlightRect, setHighlightRect] = useState<{
    top: number
    left: number
    width: number
    height: number
  } | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  })

  // Handle tab switching automatically per step definition
  useEffect(() => {
    if (!isOpen) return
    const step = STEPS[currentStepIndex]
    if (step.tab && currentTab !== step.tab) {
      onTabChange(step.tab)
    }
  }, [currentStepIndex, onTabChange, currentTab, isOpen])

  // Recalculate target element coordinates
  useEffect(() => {
    if (!isOpen) return
    const step = STEPS[currentStepIndex]
    let active = true

    const updateRect = () => {
      if (!active) return
      if (!step.targetSelector) {
        setHighlightRect(null)
        return
      }

      const element = document.querySelector(step.targetSelector)
      if (element) {
        const rect = element.getBoundingClientRect()
        // Check if the coordinates are non-zero (visible)
        if (rect.width > 0 && rect.height > 0) {
          setHighlightRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          })
        }
      } else {
        setHighlightRect(null)
      }
    }

    // Update rect immediately and with staggered delays to let rendering compile
    updateRect()
    const t1 = setTimeout(updateRect, 80)
    const t2 = setTimeout(updateRect, 250)
    const t3 = setTimeout(updateRect, 500)

    window.addEventListener("resize", updateRect)
    window.addEventListener("scroll", updateRect, true)

    return () => {
      active = false
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener("resize", updateRect)
      window.removeEventListener("scroll", updateRect, true)
    }
  }, [currentStepIndex, currentTab, isOpen])

  // Position the tooltip dynamically or anchor to bottom on mobile viewports
  useEffect(() => {
    if (!isOpen) return
    const isMobile = window.innerWidth < 640
    if (!highlightRect) {
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: isMobile ? "calc(100% - 32px)" : "420px",
        maxWidth: "420px",
      })
      return
    }

    if (isMobile) {
      setTooltipStyle({
        position: "fixed",
        bottom: "16px",
        left: "16px",
        right: "16px",
        width: "calc(100% - 32px)",
      })
      return
    }

    // Desktop: position tooltip above or below highlight area
    const margin = 16
    const tooltipWidth = 340
    const tooltipHeight = 180 // approximate height

    const spaceBelow = window.innerHeight - (highlightRect.top + highlightRect.height)
    const spaceAbove = highlightRect.top

    let top = highlightRect.top + highlightRect.height + margin
    let left = Math.max(
      margin,
      Math.min(
        window.innerWidth - tooltipWidth - margin,
        highlightRect.left + (highlightRect.width - tooltipWidth) / 2
      )
    )

    // Fallback if not enough space below
    if (spaceBelow < tooltipHeight && spaceAbove > tooltipHeight) {
      top = highlightRect.top - tooltipHeight - margin
    }

    setTooltipStyle({
      position: "fixed",
      top: `${Math.max(margin, Math.min(window.innerHeight - tooltipHeight - margin, top))}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
    })
  }, [highlightRect, isOpen])

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  };

  if (!isOpen) return null

  const currentStep = STEPS[currentStepIndex]

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* SVG Overlay to create dark background cutout */}
      <svg className="absolute inset-0 h-full w-full pointer-events-auto">
        <defs>
          <mask id="walkthrough-cutout-mask">
            {/* White parts block (fully opaque backdrop) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black parts cutout (transparent window for target element) */}
            {highlightRect && (
              <rect
                x={highlightRect.left - 6}
                y={highlightRect.top - 6}
                width={highlightRect.width + 12}
                height={highlightRect.height + 12}
                fill="black"
                rx={4}
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#walkthrough-cutout-mask)"
        />
      </svg>

      {/* Cyberpunk Highlight Border/Glow */}
      {highlightRect && (
        <div
          className="fixed border border-cyan pointer-events-none transition-all duration-150"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            zIndex: 10000,
            boxShadow: "0 0 16px rgba(34, 229, 229, 0.75), inset 0 0 10px rgba(34, 229, 229, 0.4)",
          }}
        />
      )}

      {/* Glowing Cyberpunk Tooltip Container */}
      <div
        className="pointer-events-auto flex flex-col gap-4 border border-cyan bg-[#1b2d34]/95 p-5 sm:p-6 text-foreground backdrop-blur-md transition-all duration-300"
        style={{
          ...tooltipStyle,
          zIndex: 10001,
          boxShadow: "0 0 20px rgba(34, 229, 229, 0.5), inset 0 0 8px rgba(34, 229, 229, 0.25)",
        }}
      >
        {/* Tooltip Header */}
        <div className="flex items-center justify-between border-b border-cyan/25 pb-2">
          <h4 className="font-sans text-sm font-bold tracking-widest text-cyan uppercase">
            {currentStep.title}
          </h4>
          <span className="font-mono text-xs text-foreground/45">
            {currentStepIndex + 1} / {STEPS.length}
          </span>
        </div>

        {/* Tooltip Body */}
        <p className="font-sans text-sm tracking-wide text-foreground/80 leading-relaxed min-h-[44px]">
          {currentStep.content}
        </p>

        {/* Tooltip Navigation controls */}
        <div className="flex items-center justify-between pt-2">
          {/* Skip Button */}
          {currentStepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={onClose}
              className="font-sans text-xs font-semibold tracking-widest text-foreground/40 hover:text-urgent transition-colors animate-pulse"
            >
              SKIP
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {/* Previous Button */}
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="border border-panel-border bg-panel px-3 py-1.5 font-sans text-xs tracking-wider text-foreground/80 hover:border-cyan hover:text-cyan transition-colors"
              >
                PREVIOUS
              </button>
            )}

            {/* Next / Finish Button */}
            {currentStepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="border border-cyan bg-cyan/15 px-4 py-1.5 font-sans text-xs tracking-wider text-cyan hover:bg-cyan/35 transition-colors"
              >
                NEXT
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="border border-cyan bg-cyan/25 px-4 py-1.5 font-sans text-xs tracking-wider text-cyan hover:bg-cyan/45 transition-colors shadow-[0_0_12px_rgba(34, 229, 229, 0.7)]"
              >
                FINISH
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
