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

type ProductType = 'poster' | 'canvas';
type PosterSize = '12x18' | '18x24' | '24x36';
type CanvasSize = '12x12' | '16x20' | '24x30';

const PRODUCTS = {
  poster: {
    '12x18': { name: '12×18"', price: 6500, description: 'Perfect for desks & small spaces' },
    '18x24': { name: '18×24"', price: 8000, description: 'Most popular size' },
    '24x36': { name: '24×36"', price: 10500, description: 'Statement piece' },
  },
  canvas: {
    '12x12': { name: '12×12"', price: 12500, description: 'Intimate square format' },
    '16x20': { name: '16×20"', price: 17500, description: 'Classic gallery size' },
    '24x30': { name: '24×30"', price: 27500, description: 'Commanding presence' },
  },
};

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  transmissionNumber,
  generationId,
}) => {
  const { user } = useAuth();
  const [productType, setProductType] = useState<ProductType>('poster');
  const [posterSize, setPosterSize] = useState<PosterSize>('18x24');
  const [canvasSize, setCanvasSize] = useState<CanvasSize>('16x20');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSize = productType === 'poster' ? posterSize : canvasSize;
  const currentProduct = PRODUCTS[productType][currentSize as keyof typeof PRODUCTS[typeof productType]];
  const productKey = `${productType}_${currentSize}`;

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: productKey,
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
        className="w-full max-w-xl border border-white/20 bg-black max-h-[90vh] overflow-auto animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-start">
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
              className="mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors p-2 -m-2"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Preview */}
          <div className="mb-6 border border-white/10 bg-black/50 p-2">
            <img
              src={imageUrl}
              alt={`Transmission #${transmissionNumber}`}
              className="w-full aspect-video object-contain"
            />
          </div>

          {/* Product Type Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => setProductType('poster')}
              className={`py-4 border transition-all ${
                productType === 'poster'
                  ? 'border-amber-500/60 bg-amber-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">🖼️</span>
                <span className={`mono text-[11px] uppercase tracking-wider ${
                  productType === 'poster' ? 'text-amber-400' : 'text-white/60'
                }`}>
                  Poster
                </span>
                <span className="mono text-[8px] text-white/30">
                  Enhanced Matte Paper
                </span>
              </div>
            </button>
            <button
              onClick={() => setProductType('canvas')}
              className={`py-4 border transition-all ${
                productType === 'canvas'
                  ? 'border-amber-500/60 bg-amber-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">🎨</span>
                <span className={`mono text-[11px] uppercase tracking-wider ${
                  productType === 'canvas' ? 'text-amber-400' : 'text-white/60'
                }`}>
                  Canvas
                </span>
                <span className="mono text-[8px] text-white/30">
                  Gallery-Wrapped
                </span>
              </div>
            </button>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <span className="mono text-[9px] uppercase tracking-widest text-white/40 block mb-3">
              Select Size
            </span>
            <div className="grid grid-cols-3 gap-2">
              {productType === 'poster' ? (
                <>
                  {(['12x18', '18x24', '24x36'] as PosterSize[]).map(size => {
                    const product = PRODUCTS.poster[size];
                    const isSelected = posterSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setPosterSize(size)}
                        className={`p-4 border transition-all ${
                          isSelected
                            ? 'border-amber-500/60 bg-amber-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className={`mono text-lg font-bold ${
                            isSelected ? 'text-amber-400' : 'text-white'
                          }`}>
                            {product.name}
                          </span>
                          <span className={`mono text-sm ${
                            isSelected ? 'text-amber-300' : 'text-white/60'
                          }`}>
                            {formatPrice(product.price)}
                          </span>
                          <span className="mono text-[7px] text-white/30 text-center">
                            {product.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </>
              ) : (
                <>
                  {(['12x12', '16x20', '24x30'] as CanvasSize[]).map(size => {
                    const product = PRODUCTS.canvas[size];
                    const isSelected = canvasSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setCanvasSize(size)}
                        className={`p-4 border transition-all ${
                          isSelected
                            ? 'border-amber-500/60 bg-amber-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className={`mono text-lg font-bold ${
                            isSelected ? 'text-amber-400' : 'text-white'
                          }`}>
                            {product.name}
                          </span>
                          <span className={`mono text-sm ${
                            isSelected ? 'text-amber-300' : 'text-white/60'
                          }`}>
                            {formatPrice(product.price)}
                          </span>
                          <span className="mono text-[7px] text-white/30 text-center">
                            {product.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="mb-6 p-4 border border-white/10 bg-white/[0.02]">
            <div className="flex justify-between items-center mb-3">
              <span className="mono text-white">
                {productType === 'poster' ? 'Poster' : 'Canvas'} {currentProduct.name}
              </span>
              <span className="mono text-xl text-amber-400 font-bold">
                {formatPrice(currentProduct.price)}
              </span>
            </div>
            <div className="space-y-1">
              {productType === 'poster' ? (
                <>
                  <p className="mono text-[9px] text-white/50">• Enhanced matte paper (189 gsm / 80 lb)</p>
                  <p className="mono text-[9px] text-white/50">• Museum-quality giclée printing</p>
                  <p className="mono text-[9px] text-white/50">• Acid-free, archival quality</p>
                </>
              ) : (
                <>
                  <p className="mono text-[9px] text-white/50">• Premium poly-cotton canvas</p>
                  <p className="mono text-[9px] text-white/50">• Gallery-wrapped on 1.5" wooden frame</p>
                  <p className="mono text-[9px] text-white/50">• Ready to hang, hardware included</p>
                </>
              )}
              <p className="mono text-[9px] text-white/50">• Ships worldwide in 3-7 business days</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 border border-red-500/30 bg-red-500/10">
              <span className="mono text-[10px] uppercase tracking-wider text-red-400">
                {error}
              </span>
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full py-4 mono text-[12px] uppercase tracking-widest transition-all disabled:opacity-50 bg-amber-500/20 border border-amber-500/60 text-amber-400 hover:bg-amber-500/30 hover:border-amber-400"
          >
            {isLoading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>Checkout • {formatPrice(currentProduct.price)}</>
            )}
          </button>

          <p className="mono text-[8px] text-white/30 text-center mt-4 uppercase tracking-wider">
            Secure checkout via Stripe • Free shipping on orders over $150
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <p className="mono text-[8px] text-white/40 text-center">
            Purchase unlocks Hall of Transmissions submission — your creation could earn you 50% of future sales.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PurchaseModal;
