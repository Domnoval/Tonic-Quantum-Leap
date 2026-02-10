import React from 'react';
import { ThemeColor } from '../types';

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
    <section className="w-full px-4 md:px-12 py-16 md:py-24" aria-label="About the artist">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="mono text-xs tracking-[0.4em] uppercase mb-3 transition-colors duration-500"
            style={{ color: 'rgba(var(--theme-rgb), 0.6)' }}
          >
            About
          </h2>
          <p className="serif text-3xl md:text-4xl text-white/90 font-light">
            The Artist
          </p>
          <div
            className="w-16 h-px mx-auto mt-6 transition-colors duration-500"
            style={{ backgroundColor: 'rgba(var(--theme-rgb), 0.4)' }}
          />
        </div>

        {/* Main Content: Photo + Bio */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 mb-16">
          {/* Photo */}
          <div className="w-full md:w-2/5 flex-shrink-0">
            <div className="aspect-[3/4] bg-white/[0.03] border border-white/10 rounded-sm overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="text-6xl mb-4 transition-colors duration-500"
                    style={{ color: 'rgba(var(--theme-rgb), 0.3)' }}
                  >
                    ◎
                  </div>
                  <span className="mono text-[10px] uppercase tracking-widest text-white/20">
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
              className="mono text-[11px] uppercase tracking-widest mb-6 transition-colors duration-500"
              style={{ color: 'rgba(var(--theme-rgb), 0.7)' }}
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

            {/* Skills */}
            <div className="mt-10">
              <h4 className="mono text-[10px] uppercase tracking-widest text-white/30 mb-4">
                Disciplines
              </h4>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <span
                    key={skill.label}
                    title={skill.desc}
                    className="mono text-[11px] px-3 py-1.5 border border-white/10 text-white/50 rounded-sm transition-all duration-300 hover:border-white/25 hover:text-white/70 cursor-default"
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
