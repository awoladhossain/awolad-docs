'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Cpu } from 'lucide-react';

export default function TerminalWidget() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 3D folding slide-up reveal of the terminal wrapper
      gsap.fromTo(
        terminalRef.current,
        { opacity: 0, y: 35, transformPerspective: 1200, rotateX: -6, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power4.out',
          delay: 0.65,
        },
      );

      // Staggered line-by-line printing simulation
      gsap.fromTo(
        '.terminal-line',
        { opacity: 0, x: -8 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.18,
          ease: 'power2.out',
          delay: 1.1,
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={terminalRef}
      className="relative mt-8 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c10]/80 p-0 font-mono text-[11px] leading-relaxed text-zinc-400 shadow-2xl backdrop-blur-md select-none group"
    >
      {/* Light gradient highlight background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.01] to-transparent pointer-events-none z-0" />

      {/* Terminal Titlebar Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.05] bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/30 border border-[#ef4444]/15" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#eab308]/30 border border-[#eab308]/15" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#22c55e]/30 border border-[#22c55e]/15" />
        </div>
        <div className="text-[10px] font-semibold text-zinc-500 font-mono select-none tracking-wide">
          guest@core-kernel: ~
        </div>
        <Cpu className="h-3.5 w-3.5 text-emerald-500/40" />
      </div>

      {/* Terminal Body Content */}
      <div className="relative z-10 p-5 space-y-2.5 min-h-[220px]">
        <div className="terminal-line flex items-center gap-2 text-emerald-400 font-bold">
          <span className="text-zinc-500 select-none">$</span>
          <span>core-kernel init --env=production</span>
        </div>

        <div className="terminal-line text-zinc-500 flex items-center gap-1.5">
          <span className="text-[9px] text-zinc-600 select-none">[19:59:45]</span>
          <span>Launching distributed high-performance manual clusters...</span>
        </div>

        <div className="terminal-line flex items-center gap-2">
          <span className="text-emerald-500 font-bold bg-emerald-950/40 border border-emerald-500/25 px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase select-none">
            SUCCESS
          </span>
          <span>Lenis Smooth Scroll and GSAP ticker synchronised (120fps).</span>
        </div>

        <div className="terminal-line flex items-center gap-2">
          <span className="text-emerald-500 font-bold bg-emerald-950/40 border border-emerald-500/25 px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase select-none">
            SUCCESS
          </span>
          <span>3D perspective fold reveals bound to viewport triggers.</span>
        </div>

        <div className="terminal-line text-zinc-500 flex items-center gap-1.5">
          <span className="text-[9px] text-zinc-600 select-none">[19:59:46]</span>
          <span>Mounting 13 active handbook modules on static route...</span>
        </div>

        <div className="terminal-line text-zinc-300 font-semibold flex items-center gap-2">
          <span className="text-zinc-500 select-none">$</span>
          <span>cat core-system-metrics.json</span>
        </div>

        <div className="terminal-line text-emerald-300/80 bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl font-mono text-[9px] sm:text-[10px] whitespace-pre overflow-x-auto scrollbar-none leading-normal">
          {`{
  "status": "online",
  "verified_nodes": 13,
  "level": "Staff_Systems_Architect",
  "rendering_engine": "NextJS_Turbopack",
  "speed_optimization": "Inertial_Smooth_Scroll"
}`}
        </div>

        {/* Bouncing cursor line */}
        <div className="terminal-line flex items-center gap-2 text-zinc-200 font-bold">
          <span className="text-zinc-500 select-none">guest@core-kernel:~$</span>
          <span className="h-3 w-1.5 bg-emerald-400 animate-pulse inline-block align-middle" />
        </div>
      </div>
    </div>
  );
}
