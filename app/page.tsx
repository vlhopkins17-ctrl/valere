'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col w-full max-w-xl py-12 mx-auto stretch px-4">
      <h1 className="text-2xl font-bold mb-6">Valere — AI Fitness & Nutrition Coach</h1>

      <div className="space-y-4 mb-24">
        {messages.map((m) => (
          <div key={m.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-1">
              {m.role === 'user' ? 'You' : 'Muse'}
            </div>
            <div className="whitespace-pre-wrap text-sm">
              {m.parts.map((part, i) => {
                if (part.type === 'text') {
                  return <span key={i}>{part.text}</span>;
                }
                if (part.type.startsWith('tool-')) {
                  return (
                    <div
                      key={i}
                      className="my-2 p-2 text-xs font-mono bg-gray-100 dark:bg-gray-900 rounded text-blue-600 dark:text-blue-400"
                    >
                      ⚙ Calling tool: {part.type.replace('tool-', '')}...
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex gap-2"
      >
        <input
          className="flex-1 p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-sm"
          value={input}
          placeholder="Tell Muse something to remember (e.g. 'I prefer meetings after 1 PM')..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={status !== 'ready'}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
