import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, signIn, user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('sending');
    setErrorMessage('');

    const { error } = await signIn(email);

    if (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to send magic link');
    } else {
      setStatus('sent');
    }
  };

  const handleClose = () => {
    setShowAuthModal(false);
    setEmail('');
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md border border-white/20 bg-black p-6 md:p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="serif text-2xl text-white italic">
              {user ? 'Signal Connected' : 'Connect Signal'}
            </h2>
            <p
              className="mono text-[9px] uppercase tracking-widest mt-1"
              style={{ color: 'rgba(var(--theme-rgb), 1)' }}
            >
              {user ? 'Identity Verified' : 'Authentication Portal'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            [ Close ]
          </button>
        </div>

        {user ? (
          // Logged in state
          <div className="space-y-4">
            <div className="border border-white/10 p-4 bg-white/5">
              <span className="mono text-[9px] uppercase tracking-widest text-white/40 block mb-1">
                Connected As
              </span>
              <span className="mono text-sm text-white">{user.email}</span>
            </div>

            <button
              onClick={logout}
              className="w-full py-3 border border-white/20 mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:border-white/40 transition-all"
            >
              Disconnect Signal
            </button>
          </div>
        ) : status === 'sent' ? (
          // Magic link sent
          <div className="text-center py-8">
            <div
              className="w-16 h-16 mx-auto mb-4 border rounded-full flex items-center justify-center animate-pulse"
              style={{ borderColor: 'rgba(var(--theme-rgb), 0.5)' }}
            >
              <span className="text-2xl">✉</span>
            </div>
            <h3 className="serif text-xl text-white italic mb-2">Check Your Inbox</h3>
            <p className="mono text-[10px] text-white/50 uppercase tracking-wider">
              Magic link transmitted to {email}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-6 mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              [ Send Again ]
            </button>
          </div>
        ) : (
          // Login form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mono text-[9px] uppercase tracking-widest text-white/40 block mb-2">
                Transmission Frequency (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@signal.com"
                className="w-full bg-black border border-white/20 p-3 mono text-sm text-white focus:border-white/40 focus:outline-none"
                disabled={status === 'sending'}
                autoFocus
              />
            </div>

            {errorMessage && (
              <div className="p-3 border border-red-500/30 bg-red-500/10">
                <span className="mono text-[10px] uppercase tracking-wider text-red-400">
                  {errorMessage}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending' || !email.trim()}
              className="w-full py-4 mono text-[11px] uppercase tracking-widest transition-all disabled:opacity-30"
              style={{
                backgroundColor: 'rgba(var(--theme-rgb), 0.1)',
                border: '1px solid rgba(var(--theme-rgb), 0.5)',
                color: 'rgba(var(--theme-rgb), 1)',
              }}
            >
              {status === 'sending' ? (
                <span className="animate-pulse">Transmitting...</span>
              ) : (
                'Send Magic Link'
              )}
            </button>

            <p className="mono text-[8px] text-white/30 text-center uppercase tracking-wider">
              No password required. We'll send you a secure link.
            </p>
          </form>
        )}

        {/* Corner decorations */}
        <div
          className="absolute top-3 left-3 w-4 h-4 border-t border-l"
          style={{ borderColor: 'rgba(var(--theme-rgb), 0.3)' }}
        />
        <div
          className="absolute bottom-3 right-3 w-4 h-4 border-b border-r"
          style={{ borderColor: 'rgba(var(--theme-rgb), 0.3)' }}
        />
      </div>
    </div>
  );
};

export default AuthModal;
