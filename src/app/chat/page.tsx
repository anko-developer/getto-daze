import { ChatWidget } from '@/components/ChatWidget'

export default function ChatPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <h1 className="text-2xl font-bold mb-4">입양 상담 챗봇</h1>
      <div className="flex-1 border border-border rounded-2xl overflow-hidden">
        <ChatWidget />
      </div>
    </div>
  )
}
