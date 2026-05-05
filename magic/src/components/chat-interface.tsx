import * as React from "react"
import {
  PaperPlaneRightIcon,
  CaretDownIcon,
  PaperclipIcon,
  BugIcon,
  ArrowsLeftRightIcon,
  EnvelopeSimpleIcon,
  BookOpenIcon,
  CodeIcon,
  LightbulbIcon,
  SparkleIcon,
} from "@phosphor-icons/react"
import { type ChatMessage as ChatMessageType } from "@/lib/chat.service"
import { ChatMessage } from "./chat-message"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  { Icon: BugIcon,             title: "Debug code",       description: "Find and fix errors in your code" },
  { Icon: ArrowsLeftRightIcon, title: "Compare tools",    description: "Evaluate frameworks or approaches" },
  { Icon: EnvelopeSimpleIcon,  title: "Write email",      description: "Draft professional communications" },
  { Icon: BookOpenIcon,        title: "Explain concept",  description: "Break down complex topics clearly" },
  { Icon: CodeIcon,            title: "Refactor code",    description: "Improve code quality and structure" },
  { Icon: LightbulbIcon,       title: "Brainstorm ideas", description: "Generate creative solutions" },
]

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
}

export function ChatInterface({ messages, isLoading, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = React.useState("")
  const [showScrollButton, setShowScrollButton] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (override?: string) => {
    const text = override ?? input
    if (!text.trim() || isLoading) return
    onSendMessage(text)
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "inherit"
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const scrollToBottom = React.useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [])

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  React.useEffect(() => { scrollToBottom() }, [messages, isLoading, scrollToBottom])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 120)
  }

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      {/* Message list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-[720px] px-4 md:px-6 py-10">
          {messages.length === 0 ? (
            <EmptyState onSuggest={handleSubmit} />
          ) : (
            <div className="space-y-8 pb-44">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
        </div>
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-36 right-6 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border text-muted-foreground shadow-card hover:text-foreground hover:scale-105 active:scale-95 transition-all"
        >
          <CaretDownIcon size={15} weight="bold" />
        </button>
      )}

      {/* ── Floating input ── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ paddingBottom: "max(1px, env(safe-area-inset-bottom))" }}
      >
        <div className="bg-linear-to-t from-background via-background/95 to-transparent pt-12 px-4 md:px-6 pointer-events-auto">
          <div className="mx-auto  w-full max-w-[720px]">
            <div className={cn(
              "flex flex-col rounded-2xl bg-card border border-border shadow-float transition-all duration-200",
              "focus-within:border-primary/35 focus-within:shadow-[0_0_0_3px_oklch(0.55_0.22_271/0.08),0_4px_20px_oklch(0_0_0/0.06)]"
            )}>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything…"
                disabled={isLoading}
                className={cn(
                  "w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[14px] text-foreground outline-none",
                  "placeholder:text-muted-foreground/40 min-h-[52px] max-h-[200px] leading-relaxed"
                )}
              />
              <div className="flex items-center gap-2 px-3 pb-3">
                <button
                  type="button"
                  className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-surface-1 transition-all"
                  title="Attach file"
                >
                  <PaperclipIcon size={15} />
                </button>
                <span className="text-[11px] text-muted-foreground/35 select-none hidden sm:block">
                  <kbd className="font-mono not-italic">/</kbd> for actions · <kbd className="font-mono not-italic">Shift+Enter</kbd> for new line
                </span>
                <div className="flex-1" />
                <button
                  onClick={() => handleSubmit()}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                    input.trim() && !isLoading
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95"
                      : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                  )}
                >
                  <PaperPlaneRightIcon size={15} weight="bold" />
                </button>
              </div>
            </div>
            <p className="mt-2 py-4 text-center text-[10px] text-muted-foreground/35">
              OwnAI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onSuggest }: { onSuggest: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center pb-44 pt-8 relative">
      {/* Ambient glow */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none glow-orb"
        aria-hidden
      />

      {/* Heading */}
      <div className="relative z-10 text-center mb-10">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-5 shadow-sm">
          <SparkleIcon size={20} weight="fill" className="text-primary" />
        </div>
        <h2 className="text-[26px] font-bold tracking-tight text-foreground mb-2.5">
          What can I help you with?
        </h2>
        <p className="text-[14px] text-muted-foreground max-w-xs leading-relaxed">
          Ask a question, explore an idea, or pick a suggestion below.
        </p>
      </div>

      {/* Suggestion cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-[580px]">
        {SUGGESTIONS.map(({ Icon, title, description }) => (
          <button
            key={title}
            onClick={() => onSuggest(title)}
            className={cn(
              "group flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-card",
              "hover:border-primary/25 hover:shadow-md hover:bg-accent/30",
              "transition-all duration-200 active:scale-[0.98]"
            )}
          >
            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center mt-0.5 group-hover:bg-primary/14 transition-colors">
              <Icon size={16} weight="duotone" className="text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground mb-0.5">{title}</p>
              <p className="text-[12px] text-muted-foreground leading-snug">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-5 rounded-md bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
          <SparkleIcon size={10} weight="fill" className="text-primary" />
        </div>
        <span className="text-[11px] font-semibold tracking-widest text-muted-foreground/50 uppercase select-none">
          OwnAI
        </span>
      </div>
      <div className="pl-7 flex gap-1.5 py-1.5">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/40" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/40" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/40" />
      </div>
    </div>
  )
}
