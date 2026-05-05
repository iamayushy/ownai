import * as React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ChatSidebar } from "./components/chat-sidebar"
import { ChatInterface } from "./components/chat-interface"
import { ContextPanel } from "./components/context-panel"
import { type ChatMessage, sendChatMessage } from "./lib/chat.service"
import { ListIcon, SlidersHorizontalIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const STORAGE_KEY = "ownai_sessions"

export default function App() {
  const [sessions, setSessions] = React.useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })
  const [activeSessionId, setActiveSessionId] = React.useState<string | undefined>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed[0]?.id
    }
    return undefined
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [userId] = React.useState(() => crypto.randomUUID())
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [contextOpen, setContextOpen] = React.useState(false)

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  // Close sidebar on mobile when a session is selected
  const handleSessionSelect = (id: string) => {
    setActiveSessionId(id)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const activeSession = sessions.find(s => s.id === activeSessionId)

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Conversation",
      messages: [],
      updatedAt: Date.now(),
    }
    setSessions([newSession, ...sessions])
    setActiveSessionId(newSession.id)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const handleSendMessage = async (content: string) => {
    let currentSessionId = activeSessionId

    if (!currentSessionId) {
      const newId = crypto.randomUUID()
      const newSession: ChatSession = {
        id: newId,
        title: content.slice(0, 42) + (content.length > 42 ? "…" : ""),
        messages: [{ role: 'user' as const, content, timestamp: Date.now() }],
        updatedAt: Date.now(),
      }
      setSessions([newSession, ...sessions])
      setActiveSessionId(newId)
      currentSessionId = newId
    } else {
      setSessions(prev =>
        prev
          .map(s => {
            if (s.id !== currentSessionId) return s
            const isFirst = s.messages.length === 0
            return {
              ...s,
              title: isFirst
                ? content.slice(0, 42) + (content.length > 42 ? "…" : "")
                : s.title,
              messages: [...s.messages, { role: 'user' as const, content, timestamp: Date.now() }],
              updatedAt: Date.now(),
            }
          })
          .sort((a, b) => b.updatedAt - a.updatedAt)
      )
    }

    await callApi(content, currentSessionId)
  }

  const callApi = async (message: string, sessionId: string) => {
    setIsLoading(true)
    try {
      const response = await sendChatMessage(message, userId)
      const content =
        typeof response.chat.message === 'string'
          ? response.chat.message
          : (response.chat.message as any).content ?? JSON.stringify(response.chat.message)

      setSessions(prev =>
        prev
          .map(s => {
            if (s.id !== sessionId) return s
            return {
              ...s,
              messages: [
                ...s.messages,
                { role: 'assistant' as const, content, timestamp: Date.now() },
              ],
              updatedAt: Date.now(),
            }
          })
          .sort((a, b) => b.updatedAt - a.updatedAt)
      )
    } catch (err) {
      console.error("Failed to fetch AI response:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const hasMessages = (activeSession?.messages?.length ?? 0) > 0

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">

        {/* ── Mobile backdrop ─────────────────────────────── */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden animate-in fade-in duration-200"
          />
        )}

        {/* ── Sidebar ──────────────────────────────────────
            Desktop : width-based show/hide (shifts layout)
            Mobile  : fixed overlay, translate-based show/hide */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out shrink-0",
            // Mobile: fixed overlay
            "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-[256px]",
            sidebarOpen
              ? "max-md:translate-x-0 max-md:shadow-xl md:w-[256px]"
              : "max-md:-translate-x-full md:w-0"
          )}
        >
          <ChatSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
          />
        </div>

        {/* ── Main panel ───────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Header */}
          <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-all"
              title="Toggle sidebar"
            >
              <ListIcon size={16} />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-[13px] font-medium text-foreground/60 truncate">
                {activeSession?.title ?? "New Conversation"}
              </h1>
            </div>

            {hasMessages && (
              <button
                onClick={() => setContextOpen(v => !v)}
                className={cn(
                  "h-7 w-7 rounded-md flex items-center justify-center transition-all",
                  contextOpen
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                )}
                title="Toggle context panel"
              >
                <SlidersHorizontalIcon size={15} />
              </button>
            )}
          </header>

          {/* Chat + context panel */}
          <div className="flex flex-1 min-h-0">
            <main className="flex-1 min-w-0 overflow-hidden relative">
              <ChatInterface
                messages={activeSession?.messages ?? []}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
              />
            </main>
            <ContextPanel
              isOpen={contextOpen && hasMessages}
              onClose={() => setContextOpen(false)}
              messages={activeSession?.messages ?? []}
              onAction={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
