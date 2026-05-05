import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn, decodeHtml } from "@/lib/utils"
import {
  SparkleIcon,
  CopyIcon,
  CheckIcon,
  ArrowCounterClockwiseIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react"

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  onRetry?: () => void;
  onEdit?: () => void;
}

export function ChatMessage({ role, content, onRetry, onEdit }: ChatMessageProps) {
  const isUser = role === 'user'
  const decodedContent = React.useMemo(() => decodeHtml(content), [content])
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isUser) {
    return (
      <div className="flex justify-end group/msg animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[72%] lg:max-w-[65%]">
          <div className="rounded-2xl rounded-br-md bg-surface-3 border border-stroke-1 px-4 py-3 text-[15px] leading-relaxed text-foreground/90 wrap-break-word">
            {content}
          </div>
          <div className="mt-1.5 flex justify-end gap-0.5 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150">
            <ActionButton onClick={handleCopy} label={copied ? "Copied" : "Copy"}>
              {copied
                ? <CheckIcon size={11} weight="bold" className="text-green-500" />
                : <CopyIcon size={11} />}
            </ActionButton>
            {onEdit && (
              <ActionButton onClick={onEdit} label="Edit">
                <PencilSimpleIcon size={11} />
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group/msg animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* AI label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-5 rounded-md bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
          <SparkleIcon size={10} weight="fill" className="text-primary" />
        </div>
        <span className="text-[11px] font-semibold tracking-widest text-muted-foreground/60 uppercase select-none">
          OwnAI
        </span>
      </div>

      <div className="pl-7">
        <div className={cn(
          "prose dark:prose-invert max-w-none wrap-break-word text-[15px]",
          /* paragraph & spacing */
          "prose-p:leading-[1.78] prose-p:my-3 prose-p:text-[15px] prose-p:text-foreground/80",
          /* headings */
          "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:mt-7 prose-headings:mb-2",
          /* lists */
          "prose-ul:my-3 prose-ol:my-3 prose-li:my-1.5 prose-li:text-[15px] prose-li:text-foreground/80",
          /* code blocks – handled by CodeBlock component */
          "prose-pre:p-0 prose-pre:bg-transparent prose-pre:my-4 prose-pre:rounded-none prose-pre:border-none",
          /* inline code */
          "prose-code:font-mono prose-code:text-[0.855em] prose-code:bg-muted prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
          /* misc */
          "prose-strong:text-foreground prose-strong:font-semibold",
          "prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:bg-muted/50 prose-blockquote:py-0.5",
          "prose-hr:border-border",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-table:text-[13px] prose-th:text-foreground/70 prose-td:text-foreground/80",
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
                    className="rounded px-1.5 py-0.5 bg-muted text-primary font-mono text-[0.85em]"
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

        {/* Hover actions */}
        <div className="mt-3 flex items-center gap-0.5 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150">
          <ActionButton onClick={handleCopy} label={copied ? "Copied" : "Copy"}>
            {copied
              ? <CheckIcon size={11} weight="bold" className="text-green-500" />
              : <CopyIcon size={11} />}
          </ActionButton>
          {onRetry && (
            <ActionButton onClick={onRetry} label="Retry">
              <ArrowCounterClockwiseIcon size={11} />
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-all"
    >
      {children}
      <span>{label}</span>
    </button>
  )
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    /* Always dark — code blocks are intentionally dark in all themes */
    <div className="my-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-md not-prose">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <span className="text-[10px] font-mono text-zinc-500 font-semibold uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon size={11} weight="bold" className="text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <CopyIcon size={11} weight="bold" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Scrollable code area with max height */}
      <div className="overflow-x-auto overflow-y-auto max-h-[440px]">
        <SyntaxHighlighter
          language={language || 'javascript'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.825rem',
            lineHeight: '1.65',
            backgroundColor: 'transparent',
            minWidth: 'max-content',
          }}
          codeTagProps={{
            style: { fontFamily: '"JetBrains Mono Variable", monospace' },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
