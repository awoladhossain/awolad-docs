'use client';

import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePlayground } from './PlaygroundContext';
import { Play, RotateCcw, X, Terminal, Cpu, Loader2 } from 'lucide-react';
import { gsap } from 'gsap';

// Load Monaco Editor dynamically with no SSR
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0c0c10]/40 backdrop-blur-md">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <span className="text-xs text-zinc-500 font-mono">Initializing Monaco Sandbox...</span>
      </div>
    </div>
  ),
});

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python 3' },
  { value: 'go', label: 'Go (Golang)' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'sql', label: 'SQL (SQLite)' },
  { value: 'bash', label: 'Bash' },
];

export default function InteractivePlayground() {
  const {
    code,
    setCode,
    language,
    setLanguage,
    isOpen,
    setIsOpen,
    terminalOutput,
    isRunning,
    runCode,
    clearTerminal,
  } = usePlayground();

  const [mounted, setMounted] = React.useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set mounted on client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll terminal to bottom when output changes
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  // GSAP animation for sliding in/out
  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      gsap.to(containerRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power4.out',
      });
      // Small scale reveal of run button
      gsap.fromTo(
        '.run-btn-pulse',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, delay: 0.3, ease: 'back.out(1.7)' }
      );
    } else {
      gsap.to(containerRef.current, {
        x: '100%',
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in',
      });
    }
  }, [isOpen, mounted]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleRunClick = () => {
    // Tactile button animation
    gsap.timeline()
      .to('.run-btn-pulse', { scale: 0.95, duration: 0.1 })
      .to('.run-btn-pulse', { scale: 1, duration: 0.15, ease: 'power2.out' });

    runCode();
  };

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      style={{ transform: 'translateX(100%)', opacity: 0 }}
      data-lenis-prevent="true"
      className={`fixed right-0 top-14 bottom-0 z-40 flex w-full flex-col border-l border-white/[0.06] bg-[#09090b]/95 backdrop-blur-xl shadow-2xl transition-shadow duration-300 lg:w-[48%] xl:w-[45%] ${
        isOpen ? 'shadow-emerald-950/20' : 'pointer-events-none'
      }`}
    >
      {/* Editor Header controls */}
      <div className="flex h-12 items-center justify-between border-b border-white/[0.05] bg-white/[0.01] px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Playground</span>
        </div>

        {/* Controls Panel */}
        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-white/[0.08] bg-[#0c0c10] px-2.5 py-1 text-xs font-semibold text-zinc-300 outline-none transition-colors hover:border-emerald-500/30 hover:text-white"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-[#09090b]">
                {lang.label}
              </option>
            ))}
          </select>

          {/* Close Panel Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-all"
            title="Close Playground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Code Editor Frame */}
      <div className="relative flex-1 overflow-hidden">
        {/* Glow lights behind editor */}
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/3 blur-[90px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-teal-500/3 blur-[90px] pointer-events-none" />

        <div className="h-full w-full">
          <MonacoEditor
            height="100%"
            language={language === 'sql' ? 'sql' : language === 'golang' || language === 'go' ? 'go' : language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'var(--font-geist-mono)',
              lineHeight: 20,
              padding: { top: 12, bottom: 12 },
              tabSize: 2,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                vertical: 'visible',
                horizontal: 'visible',
              },
            }}
          />
        </div>
      </div>

      {/* Console Action Bar */}
      <div className="flex h-11 items-center justify-between border-t border-b border-white/[0.05] bg-[#0c0c10]/80 px-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
          <Cpu className="h-3.5 w-3.5 text-zinc-600" />
          Terminal Console
        </div>
        <div className="flex items-center gap-2">
          {/* Clear console logs */}
          <button
            onClick={clearTerminal}
            className="flex items-center gap-1 rounded-md border border-white/[0.05] bg-white/[0.01] px-2.5 py-1 text-[10px] font-bold uppercase text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
          
          {/* Execute Code Button */}
          <button
            onClick={handleRunClick}
            disabled={isRunning}
            className="run-btn-pulse flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold uppercase text-[#09090b] shadow-md shadow-emerald-500/10 hover:bg-emerald-400 hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-[#09090b]" />
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal logs panel */}
      <div className="h-[32%] min-h-[140px] overflow-y-auto bg-[#070709] p-4 font-mono text-xs leading-normal border-t border-white/[0.04] scrollbar-thin select-text">
        <div className="space-y-1.5">
          {terminalOutput.map((line, idx) => {
            let typeColor = 'text-zinc-350';
            let prefix = '';

            if (line.type === 'stderr') {
              typeColor = 'text-red-400 font-medium bg-red-950/20 px-1 rounded-sm border border-red-500/10 block w-full';
              prefix = '✖ ';
            } else if (line.type === 'system') {
              typeColor = 'text-emerald-400/80 font-bold';
              prefix = '[System] ';
            } else {
              typeColor = 'text-zinc-200';
              prefix = '> ';
            }

            return (
              <div key={idx} className={`${typeColor} whitespace-pre-wrap`}>
                <span className="opacity-40 select-none">{prefix}</span>
                {line.text}
              </div>
            );
          })}
          {terminalOutput.length === 0 && (
            <div className="text-zinc-600 italic select-none">Console is clean. Run code to see output.</div>
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
