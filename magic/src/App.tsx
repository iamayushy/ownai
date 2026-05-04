import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ChatSidebar } from "./components/chat-sidebar"
import { ChatInterface } from "./components/chat-interface"
import { type ChatMessage, sendChatMessage } from "./lib/chat.service"

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const STORAGE_KEY = "ownai_sessions";

export default function App() {
  const [sessions, setSessions] = React.useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  })
  const [activeSessionId, setActiveSessionId] = React.useState<string | undefined>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed[0]?.id;
    }
    return undefined;
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [userId] = React.useState(() => crypto.randomUUID())

  // Persist sessions to localStorage
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId)

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Conversation",
      messages: [],
      updatedAt: Date.now()
    }
    setSessions([newSession, ...sessions])
    setActiveSessionId(newSession.id)
  }

  const handleSendMessage = async (content: string) => {
    let currentSessionId = activeSessionId;
    
    if (!currentSessionId) {
      const newId = crypto.randomUUID()
      const newSession: ChatSession = {
        id: newId,
        title: content.slice(0, 40) + (content.length > 40 ? "..." : ""),
        messages: [{ role: 'user' as const, content, timestamp: Date.now() }],
        updatedAt: Date.now()
      }
      setSessions([newSession, ...sessions])
      setActiveSessionId(newId)
      currentSessionId = newId;
    } else {
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          const isFirstMessage = s.messages.length === 0;
          return {
            ...s,
            title: isFirstMessage ? (content.slice(0, 40) + (content.length > 40 ? "..." : "")) : s.title,
            messages: [...s.messages, { role: 'user' as const, content, timestamp: Date.now() }],
            updatedAt: Date.now()
          }
        }
        return s
      }).sort((a, b) => b.updatedAt - a.updatedAt));
    }

    await callApi(content, currentSessionId)
  }

  const callApi = async (message: string, sessionId: string) => {
    setIsLoading(true)
    try {
      const response = await sendChatMessage(message, userId)
      
      const content = typeof response.chat.message === 'string' 
        ? response.chat.message 
        : (response.chat.message as any).content || JSON.stringify(response.chat.message);

      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: [
              ...s.messages, 
              { 
                role: 'assistant' as const, 
                content: content, 
                timestamp: Date.now() 
              }
            ],
            updatedAt: Date.now()
          }
        }
        return s
      }).sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (error) {
      console.error("Failed to fetch AI response:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
          <ChatSidebar 
            sessions={sessions} 
            activeSessionId={activeSessionId}
            onSessionSelect={setActiveSessionId}
            onNewChat={handleNewChat}
          />
          <SidebarInset className="flex flex-col min-w-0 bg-background">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/50 px-4 backdrop-blur-md">
              <SidebarTrigger className="h-8 w-8" />
              <div className="flex flex-1 items-center gap-2 px-2">
                <h1 className="text-sm font-semibold truncate">
                  {activeSession?.title || "New Conversation"}
                </h1>
              </div>
            </header>
            <main className="flex-1 overflow-hidden relative">
              <ChatInterface 
                messages={activeSession?.messages || []} 
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
              />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
