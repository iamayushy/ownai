import * as React from "react"
import { Button } from "@/components/ui/button"
import { PaperPlaneRight, RobotIcon, CaretDown } from "@phosphor-icons/react"
import { type ChatMessage as ChatMessageType } from "@/lib/chat.service"
import { ChatMessage } from "./chat-message"
import { cn } from "@/lib/utils"

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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    onSendMessage(input)
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const scrollToBottom = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [])

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [input])

  // Scroll to bottom on new messages or loading state change
  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Monitor scroll position to show/hide scroll button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollButton(!isAtBottom)
  }

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth no-scrollbar"
      >
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border bg-secondary/50 shadow-sm backdrop-blur-sm">
                <RobotIcon size={32} weight="duotone" className="text-primary" />
              </div>
              <h2 className="mb-3 text-2xl font-bold tracking-tight">
                Welcome to OwnAI
              </h2>
              <p className="max-w-xs text-sm text-muted-foreground/80 leading-relaxed">
                Start a new conversation or ask me anything technical. I'm here to help you build amazing things.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-24">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-secondary/50">
                    <RobotIcon size={18} weight="fill" className="text-primary" />
                  </div>
                  <div className="flex gap-1.5 rounded-2xl bg-muted/50 px-4 py-3 shadow-sm border border-border/50">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/40" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/40" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/40" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-32 right-8 z-20 flex h-10 w-10 items-center justify-center rounded-full border bg-background/80 text-foreground shadow-xl backdrop-blur-md transition-all hover:bg-background hover:scale-110 active:scale-95"
        >
          <CaretDown size={20} weight="bold" />
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pb-6 pt-12 px-4 pointer-events-none">
        <div className="mx-auto max-w-3xl pointer-events-auto">
          <div className="relative flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-xl transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message OwnAI..."
              className={cn(
                "w-full resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60",
                "min-h-[44px] max-h-[200px]"
              )}
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className={cn(
                "h-9 w-9 shrink-0 rounded-xl transition-all duration-200",
                input.trim() ? "bg-primary scale-100 opacity-100" : "bg-muted scale-95 opacity-50"
              )}
            >
              <PaperPlaneRight size={18} weight="bold" />
            </Button>
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground/40">
            OwnAI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  )
}
