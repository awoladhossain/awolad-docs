'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Mail, ShieldCheck, Heart, Terminal, Cpu } from 'lucide-react';
import { gsap } from 'gsap';

export default function Footer() {
  useEffect(() => {
    // Subtle scroll reveal for footer links
    gsap.fromTo(
      '.footer-reveal',
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: 'footer',
          start: 'top bottom-=50px',
        },
      }
    );
  }, []);

  return (
    <footer className="border-t border-white/[0.06] bg-[#07070a]/60 backdrop-blur-md relative z-10 select-none">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Diagnostic status block */}
          <div className="footer-reveal flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">Operational Diagnostics</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest leading-none font-bold">Systems Normal</span>
              </div>
            </div>
          </div>

          {/* Socials & details */}
          <div className="footer-reveal flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
            <a
              href="mailto:awoladh04@gmail.com"
              className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 transition-colors normal-case"
            >
              <Mail className="h-3 w-3" />
              awoladh04@gmail.com
            </a>
            <span className="text-zinc-800">•</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3 w-3 text-zinc-600" />
              V8 Engine JIT v30
            </span>
            <span className="text-zinc-800">•</span>
            <span>NextJS 15</span>
          </div>

          {/* Copyright signature */}
          <div className="footer-reveal text-center md:text-right font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
            <span>© {new Date().getFullYear()} CORE KERNEL HUB • </span>
            <span className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">AWOLAD HOSSAIN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
