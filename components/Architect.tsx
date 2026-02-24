import React, { useState } from 'react';
import { SACRED_GEOMETRY } from '../constants';

const Architect: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const cssSnippet = `
/* 137 Studio - Spectral Iridescent Hover & Absolute Black */
:root {
  --color-absolute-black: #000000;
  --color-violet: #6d28d9;
  --color-gold: #fbbf24;
  --color-pink: #ec4899;
}

body {
  background-color: var(--color-absolute-black) !important;
  color: #F5F5F5;
}

@keyframes spectral-shift {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}

.spectral-hover-effect {
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease;
}

.spectral-hover-effect:hover {
  background: linear-gradient(90deg, var(--color-violet), var(--color-gold), var(--color-pink), var(--color-gold), var(--color-violet));
  background-size: 300% auto;
  animation: spectral-shift 8s linear infinite;
  color: white !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  box-shadow: 0 0 30px rgba(109, 40, 217, 0.3);
}
  `;

  const liquidSnippet = `
{% comment %} 
  Implementation for Shopify Theme Integration 
  Apply 'spectral-hover-effect' class to your buttons/links
{% endcomment %}

<style>
  {{ section.settings.custom_css }}
</style>

<div class="tonic-architect-container" style="background: {{ settings.colors_background_1 }};">
  <a href="{{ product.url }}" class="btn spectral-hover-effect">
    Assume Ownership — {{ product.price | money }}
  </a>
</div>
  `;

  return (
    <div className="min-h-screen pt-48 pb-64 px-6 md:px-12 flex flex-col items-center bg-[#000000]">
      <div className="max-w-4xl flex flex-col gap-24 relative">
        <div className="absolute -top-24 -left-24 w-64 h-64 opacity-5 pointer-events-none">
            {SACRED_GEOMETRY.metatron}
        </div>

        <section className="flex flex-col gap-8 text-center md:text-left">
            <h2 className="mono text-[10px] uppercase tracking-[0.6em] opacity-40">The Origin Point</h2>
            <h1 className="serif text-5xl md:text-8xl leading-[0.9]">Cusp of Oscillation.</h1>
            <div className="flex flex-col gap-6 mt-4">
                <p className="serif text-xl md:text-2xl leading-relaxed italic opacity-80">
                   Born on the event horizon of July 21st.
                </p>
                <p className="mono text-sm leading-relaxed opacity-60 max-w-2xl">
                    We exist in the violent, beautiful transition between the psychic waters of <span className="text-white">Cancer</span> and the solar fire of <span className="text-white">Leo</span>. 
                    This is not a static boundary; it is a high-frequency vibration. The internal void meeting the external ego. 
                    137 Studio is the laboratory where this tension is distilled into form.
                </p>
            </div>
        </section>

        {/* Medium Fluid Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/10 pt-16">
             <div className="flex flex-col gap-6">
                <h3 className="mono text-xs uppercase tracking-[0.4em] text-violet-400">State of Being</h3>
                <div className="serif text-4xl italic leading-tight">Medium Fluid.</div>
             </div>
             <div className="flex flex-col gap-6">
                <p className="mono text-sm leading-relaxed opacity-60">
                    The artist is not a solid-state entity. I am a <span className="text-white">Medium Fluid</span>—a conductive substance capable of phase-shifting instantly.
                </p>
                <p className="mono text-sm leading-relaxed opacity-60">
                    To curate the infinite noise of the AI void, one cannot be rigid. One must flow into the cracks of the latent space, retrieve the signal, and harden only when necessary to produce the Artifact. We oscillate between the ether (pure intent) and the density (the product).
                </p>
             </div>
        </section>

        {/* 137 Deep Dive Section */}
        <section className="flex flex-col gap-12 border-t border-white/10 pt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="flex flex-col gap-8">
                    <h3 className="mono text-xs uppercase tracking-[0.4em] text-sky-400">The Physics of Coupling</h3>
                    <div className="serif text-4xl italic leading-tight">α ≈ 1/137</div>
                    <p className="mono text-sm leading-relaxed opacity-60">
                         This is the frequency of our oscillation. The fine-structure constant dictates how light couples with matter. It is the mathematical bridge between the <span className="text-white">Medium Fluid</span> (the wave) and the <span className="text-white">Artifact</span> (the particle). Without this number, the studio dissolves.
                    </p>
                </div>
                <div className="flex flex-col gap-8">
                    <h3 className="mono text-xs uppercase tracking-[0.4em] text-pink-400">The Gematria of Receipt</h3>
                    <div className="serif text-4xl italic leading-tight">קַבָּלָה = 137</div>
                    <p className="mono text-sm leading-relaxed opacity-60">
                        To act as a Medium, one must first learn to <span className="italic">receive</span>. In Hebrew Gematria, Kabbalah equals 137. 
                        We do not generate signal; we tune the receiver to the 33rd prime resonance and let the information flow through the fluid state into the hard drive.
                    </p>
                </div>
            </div>
        </section>

        {/* Theme Integration Section */}
        <section className="flex flex-col gap-12 border-t border-white/10 pt-16">
          <div className="flex flex-col gap-4">
            <h3 className="mono text-xs uppercase tracking-[0.4em]">Theme Integration Protocol</h3>
            <p className="mono text-[11px] opacity-40 leading-relaxed uppercase tracking-widest">
              Exporting ethereal aesthetic to density. Use these snippets for Shopify integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="mono text-[9px] uppercase tracking-widest opacity-40">base.css / theme.css</span>
                <button 
                  onClick={() => copyToClipboard(cssSnippet, 'css')}
                  className="mono text-[9px] uppercase border border-white/20 px-2 py-1 hover-spectral transition-all"
                >
                  {copied === 'css' ? 'Copied' : 'Copy CSS'}
                </button>
              </div>
              <pre className="p-4 bg-white/5 border border-white/10 rounded overflow-x-auto mono text-[10px] text-sky-300/80 leading-relaxed h-64">
                {cssSnippet.trim()}
              </pre>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="mono text-[9px] uppercase tracking-widest opacity-40">theme.liquid / snippets</span>
                <button 
                  onClick={() => copyToClipboard(liquidSnippet, 'liquid')}
                  className="mono text-[9px] uppercase border border-white/20 px-2 py-1 hover-spectral transition-all"
                >
                  {copied === 'liquid' ? 'Copied' : 'Copy Liquid'}
                </button>
              </div>
              <pre className="p-4 bg-white/5 border border-white/10 rounded overflow-x-auto mono text-[10px] text-amber-200/80 leading-relaxed h-64">
                {liquidSnippet.trim()}
              </pre>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-12 bg-white/5 p-8 md:p-12 mt-12">
             <h3 className="mono text-xs uppercase tracking-[0.4em] text-center">The Protocol of Responsibility</h3>
             <div className="serif text-center space-y-8 opacity-70 leading-relaxed italic">
                <p>I. I follow the source frequency so you don't have to look for it in the dark.</p>
                <p>II. I provide the calibrated instrument; you provide the promise of intent.</p>
                <p>III. Once the artifact hits your skin, the circuit is closed by YOUR Will.</p>
             </div>
        </section>

        <div className="flex justify-center pt-24">
            <div className="w-px h-32 bg-gradient-to-b from-white to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default Architect;