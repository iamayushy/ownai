import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { ChatCircleIcon, PlusIcon, RobotIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  onSessionSelect: (id: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat
}: ChatSidebarProps) {
  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 px-1 mb-6">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <RobotIcon size={18} weight="fill" className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">OwnAI</span>
        </div>
        <button
          onClick={onNewChat}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200",
            "bg-primary text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
          )}
        >
          <PlusIcon size={18} weight="bold" />
          New Chat
        </button>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {sessions.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-[11px] text-muted-foreground/40 italic">No history yet</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton
                      isActive={activeSessionId === session.id}
                      onClick={() => onSessionSelect(session.id)}
                      className={cn(
                        "h-10 gap-3 px-3 text-sm rounded-xl transition-all duration-200",
                        activeSessionId === session.id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <ChatCircleIcon
                        size={16}
                        weight={activeSessionId === session.id ? "fill" : "regular"}
                        className={cn(
                          "shrink-0",
                          activeSessionId === session.id ? "text-primary" : "text-muted-foreground/60"
                        )}
                      />
                      <span className="truncate flex-1">{session.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
