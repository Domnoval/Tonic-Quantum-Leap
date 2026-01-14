import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  transmissionNumber: number;
  generationId?: string;
}

const PRINT_PRODUCTS = {
  poster_12x18: { name: 'Poster 12×18"', price: 2900, description: 'Premium matte poster' },
  poster_18x24: { name: 'Poster 18×24"', price: 3900, description: 'Premium matte poster' },
  poster_24x36: { name: 'Poster 24×36"', price: 4900, description: 'Premium matte poster' },
  canvas_12x12: { name: 'Canvas 12×12"', price: 5900, description: 'Gallery-wrapped canvas' },
  canvas_16x20: { name: 'Canvas 16×20"', price: 7900, description: 'Gallery-wrapped canvas' },
  canvas_24x30: { name: 'Canvas 24×30"', price: 9900, description: 'Gallery-wrapped canvas' },
};

type ProductKey = keyof typeof PRINT_PRODUCTS;

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  transmissionNumber,
  generationId,
}) => {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<ProductKey>('poster_18x24');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: selectedProduct,
          imageUrl,
          generationId,
          transmissionNumber,
          customerEmail: user?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        const stripe = await stripePromise;
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: data.sessionId });
        }
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to initiate checkout');
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl border border-white/20 bg-black p-6 md:p-8 max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="serif text-2xl md:text-3xl text-white italic">Materialize</h2>
            <p
              className="mono text-[9px] uppercase tracking-widest mt-1"
              style={{ color: 'rgba(var(--theme-rgb), 1)' }}
            >
              Transmission #{transmissionNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            [ Close ]
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="border border-white/10 p-2 bg-black/50">
            <img
              src={imageUrl}
              alt={`Transmission #${transmissionNumber}`}
              className="w-full aspect-square object-contain"
            />
          </div>

          {/* Product Selection */}
          <div className="space-y-4">
            <h3 className="mono text-[10px] uppercase tracking-widest text-white/40">
              Select Format
            </h3>

            {/* Posters */}
            <div className="space-y-2">
              <span className="mono text-[9px] uppercase tracking-wider text-white/30">
                Posters
              </span>
              {(['poster_12x18', 'poster_18x24', 'poster_24x36'] as ProductKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedProduct(key)}
                  className={`w-full text-left p-3 border transition-all ${
                    selectedProduct === key
                      ? 'border-white/40 bg-white/5'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="mono text-sm text-white">{PRINT_PRODUCTS[key].name}</span>
                    <span
                      className="mono text-sm"
                      style={{ color: 'rgba(var(--theme-rgb), 1)' }}
                    >
                      {formatPrice(PRINT_PRODUCTS[key].price)}
                    </span>
                  </div>
                  <span className="mono text-[9px] text-white/40">
                    {PRINT_PRODUCTS[key].description}
                  </span>
                </button>
              ))}
            </div>

            {/* Canvas */}
            <div className="space-y-2">
              <span className="mono text-[9px] uppercase tracking-wider text-white/30">
                Canvas
              </span>
              {(['canvas_12x12', 'canvas_16x20', 'canvas_24x30'] as ProductKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedProduct(key)}
                  className={`w-full text-left p-3 border transition-all ${
                    selectedProduct === key
                      ? 'border-white/40 bg-white/5'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="mono text-sm text-white">{PRINT_PRODUCTS[key].name}</span>
                    <span
                      className="mono text-sm"
                      style={{ color: 'rgba(var(--theme-rgb), 1)' }}
                    >
                      {formatPrice(PRINT_PRODUCTS[key].price)}
                    </span>
                  </div>
                  <span className="mono text-[9px] text-white/40">
                    {PRINT_PRODUCTS[key].description}
                  </span>
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 border border-red-500/30 bg-red-500/10">
                <span className="mono text-[10px] uppercase tracking-wider text-red-400">
                  {error}
                </span>
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full py-4 mono text-[11px] uppercase tracking-widest transition-all disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(var(--theme-rgb), 0.15)',
                border: '1px solid rgba(var(--theme-rgb), 0.5)',
                color: 'rgba(var(--theme-rgb), 1)',
              }}
            >
              {isLoading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                `Purchase ${formatPrice(PRINT_PRODUCTS[selectedProduct].price)}`
              )}
            </button>

            <p className="mono text-[8px] text-white/30 text-center uppercase tracking-wider">
              Secure checkout via Stripe. Ships worldwide.
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="mono text-[9px] text-white/40 text-center">
            Purchase unlocks Hall of Transmissions submission.
            Your creation could earn you 50% of future sales.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
