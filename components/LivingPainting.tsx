import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface LivingPaintingData {
  id: string;
  title: string;
  image: string;
  personality: string; // system prompt
  greeting: string;
  accentColor: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LivingPaintingProps {
  painting: LivingPaintingData;
  isOpen: boolean;
  onClose: () => void;
}

const LivingPainting: React.FC<LivingPaintingProps> = ({ painting, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [mounted, setMounted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: 'assistant', content: painting.greeting }]);
      setInput('');
      setIsStreaming(false);
      setTimeout(() => setMounted(true), 50);
    } else {
      setMounted(false);
    }
  }, [isOpen, painting.greeting]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          personality: painting.personality,
        }),
      });

      if (!res.ok) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: '...the painting stirs but cannot speak. Try again.' };
          return copy;
        });
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setIsStreaming(false); return; }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  copy[copy.length - 1] = { ...last, content: last.content + parsed.text };
                  return copy;
                });
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', content: '...the connection to this painting has been lost. Try again.' };
        return copy;
      });
    }
    setIsStreaming(false);
  }, [input, isStreaming, messages, painting.personality]);

  if (!isOpen) return null;

  const accent = painting.accentColor;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* CRT scan lines overlay */}
      <div className="pointer-events-none fixed inset-0 z-[401]" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        animation: 'scanlines 8s linear infinite',
      }} />

      {/* Sacred geometry background */}
      <div className="pointer-events-none fixed inset-0 z-[400] flex items-center justify-center opacity-[0.04]">
        <svg width="600" height="600" viewBox="0 0 600 600">
          <circle cx="300" cy="300" r="200" fill="none" stroke={accent} strokeWidth="0.5" />
          <circle cx="300" cy="300" r="150" fill="none" stroke={accent} strokeWidth="0.5" />
          <circle cx="300" cy="300" r="100" fill="none" stroke={accent} strokeWidth="0.5" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line key={deg} x1="300" y1="100" x2="300" y2="500"
              transform={`rotate(${deg} 300 300)`}
              stroke={accent} strokeWidth="0.3" />
          ))}
        </svg>
      </div>

      <div
        className={`relative z-[402] w-full max-w-5xl mx-4 h-[85vh] max-h-[700px] flex flex-col md:flex-row overflow-hidden transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          background: 'rgba(8,8,8,0.97)',
          border: `1px solid ${accent}33`,
          boxShadow: `0 0 80px ${accent}15, inset 0 0 60px rgba(0,0,0,0.5)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Painting Side */}
        <div className="relative w-full md:w-1/2 h-48 md:h-full overflow-hidden bg-black flex-shrink-0">
          <img
            src={painting.image}
            alt={painting.title}
            className="w-full h-full object-cover"
            style={{ animation: 'breathe 6s ease-in-out infinite' }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r md:bg-gradient-to-r from-transparent via-transparent to-[#080808]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent md:from-transparent" />

          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <p className="mono text-[9px] uppercase tracking-[0.4em] mb-1" style={{ color: `${accent}99` }}>
              ✦ Living Painting
            </p>
            <h2 className="serif text-xl md:text-2xl text-white/90 tracking-wide">
              {painting.title}
            </h2>
          </div>

          {/* CRT flicker on painting */}
          <div className="absolute inset-0 pointer-events-none" style={{
            animation: 'flicker 4s ease-in-out infinite',
            background: `linear-gradient(transparent 50%, rgba(0,0,0,0.05) 50%)`,
            backgroundSize: '100% 4px',
          }} />
        </div>

        {/* Chat Side */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-white/5 text-white/70 border border-white/10'
                      : ''
                  }`}
                  style={msg.role === 'assistant' ? {
                    color: accent,
                    textShadow: `0 0 20px ${accent}40`,
                    background: `${accent}08`,
                    border: `1px solid ${accent}20`,
                  } : undefined}
                >
                  {msg.content}
                  {/* Typing indicator */}
                  {msg.role === 'assistant' && i === messages.length - 1 && isStreaming && msg.content === '' && (
                    <span className="inline-flex gap-1 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent, animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent, animationDelay: '200ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent, animationDelay: '400ms' }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-4 md:p-6 pt-0">
            <div className="flex gap-2" style={{ borderTop: `1px solid ${accent}15` }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                placeholder="Speak to the painting..."
                disabled={isStreaming}
                className="flex-1 bg-transparent text-white/80 text-sm py-3 mt-3 px-2 outline-none placeholder:text-white/20 mono"
                style={{ caretColor: accent }}
              />
              <button
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                className="mt-3 mono text-[10px] uppercase tracking-widest px-4 py-2 transition-all duration-300 disabled:opacity-20"
                style={{
                  color: accent,
                  border: `1px solid ${accent}30`,
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors p-2"
        >
          [ X ]
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes flicker {
          0%, 95%, 100% { opacity: 1; }
          96% { opacity: 0.92; }
          97% { opacity: 1; }
          98% { opacity: 0.95; }
        }
      `}</style>
    </div>
  );
};

export default LivingPainting;
