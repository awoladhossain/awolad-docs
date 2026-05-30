'use client';

import React, { type ComponentPropsWithoutRef, ReactNode, useState, useEffect } from 'react';
import { usePlayground } from './PlaygroundContext';
import { Play, Sparkles, Terminal } from 'lucide-react';
import Mermaid from '@/components/Mermaid';
import { gsap } from 'gsap';

interface PlaygroundCodeBlockProps extends ComponentPropsWithoutRef<'pre'> {}

function getMermaidChart(children: ReactNode): string | null {
  if (!children) return null;
  if (React.isValidElement(children)) {
    const props = children.props as { className?: string; children?: ReactNode };
    if (props?.className === 'language-mermaid') {
      return props.children?.toString() || '';
    }
    if (props?.children) {
      return getMermaidChart(props.children);
    }
  }
  if (Array.isArray(children)) {
    for (const child of children) {
      const chart = getMermaidChart(child);
      if (chart !== null) return chart;
    }
  }
  return null;
}

const RUNNABLE_LANGUAGES = ['javascript', 'js', 'typescript', 'ts', 'python', 'py', 'go', 'golang', 'cpp', 'c', 'sql', 'sqlite', 'bash', 'sh'];

export default function PlaygroundCodeBlock(props: PlaygroundCodeBlockProps) {
  const { setCode, setLanguage, setIsOpen } = usePlayground();
  const [isHovered, setIsHovered] = useState(false);

  // Check if it's a Mermaid chart
  const chart = getMermaidChart(props.children);
  if (chart !== null) {
    return <Mermaid chart={chart} />;
  }

  // Extract language and code content
  let lang = 'code';
  let rawCode = '';

  if (React.isValidElement(props.children)) {
    const childrenProps = props.children.props as { className?: string; children?: ReactNode };
    const className = childrenProps?.className || '';
    const match = className.match(/language-(\w+)/);
    if (match) {
      lang = match[1];
    }

    if (childrenProps.children) {
      if (typeof childrenProps.children === 'string') {
        rawCode = childrenProps.children;
      } else if (Array.isArray(childrenProps.children)) {
        rawCode = childrenProps.children.join('');
      } else {
        rawCode = childrenProps.children.toString();
      }
    }
  }

  const isRunnable = RUNNABLE_LANGUAGES.includes(lang.toLowerCase());

  const handleTryInPlayground = () => {
    // Normalise language names
    let cleanLang = lang.toLowerCase();
    if (cleanLang === 'js') cleanLang = 'javascript';
    if (cleanLang === 'ts') cleanLang = 'typescript';
    if (cleanLang === 'py') cleanLang = 'python';
    if (cleanLang === 'golang') cleanLang = 'go';
    if (cleanLang === 'sqlite') cleanLang = 'sql';
    if (cleanLang === 'sh') cleanLang = 'bash';

    setLanguage(cleanLang);
    setCode(rawCode.trim());
    setIsOpen(true);

    // Dynamic floating spark effect
    gsap.timeline()
      .to(`.try-btn-${lang}`, { scale: 0.9, duration: 0.08 })
      .to(`.try-btn-${lang}`, { scale: 1, duration: 0.12, ease: 'power2.out' });
  };

  return (
    <div
      className="my-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c10]/80 shadow-lg relative group transition-colors duration-300 hover:border-emerald-500/15"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow highlight on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.01] to-transparent pointer-events-none z-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

      {/* Mac OS Style Window Title bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.05] bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-1.5 select-none">
          <div className="h-2 w-2 rounded-full bg-[#ef4444]/60" />
          <div className="h-2 w-2 rounded-full bg-[#f59e0b]/60" />
          <div className="h-2 w-2 rounded-full bg-[#10b981]/60" />
        </div>
        <div className="flex items-center gap-3">
          <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 select-none">
            {lang}
          </div>

          {/* Interactive Try Button */}
          {isRunnable && (
            <button
              onClick={handleTryInPlayground}
              className={`try-btn-${lang} flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-400 shadow-sm transition-all hover:bg-emerald-500 hover:text-[#09090b] hover:shadow-emerald-500/20 active:scale-95 cursor-pointer select-none`}
            >
              <Play className="h-2 w-2 fill-current" />
              Try in Playground
            </button>
          )}
        </div>
      </div>

      <pre
        className="
          relative
          z-10
          overflow-x-auto
          p-5
          font-mono
          text-[13px]
          leading-relaxed
          text-zinc-300
          scrollbar-thin
          bg-transparent
          m-0
        "
        {...props}
      />
    </div>
  );
}
