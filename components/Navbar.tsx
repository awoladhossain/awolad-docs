'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { BookOpen, Github, Cpu } from 'lucide-react';
import { gsap } from 'gsap';

interface NavbarProps {
  activeModulesCount?: number;  
}

export default function Navbar({ activeModulesCount = 12 }: NavbarProps) {
  const brandRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Elegant floating entry animation
    gsap.fromTo(
      '.navbar-item',
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power4.out' }
    );
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md transition-all select-none">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-8">
        {/* Brand Inginia */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="navbar-item flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-950/40 group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/10 transition-all">
            <BookOpen className="h-4.5 w-4.5 text-emerald-400 group-hover:rotate-6 transition-transform" />
          </div>
          <div ref={brandRef} className="navbar-item flex flex-col">
            <span className="text-[12px] font-bold tracking-tight text-white font-mono uppercase group-hover:text-emerald-300 transition-colors">
              CORE KERNEL HUB
            </span>
            <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
              Systems Engineering Manuals
            </span>
          </div>
        </Link>

        {/* Action Widgets */}
        <div className="flex items-center gap-4">
          {/* Active telemetry indicator */}
          <div ref={statusRef} className="navbar-item hidden sm:flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-1 text-[10px] font-semibold text-zinc-400 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-zinc-400 uppercase tracking-wider">
              {activeModulesCount} Active Volumes
            </span>
          </div>

          {/* Github repository link */}
          <a
            href="https://github.com/awoladhossain"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-item flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-all active:scale-95 shadow-sm"
            title="GitHub Portfolio"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
