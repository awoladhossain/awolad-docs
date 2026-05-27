'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, FileCode, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Doc {
  slug: string;
  title: string;
  description: string;
  category: string;
}

export default function AnimatedGrid({ docs }: { docs: Doc[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Dynamic Entrance Animation for Cards
    const ctx = gsap.context(() => {
      // Fade in and slide up all card elements in a gorgeous spring-like stagger
      gsap.fromTo(
        cardRefs.current.filter(Boolean),
        { opacity: 0, y: 30, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          overwrite: 'auto',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [docs]); // Re-run when document list updates (e.g. via pagination or filters)

  // Mouse Move Spotlight Glow Tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Direct property setting using GSAP for high performance
    gsap.to(card, {
      '--mouse-x': `${x}px`,
      '--mouse-y': `${y}px`,
      duration: 0.2,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
    >
      {docs.map((doc, index) => (
        <div
          key={doc.slug}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          onMouseMove={(e) => handleMouseMove(e, index)}
          className="group relative rounded-2xl bg-[#0d0d11]/45 border border-white/[0.04] p-7 overflow-hidden transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_20px_50px_rgba(16,185,129,0.04)]"
          style={
            {
              '--mouse-x': '50%',
              '--mouse-y': '50%',
            } as React.CSSProperties
          }
        >
          {/* Spotlight Radial Background Glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
            style={{
              background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(16, 185, 129, 0.06), transparent 80%)`,
            }}
          />

          {/* Border Spotlight Glow Effect */}
          <div
            className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style={{
              background: `radial-gradient(250px circle at var(--mouse-x) var(--mouse-y), rgba(52, 211, 153, 0.15), transparent 80%)`,
            }}
          />

          <Link
            href={`/docs/${doc.slug}`}
            className="flex flex-col h-full justify-between space-y-6 relative z-10"
          >
            <div className="space-y-4.5">
              {/* Top Row: Category pill & Arrow link */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/5 group-hover:border-emerald-500/20 transition-all duration-300">
                    <FileCode className="h-5 w-5" />
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5 group-hover:text-emerald-300 transition-all duration-300">
                    <Sparkles className="h-2.5 w-2.5 text-emerald-400 group-hover:animate-pulse" />
                    {doc.category}
                  </span>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.02] border border-white/[0.05] group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-300">
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-400 transform group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-300 transition-all duration-300 leading-snug">
                {doc.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-zinc-450 leading-relaxed line-clamp-2 font-light">
                {doc.description}
              </p>
            </div>

            {/* Bottom Row */}
            <div className="border-t border-white/[0.06] group-hover:border-emerald-500/10 pt-4 flex items-center justify-between text-[11px] font-medium text-zinc-500">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
                <CheckCircle className="h-3 w-3 text-emerald-400/80" />
                Production Standard
              </span>
              <span className="font-mono text-zinc-600 group-hover:text-zinc-500 transition-colors">
                {doc.slug.replace(/-/g, '_')}.md
              </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
