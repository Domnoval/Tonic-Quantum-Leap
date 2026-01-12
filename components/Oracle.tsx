import React, { useState } from 'react';
import { getOracleResponse } from '../services/geminiService';
import { ThemeColor } from '../types';

const Oracle: React.FC<{ cartCount: number, themeColor: ThemeColor }> = ({ cartCount, themeColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const res = await getOracleResponse(query, `User navigator is tracking ${cartCount} density packets.`);
    setResponse(res);
    setLoading(false);
    setQuery('');
  };

  return (
    <div className="fixed bottom-12 right-12 z-[300] pointer-events-auto">
      {isOpen ? (
        <div
          role="dialog"
          aria-label="AI Oracle chat"
          className="bg-[#111] border border-white/10 p-6 w-[90vw] md:w-[450px] flex flex-col gap-6 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500"
        >
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
               <div className={`w-2 h-2 bg-${themeColor}-400 rounded-full animate-pulse`} aria-hidden="true" />
               <span className="mono text-[10px] uppercase tracking-[0.4em] text-white/60">Mainframe_Comm_Link</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className={`mono text-[10px] opacity-40 hover:opacity-100 text-${themeColor}-400`}
            >
              [ x ]
            </button>
          </div>

          <div className="min-h-[100px] max-h-[300px] overflow-y-auto pr-4" aria-live="polite" aria-atomic="true">
            {loading ? (
              <div className={`mono text-[10px] uppercase tracking-widest text-${themeColor}-400/50 animate-pulse`} role="status">Decrypting transmission...</div>
            ) : response ? (
              <div className={`mono text-[11px] leading-relaxed text-white/80 border-l border-${themeColor}-400/30 pl-4 py-2`}>
                <span className={`text-${themeColor}-400 mb-2 block font-bold`}>ARCHITECT {'>'} {'>'} </span>
                {response}
              </div>
            ) : (
              <div className="mono text-[10px] uppercase tracking-widest text-white/20 italic">Awaiting inquiry...</div>
            )}
          </div>

          <form onSubmit={handleInquiry} className="flex flex-col gap-4">
            <label htmlFor="oracle-query" className="sr-only">Enter your question</label>
            <input
              id="oracle-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="INPUT_QUERY_HERE..."
              aria-label="Enter your question for the Oracle"
              className={`bg-black/40 border border-white/10 p-4 mono text-[11px] outline-none focus:border-${themeColor}-400/50 transition-colors text-white placeholder:text-white/10`}
            />
            <button
              type="submit"
              disabled={loading}
              aria-label="Send message"
              className={`w-full py-4 bg-${themeColor}-400 text-black mono text-[10px] font-bold uppercase tracking-[0.6em] hover:bg-white transition-all disabled:opacity-20`}
            >
              Transmit
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Oracle chat"
          className="group relative flex flex-col items-center gap-4"
        >
          <div className="mono text-[9px] uppercase tracking-[0.4em] opacity-0 group-hover:opacity-40 transition-opacity" aria-hidden="true">Comm_Link</div>
          <div className={`w-14 h-14 bg-[#111] border border-white/10 flex items-center justify-center hover:border-${themeColor}-400 transition-all shadow-xl`}>
             <div className={`w-2 h-2 bg-${themeColor}-400 group-hover:scale-150 transition-transform`} aria-hidden="true" />
          </div>
        </button>
      )}
    </div>
  );
};

export default Oracle;