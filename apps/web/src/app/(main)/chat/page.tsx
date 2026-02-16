'use client';

import { Card, EmptyState } from '@/components/ui';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Chat</h1>
        <p className="text-white/50 text-sm mt-1">Real-time messaging</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card hover={false} className="p-3">
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <MessageSquare className="w-4 h-4 text-white/30" />
            <span className="text-xs text-white/30 uppercase tracking-wider font-medium">Channels</span>
          </div>
          {['General', 'Tournaments', 'LFG', 'Support'].map((ch) => (
            <button key={ch} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all text-left">
              <span className="text-white/20">#</span>{ch.toLowerCase()}
            </button>
          ))}
        </Card>
        <Card hover={false} className="min-h-[60vh] flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon="💬" title="Chat Coming Soon" description="Real-time messaging with WebSocket in a future update" />
          </div>
          <div className="border-t border-border pt-4 mt-auto flex gap-2">
            <input type="text" placeholder="Type a message..." disabled className="flex-1 bg-bg border border-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none opacity-50 cursor-not-allowed" />
            <button disabled className="bg-accent/50 text-white px-5 py-2.5 rounded-md text-sm font-medium opacity-50 cursor-not-allowed">Send</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
