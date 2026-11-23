'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import { lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from 'ai';
import { useEffect, useRef, useState } from 'react';
import {
  MealConfirmationCard,
  WorkoutConfirmationCard,
  type MealConfirmationData,
  type WorkoutConfirmationData,
} from '@/components/ConfirmationCards';
import { getDailySummary } from '@/app/actions/fitness';
import { logout } from '@/app/actions/auth';
import type { DailyStats } from '@/components/DailySummaryHeader';

type ChatTools = {
  confirm_meal_log: { input: MealConfirmationData; output: string };
  confirm_workout_log: { input: WorkoutConfirmationData; output: string };
};

type ChatMessage = UIMessage<unknown, never, ChatTools>;

const promptTopics = [
  { label: 'Train', prompt: 'Help me plan or log a workout.' },
  { label: 'Fuel', prompt: 'Help me log a meal and review my nutrition.' },
  { label: 'Protocols', prompt: 'Help me review my training and recovery routine.' },
  { label: 'Body', prompt: 'Summarize my recent workout progress.' },
  { label: 'Labs', prompt: 'What should I ask my clinician about my lab results?' },
];

const suggestions = [
  'I did ten pushups',
  'I had two eggs and toast',
  'Summarize my recent workouts',
];

export default function ChatApp({ userEmail }: { userEmail: string }) {
  const { messages, sendMessage, addToolOutput, status, error, regenerate, clearError } =
    useChat<ChatMessage>({
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    });
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationRef = useRef<HTMLElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const [stats, setStats] = useState<DailyStats>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    workoutsToday: 0,
  });

  const refreshStats = async () => {
    const latest = await getDailySummary();
    setStats(latest);
  };

  useEffect(() => {
    let active = true;

    getDailySummary()
      .then((latest) => {
        if (active) setStats(latest);
      })
      .catch((error: unknown) => {
        console.error('Failed to load daily summary:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (!conversation || !shouldAutoScrollRef.current) return;

    conversation.scrollTo({
      top: conversation.scrollHeight,
      behavior: status === 'streaming' ? 'auto' : 'smooth',
    });
  }, [error, messages, status]);

  const fillPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || status !== 'ready') return;
    shouldAutoScrollRef.current = true;
    sendMessage({ text: message });
    setInput('');
  };

  const glanceStats = [
    { label: 'Calories', value: stats.calories.toLocaleString(), detail: 'kcal logged today' },
    { label: 'Protein', value: `${stats.protein} g`, detail: 'logged today' },
    { label: 'Carbohydrates', value: `${stats.carbs} g`, detail: 'logged today' },
    { label: 'Fat', value: `${stats.fat} g`, detail: 'logged today' },
  ];

  return (
    <div className="valere-page">
      <header className="valere-nav">
        <Link className="valere-brand" href="/" aria-label="Valere home">
          <Image
            src="/brand/wordmark-integrated-on-light.svg"
            alt=""
            aria-hidden="true"
            width={112}
            height={22}
            className="valere-logo valere-logo-light"
          />
          <Image
            src="/brand/wordmark-integrated-on-dark.svg"
            alt=""
            aria-hidden="true"
            width={112}
            height={22}
            className="valere-logo valere-logo-dark"
          />
        </Link>

        <nav aria-label="Prompt topics">
          <ul className="valere-nav-links">
            {promptTopics.map((topic) => (
              <li key={topic.label}>
                <button
                  type="button"
                  className="valere-nav-button"
                  aria-label={`Write a prompt about ${topic.label.toLowerCase()}`}
                  onClick={() => fillPrompt(topic.prompt)}
                >
                  {topic.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="valere-nav-right">
          <div className="valere-avatar" title={userEmail} aria-label={`Signed in as ${userEmail}`}>
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <form action={logout}>
            <button type="submit" className="valere-nav-button">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main
        className={`valere-main ${messages.length > 0 ? 'valere-main-with-messages' : ''}`}
      >
        <h1 className="sr-only">Valere — AI fitness and nutrition coach</h1>

        <section className="valere-hero" aria-label="Ask Valere">
          {messages.length === 0 && (
            <Image
              src="/brand/wordmark-integrated-on-light.svg"
              alt=""
              aria-hidden="true"
              width={280}
              height={56}
              fetchPriority="high"
              className="valere-hero-logo valere-logo-light"
            />
          )}
          {messages.length === 0 && (
            <Image
              src="/brand/wordmark-integrated-on-dark.svg"
              alt=""
              aria-hidden="true"
              width={280}
              height={56}
              fetchPriority="high"
              className="valere-hero-logo valere-logo-dark"
            />
          )}

          <form className="valere-ask" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              id="chat-input"
              className="valere-ask-input"
              value={input}
              placeholder="Ask about your training, food, or recovery"
              aria-label="Ask Valere"
              autoComplete="off"
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'ready'}
            />
            <button
              className="valere-send"
              type="submit"
              aria-label="Send message"
              disabled={status !== 'ready' || !input.trim()}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            </button>
          </form>

          <div className="valere-chips" aria-label="Suggested prompts">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                className="valere-chip"
                type="button"
                disabled={status !== 'ready'}
                onClick={() => fillPrompt(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>

        {messages.length > 0 && (
          <section
            ref={conversationRef}
            className="valere-conversation"
            aria-label="Conversation"
            aria-live="polite"
            tabIndex={0}
            onScroll={() => {
              const conversation = conversationRef.current;
              if (!conversation) return;
              shouldAutoScrollRef.current =
                conversation.scrollHeight - conversation.scrollTop - conversation.clientHeight < 64;
            }}
          >
            {messages.map((message) => (
              <article
                key={message.id}
                className={`valere-message ${
                  message.role === 'user' ? 'valere-user-message' : 'valere-assistant-message'
                }`}
              >
                <div className="valere-message-role">
                  {message.role === 'user' ? 'You' : 'Valere'}
                </div>
                <div className="valere-message-content">
                  {message.parts.map((part, i) => {
                    if (part.type === 'text') {
                      return <span key={i}>{part.text}</span>;
                    }

                    if (part.type === 'tool-confirm_meal_log') {
                      if (!part.input || part.state === 'input-streaming') {
                        return (
                          <div key={part.toolCallId} className="valere-tool-loading">
                            Preparing meal confirmation...
                          </div>
                        );
                      }

                      return (
                        <MealConfirmationCard
                          key={part.toolCallId}
                          toolCallId={part.toolCallId}
                          initialData={part.input}
                          onComplete={async (id, output) => {
                            await refreshStats();
                            addToolOutput({ tool: 'confirm_meal_log', toolCallId: id, output });
                          }}
                        />
                      );
                    }

                    if (part.type === 'tool-confirm_workout_log') {
                      if (!part.input || part.state === 'input-streaming') {
                        return (
                          <div key={part.toolCallId} className="valere-tool-loading">
                            Preparing workout confirmation...
                          </div>
                        );
                      }

                      return (
                        <WorkoutConfirmationCard
                          key={part.toolCallId}
                          toolCallId={part.toolCallId}
                          initialData={part.input}
                          onComplete={async (id, output) => {
                            await refreshStats();
                            addToolOutput({ tool: 'confirm_workout_log', toolCallId: id, output });
                          }}
                        />
                      );
                    }

                    if (part.type.startsWith('tool-')) {
                      return (
                        <div key={i} className="valere-tool-loading">
                          Preparing {part.type.replace('tool-', '')}...
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </article>
            ))}
            {error && (
              <div className="valere-error" role="alert">
                <p>Valere couldn&apos;t respond. Please try again.</p>
                <div className="valere-error-actions">
                  <button
                    type="button"
                    onClick={() => {
                      shouldAutoScrollRef.current = true;
                      clearError();
                      regenerate();
                    }}
                  >
                    Retry
                  </button>
                  <button type="button" onClick={clearError}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="valere-glance" aria-label="Today at a glance">
          <div className="valere-glance-heading">
            <h2>Today at a glance</h2>
            <span>
              {stats.workoutsToday} {stats.workoutsToday === 1 ? 'workout' : 'workouts'} logged
            </span>
          </div>
          {glanceStats.map((stat) => (
            <article key={stat.label} className="valere-card">
              <div className="valere-card-label">{stat.label}</div>
              <div className="valere-card-value">{stat.value}</div>
              <div className="valere-card-meta">{stat.detail}</div>
            </article>
          ))}
        </section>
      </main>

      <footer className="valere-footer">
        <span>Valere</span>
        <span className="valere-footer-note">Fitness, nutrition, and recovery support</span>
      </footer>
    </div>
  );
}
