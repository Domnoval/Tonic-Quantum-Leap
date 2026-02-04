import React, { useState } from 'react';

interface PurchaseModalPreviewProps {
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

type NotifyStatus = 'idle' | 'collecting' | 'sending' | 'success' | 'error';

const PurchaseModalPreview: React.FC<PurchaseModalPreviewProps> = ({
  isOpen,
  onClose,
  imageUrl,
  transmissionNumber,
  generationId,
}) => {
  const [productType, setProductType] = useState<ProductType>('poster');
  const [posterSize, setPosterSize] = useState<PosterSize>('18x24');
  const [canvasSize, setCanvasSize] = useState<CanvasSize>('16x20');
  const [status, setStatus] = useState<NotifyStatus>('idle');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSize = productType === 'poster' ? posterSize : canvasSize;
  const currentProduct = PRODUCTS[productType][currentSize as keyof typeof PRODUCTS[typeof productType]];
  const productKey = `${productType}_${currentSize}`;

  const handleNotifyArtist = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setStatus('sending');
    setError(null);

    try {
      const response = await fetch('/api/notify-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: productKey,
          productName: `${productType === 'poster' ? 'Poster' : 'Canvas'} ${currentProduct.name}`,
          price: currentProduct.price,
          imageUrl,
          transmissionNumber,
          generationId,
          customerEmail: email,
          customerName: name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to notify');
      }

      setReference(data.reference);
      setStatus('success');
    } catch (err: any) {
      console.error('Notify error:', err);
      setError(err.message || 'Something went wrong');
      setStatus('error');
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  // Success screen
  if (status === 'success') {
    return (
      <div
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md border border-amber-500/30 bg-black text-center p-8 animate-modal-in"
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-6">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="serif text-3xl text-white italic mb-2">You're In</h2>
            <p
              className="mono text-[10px] uppercase tracking-widest"
              style={{ color: 'rgba(var(--theme-rgb), 1)' }}
            >
              The Artist Has Been Notified
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-4 mb-6">
            <p className="mono text-[9px] text-white/40 uppercase tracking-wider mb-2">Reference</p>
            <p className="mono text-lg text-amber-400">{reference}</p>
          </div>

          <p className="mono text-[11px] text-white/50 mb-6 leading-relaxed">
            Michael will reach out to you directly at <span className="text-white">{email}</span> to complete your purchase.
          </p>

          <div className="border border-white/10 bg-white/[0.02] p-4 mb-6">
            <p className="mono text-[9px] text-white/30 leading-relaxed">
              You've selected: <span className="text-white/60">{productType === 'poster' ? 'Poster' : 'Canvas'} {currentProduct.name}</span>
              <br/>
              Transmission #{transmissionNumber} • {formatPrice(currentProduct.price)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 mono text-[11px] uppercase tracking-widest border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-all"
          >
            Close
          </button>

          <p className="mono text-[8px] text-white/20 mt-4">
            Expect a response within 24 hours
          </p>
        </div>

        <style>{`
          @keyframes modal-in {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-modal-in { animation: modal-in 0.25s ease-out forwards; }
        `}</style>
      </div>
    );
  }

  // Email collection screen
  if (status === 'collecting') {
    return (
      <div
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md border border-white/20 bg-black animate-modal-in"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="serif text-2xl text-white italic">Almost There</h2>
                <p
                  className="mono text-[9px] uppercase tracking-widest mt-1"
                  style={{ color: 'rgba(var(--theme-rgb), 1)' }}
                >
                  Direct Purchase Portal
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
            {/* Selected product summary */}
            <div className="flex gap-4 mb-6 p-4 border border-white/10 bg-white/[0.02]">
              <img
                src={imageUrl}
                alt={`Transmission #${transmissionNumber}`}
                className="w-20 h-20 object-cover border border-white/10"
              />
              <div className="flex-1">
                <p className="mono text-[9px] text-amber-400 uppercase tracking-wider">
                  Transmission #{transmissionNumber}
                </p>
                <p className="mono text-white mt-1">
                  {productType === 'poster' ? 'Poster' : 'Canvas'} {currentProduct.name}
                </p>
                <p className="mono text-xl text-amber-400 font-bold mt-1">
                  {formatPrice(currentProduct.price)}
                </p>
              </div>
            </div>

            {/* Notice */}
            <div className="mb-6 p-4 border border-amber-500/20 bg-amber-500/5">
              <p className="mono text-[10px] text-amber-400/80 leading-relaxed">
                <span className="text-amber-400">✦ EARLY ACCESS</span>
                <br/><br/>
                The shop is still materializing. Leave your info and Michael will reach out directly to complete your purchase — often with exclusive early-supporter perks.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="mono text-[9px] uppercase tracking-widest text-white/40 block mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white mono text-sm placeholder:text-white/20 focus:border-amber-500/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="mono text-[9px] uppercase tracking-widest text-white/40 block mb-2">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="How should we address you?"
                  className="w-full px-4 py-3 bg-transparent border border-white/20 text-white mono text-sm placeholder:text-white/20 focus:border-amber-500/50 focus:outline-none transition-colors"
                />
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

            {/* Submit button */}
            <button
              onClick={handleNotifyArtist}
              disabled={status === 'sending'}
              className="w-full py-4 mono text-[12px] uppercase tracking-widest transition-all disabled:opacity-50 bg-amber-500/20 border border-amber-500/60 text-amber-400 hover:bg-amber-500/30 hover:border-amber-400"
            >
              {status === 'sending' ? (
                <span className="animate-pulse">Transmitting...</span>
              ) : (
                <>Notify the Artist</>
              )}
            </button>

            <button
              onClick={() => setStatus('idle')}
              className="w-full py-3 mt-2 mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
            >
              ← Back to Selection
            </button>
          </div>
        </div>

        <style>{`
          @keyframes modal-in {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-modal-in { animation: modal-in 0.25s ease-out forwards; }
        `}</style>
      </div>
    );
  }

  // Main product selection (original UI)
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

          {/* Continue button */}
          <button
            onClick={() => setStatus('collecting')}
            className="w-full py-4 mono text-[12px] uppercase tracking-widest transition-all bg-amber-500/20 border border-amber-500/60 text-amber-400 hover:bg-amber-500/30 hover:border-amber-400"
          >
            Continue • {formatPrice(currentProduct.price)}
          </button>

          <p className="mono text-[8px] text-white/30 text-center mt-4 uppercase tracking-wider">
            Free shipping on orders over $150
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <p className="mono text-[8px] text-white/40 text-center">
            ✦ Early Access — The artist will personally fulfill your order
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

export default PurchaseModalPreview;
