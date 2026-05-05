import * as React from 'react'
import { MagnifyingGlassIcon, PlusIcon, ChatCircleIcon, SparkleIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  onSessionSelect: (id: string) => void;
  onNewChat: () => void;
}

function groupSessions(sessions: ChatSession[]) {
  const now = Date.now()
  const DAY = 86_400_000
  return {
    today: sessions.filter(s => now - s.updatedAt < DAY),
    yesterday: sessions.filter(s => now - s.updatedAt >= DAY && now - s.updatedAt < 2 * DAY),
    older: sessions.filter(s => now - s.updatedAt >= 2 * DAY),
  }
}

function SessionItem({
  session,
  isActive,
  onClick,
}: {
  session: ChatSession
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left transition-all duration-150",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-surface-1"
      )}
    >
      <ChatCircleIcon
        size={14}
        weight={isActive ? "fill" : "regular"}
        className={cn(
          "shrink-0 mt-px transition-colors",
          isActive ? "text-primary" : "text-muted-foreground/50"
        )}
      />
      <span className="truncate flex-1 leading-snug">{session.title}</span>
    </button>
  )
}

function SessionGroup({
  label,
  sessions,
  activeSessionId,
  onSessionSelect,
}: {
  label: string
  sessions: ChatSession[]
  activeSessionId?: string
  onSessionSelect: (id: string) => void
}) {
  if (sessions.length === 0) return null

  return (
    <div className="mb-5">
      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/40 select-none">
        {label}
      </p>
      <div className="space-y-px">
        {sessions.map(s => (
          <SessionItem
            key={s.id}
            session={s}
            isActive={activeSessionId === s.id}
            onClick={() => onSessionSelect(s.id)}
          />
        ))}
      </div>
    </div>
  )
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
}: ChatSidebarProps) {
  const [search, setSearch] = React.useState("")

  const filtered = React.useMemo(
    () => sessions.filter(s => s.title.toLowerCase().includes(search.toLowerCase())),
    [sessions, search]
  )

  const groups = React.useMemo(() => groupSessions(filtered), [filtered])
  const hasAny = sessions.length > 0
  const hasResults = filtered.length > 0

  return (
    <div className="flex h-full w-[256px] shrink-0 flex-col bg-sidebar border-r border-border">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-7 w-7 rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
            <SparkleIcon size={14} weight="fill" className="text-primary" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-foreground">OwnAI</span>
        </div>

        <button
          onClick={onNewChat}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold shadow-sm hover:bg-primary/90 transition-all duration-150 active:scale-[0.98]"
        >
          <PlusIcon size={15} weight="bold" />
          New chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 h-8 rounded-lg bg-surface-1 border border-stroke-1 px-3 focus-within:border-primary/30 transition-colors">
          <MagnifyingGlassIcon size={13} className="text-muted-foreground/50 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground/40 outline-none"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3 mb-3 h-px bg-border" />

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {!hasAny ? (
          <div className="px-3 py-10 text-center">
            <p className="text-[12px] text-muted-foreground/50">No conversations yet</p>
            <p className="text-[11px] text-muted-foreground/30 mt-1">Start a new chat above</p>
          </div>
        ) : !hasResults ? (
          <div className="px-3 py-6 text-center">
            <p className="text-[12px] text-muted-foreground/50">No results for &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          <>
            <SessionGroup label="Today" sessions={groups.today} activeSessionId={activeSessionId} onSessionSelect={onSessionSelect} />
            <SessionGroup label="Yesterday" sessions={groups.yesterday} activeSessionId={activeSessionId} onSessionSelect={onSessionSelect} />
            <SessionGroup label="Older" sessions={groups.older} activeSessionId={activeSessionId} onSessionSelect={onSessionSelect} />
          </>
        )}
      </div>
    </div>
  )
}
