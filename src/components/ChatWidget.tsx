'use client'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const transport = new DefaultChatTransport({ api: '/api/chat' })

export function ChatWidget() {
  const { messages, sendMessage, status, error } = useChat({ transport })
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-medium">입양 관련 궁금한 점을 물어보세요</p>
            <p className="text-sm mt-1">예: &quot;입양 절차가 어떻게 되나요?&quot;</p>
          </div>
        )}
        {messages.map((msg: UIMessage) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.parts
                .filter((p) => p.type === 'text')
                .map((p, i) => (p.type === 'text' ? <span key={i}>{p.text}</span> : null))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-2xl text-sm text-muted-foreground animate-pulse">
              답변 작성 중...
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-destructive text-sm">
            일시적 오류가 발생했어요. 다시 시도해주세요.
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="질문을 입력하세요"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={isLoading || !input}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
