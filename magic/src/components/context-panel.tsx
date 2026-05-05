import * as React from 'react'
import {
  XIcon,
  SparkleIcon,
  ArrowsClockwiseIcon,
  PencilSimpleIcon,
  ArrowRightIcon,
  ListBulletsIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { type ChatMessage } from "@/lib/chat.service"

interface ContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onAction: (prompt: string) => void;
}

const ACTIONS = [
  {
    Icon: ListBulletsIcon,
    label: "Summarize",
    prompt: "Please summarize our conversation so far in a few concise bullet points.",
  },
  {
    Icon: ArrowRightIcon,
    label: "Expand",
    prompt: "Please expand on your last response with more detail and examples.",
  },
  {
    Icon: PencilSimpleIcon,
    label: "Refine",
    prompt: "Please refine your last response to be more concise and clear.",
  },
  {
    Icon: ArrowsClockwiseIcon,
    label: "Rephrase",
    prompt: "Please rephrase your last response in a different way.",
  },
]

export function ContextPanel({ isOpen, onClose, messages, onAction }: ContextPanelProps) {
  const lastAssistantMsg = React.useMemo(
    () => [...messages].reverse().find(m => m.role === 'assistant'),
    [messages]
  )
  const msgCount = messages.length
  const userCount = messages.filter(m => m.role === 'user').length

  if (!isOpen) return null

  return (
    <div className="h-full w-[268px] shrink-0 border-l border-border bg-sidebar flex flex-col animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <SparkleIcon size={13} weight="fill" className="text-primary/70" />
          <span className="text-[12px] font-semibold text-foreground/70">Context</span>
        </div>
        <button
          onClick={onClose}
          className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-surface-2 transition-all"
        >
          <XIcon size={13} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Session stats */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-2.5">
            Session
          </p>
          <div className="grid grid-cols-2 gap-2">
            <StatCard value={msgCount} label="messages" />
            <StatCard value={userCount} label="from you" />
          </div>
        </div>

        {/* Actions */}
        {messages.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-2.5">
              Actions
            </p>
            <div className="space-y-0.5">
              {ACTIONS.map(({ Icon, label, prompt }) => (
                <button
                  key={label}
                  onClick={() => onAction(prompt)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left group",
                    "text-[12px] text-muted-foreground hover:text-foreground hover:bg-surface-1 transition-all"
                  )}
                >
                  <Icon
                    size={13}
                    className="shrink-0 text-primary/50 group-hover:text-primary transition-colors"
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Last response preview */}
        {lastAssistantMsg && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-2.5">
              Last response
            </p>
            <div className="rounded-lg bg-surface-1 border border-stroke-1 px-3 py-3">
              <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-5">
                {lastAssistantMsg.content.slice(0, 240)}
                {lastAssistantMsg.content.length > 240 ? '…' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-surface-1 border border-stroke-1 px-3 py-2.5">
      <p className="text-[20px] font-bold text-foreground leading-none mb-1">{value}</p>
      <p className="text-[10px] text-muted-foreground/60">{label}</p>
    </div>
  )
}
