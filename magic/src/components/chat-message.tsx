import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn, decodeHtml } from "@/lib/utils"
import { RobotIcon, Copy, Check } from "@phosphor-icons/react"

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';
  const decodedContent = React.useMemo(() => decodeHtml(content), [content]);

  return (
    <div className={cn(
      "flex w-full group animate-in fade-in slide-in-from-bottom-2 duration-300",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[85%] gap-3 md:max-w-[80%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {!isUser && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-secondary/50 mt-1 shadow-sm transition-transform group-hover:scale-105">
            <RobotIcon size={18} weight="fill" className="text-primary" />
          </div>
        )}
        <div className={cn(
          "rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 border",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-sm border-primary/20" 
            : "bg-card/50 border-border/50 text-foreground rounded-tl-sm backdrop-blur-sm"
        )}>
          <div className={cn(
            "prose prose-sm dark:prose-invert max-w-none break-words",
            "prose-p:leading-relaxed prose-p:my-0",
            "prose-pre:p-0 prose-pre:bg-transparent prose-pre:my-3",
            "prose-headings:font-bold prose-headings:tracking-tight",
            "prose-li:my-1",
            "prose-code:font-mono prose-code:text-[0.9em]",
            isUser ? "prose-p:text-primary-foreground" : "prose-p:text-foreground/90"
          )}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : ''
                  const codeString = String(children).replace(/\n$/, '')
                  
                  return !inline ? (
                    <CodeBlock language={language} code={codeString} />
                  ) : (
                    <code
                      className={cn(
                        "rounded-md px-1.5 py-0.5 font-mono text-[0.85em] font-medium",
                        isUser ? "bg-white/20 text-white" : "bg-muted text-foreground"
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                }
              }}
            >
              {decodedContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

function CodeBlock({ language, code }: { language: string, code: string }) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border/40 bg-zinc-950 shadow-xl group/code">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-white/5">
        <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">{language || 'code'}</span>
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} weight="bold" className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} weight="bold" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'javascript'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.85rem',
          lineHeight: '1.6',
          backgroundColor: 'transparent',
        }}
        codeTagProps={{
          style: {
            fontFamily: '"JetBrains Mono Variable", monospace',
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
