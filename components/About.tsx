import React from 'react';
import { ThemeColor } from '../types';
import SacredGeometry, { GeometricDivider } from './SacredGeometry';

interface AboutProps {
  themeColor: ThemeColor;
}

const SKILLS = [
  { label: 'Physical Painting', desc: 'Acrylic, spray, mixed media on canvas' },
  { label: 'AI Art', desc: 'Generative imagery & human-machine collaboration' },
  { label: '3D Printing', desc: 'Sculptural artifacts & functional art objects' },
  { label: 'Generative Art', desc: 'Code-driven visual systems & algorithms' },
  { label: 'Sacred Geometry', desc: 'Mathematical patterns as spiritual language' },
];

const SOCIALS = [
  { label: 'Instagram', href: '#', icon: '◻' },
  { label: 'Twitter / X', href: '#', icon: '✕' },
  { label: 'Etsy', href: '#', icon: '◈' },
  { label: 'GitHub', href: '#', icon: '⬡' },
];

const About: React.FC<AboutProps> = ({ themeColor }) => {
  return (
    <section className="relative w-full px-4 md:px-12 py-16 md:py-24 bg-[#0a0a0a]" aria-label="About the artist">
      {/* Background Metatron's Cube watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <SacredGeometry variant="metatrons-cube" size={600} opacity={0.03} animated />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="mono text-xs tracking-[0.5em] uppercase mb-3"
            style={{ color: '#C9A84C' }}
          >
            About
          </h2>
          <p className="serif text-3xl md:text-4xl text-white/90 font-light tracking-wide">
            The Artist
          </p>
          <GeometricDivider className="max-w-xs mx-auto mt-6" />
        </div>

        {/* Main Content: Photo + Bio */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 mb-16">
          {/* Photo */}
          <div className="w-full md:w-2/5 flex-shrink-0">
            <div className="aspect-[3/4] glass-card rounded-sm overflow-hidden relative">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <SacredGeometry variant="seed-of-life" size={120} opacity={0.15} color="#C9A84C" />
                  <span className="mono text-[10px] uppercase tracking-widest text-white/20 mt-4 block">
                    Artist Portrait
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Text */}
          <div className="w-full md:w-3/5">
            <h3 className="serif text-2xl text-white/90 mb-1">Michael</h3>
            <p
              className="mono text-[11px] uppercase tracking-widest mb-6"
              style={{ color: 'rgba(201, 168, 76, 0.7)' }}
            >
              Tonic Thought Studios / dYZ
            </p>

            <div className="space-y-4 text-white/60 leading-relaxed text-[15px]">
              <p>
                I distill void and noise into meaning. Every piece begins in chaos — a swirl of
                pigment, a seed of code, a collision of signal and static — and through
                iteration, intention, and intuition, something coherent emerges.
              </p>
              <p>
                My practice spans the physical and digital: paint on canvas, algorithms on
                screens, filament through printers. The common thread is transformation —
                taking raw material (whether acrylic or latent space) and finding the signal
                hidden in the noise.
              </p>
              <p>
                Sacred geometry, mathematics, and the mystical structure of reality inform
                everything I create. Art is not decoration. It's a frequency. A transmission
                from the void.
              </p>
            </div>

            {/* Geometric Divider */}
            <GeometricDivider className="my-10" />

            {/* Skills */}
            <div className="mt-0">
              <h4 className="mono text-[10px] uppercase tracking-widest text-white/30 mb-4">
                Disciplines
              </h4>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <span
                    key={skill.label}
                    title={skill.desc}
                    className="mono text-[11px] px-3 py-1.5 border border-[#C9A84C]/15 text-white/50 rounded-sm transition-all duration-500 hover:border-[#C9A84C]/35 hover:text-[#C9A84C]/80 cursor-default"
                  >
                    {skill.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-10">
              <h4 className="mono text-[10px] uppercase tracking-widest text-white/30 mb-4">
                Connect
              </h4>
              <div className="flex flex-wrap gap-3">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={`Visit ${social.label}`}
                    className="flex items-center gap-2 mono text-xs text-white/40 border border-white/10 px-4 py-3 min-h-[44px] rounded-sm transition-all duration-300 hover:text-white/70 hover:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/30"
                  >
                    <span>{social.icon}</span>
                    <span className="tracking-wider">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
