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
      className={`fixed right-0 top-14 bottom-0 z-40 flex w-full flex-col border-l border-white/[0.08] bg-[#050508]/80 backdrop-blur-2xl shadow-2xl transition-all duration-300 lg:w-[48%] xl:w-[45%] ${
        isOpen ? 'shadow-emerald-950/30 border-emerald-500/10' : 'pointer-events-none'
      }`}
    >
      {/* Dynamic Radial glow indicators based on engine state */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-l-3xl z-0">
        <div className={`absolute -right-20 -top-20 h-80 w-80 rounded-full transition-all duration-1000 ${
          isRunning ? 'bg-amber-500/5 blur-[120px]' : 'bg-emerald-500/4 blur-[120px]'
        }`} />
        <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      {/* Editor Header controls */}
      <div className="relative z-10 flex h-14 items-center justify-between border-b border-white/[0.06] bg-black/40 px-5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/20">
            <Terminal className="h-3 w-3 text-emerald-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-200">System Sandbox</span>
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Isolated Environment</span>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown with high end hover animations */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-white/[0.08] bg-[#09090d] px-3 py-1.5 text-xs font-semibold text-zinc-300 outline-none hover:border-emerald-500/30 hover:text-emerald-300 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all select-none cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-[#09090d] text-zinc-300 font-semibold py-1">
                {lang.label}
              </option>
            ))}
          </select>

          {/* Close Panel Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all active:scale-95 cursor-pointer"
            title="Close Playground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Code Editor Frame */}
      <div className="relative z-10 flex-1 overflow-hidden bg-black/10">
        <div className="h-full w-full">
          <MonacoEditor
            height="100%"
            language={language === 'sql' ? 'sql' : language === 'golang' || language === 'go' ? 'go' : language}
            theme="premium-space-dark"
            value={code}
            onChange={handleEditorChange}
            onMount={(editor, monaco) => {
              // Custom luxurious Dracula/Neon inspired space theme
              monaco.editor.defineTheme('premium-space-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                  { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
                  { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
                  { token: 'string', foreground: 'f1fa8c' },
                  { token: 'number', foreground: 'bd93f9' },
                  { token: 'operator', foreground: '50fa7b' },
                  { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
                  { token: 'function', foreground: '50fa7b', fontStyle: 'bold' },
                  { token: 'identifier', foreground: 'f8f8f2' },
                ],
                colors: {
                  'editor.background': '#07070a',
                  'editor.lineHighlightBackground': '#111118',
                  'editor.selectionBackground': '#44475a40',
                  'editorCursor.foreground': '#10b981',
                  'editorLineNumber.foreground': '#374151',
                  'editorLineNumber.activeForeground': '#10b981',
                  'editorWidget.background': '#09090d',
                  'editorWidget.border': '#ffffff0c',
                }
              });
              monaco.editor.setTheme('premium-space-dark');
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'var(--font-geist-mono)',
              lineHeight: 22,
              padding: { top: 16, bottom: 16 },
              tabSize: 2,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              scrollbar: {
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
                vertical: 'visible',
                horizontal: 'visible',
              },
            }}
          />
        </div>
      </div>

      {/* Console Action Bar */}
      <div className="relative z-10 flex h-12 items-center justify-between border-t border-b border-white/[0.06] bg-[#08080c]/90 px-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-300 ${
              isRunning ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
            }`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              {isRunning ? 'sandbox executing...' : 'telemetry engine online'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Clear console logs */}
          <button
            onClick={clearTerminal}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.01] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-all cursor-pointer select-none active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear Output
          </button>
          
          {/* Execute Code Button */}
          <button
            onClick={handleRunClick}
            disabled={isRunning}
            className="run-btn-pulse flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-1.5 text-xs font-bold uppercase tracking-wide text-[#050508] hover:from-emerald-400 hover:to-teal-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-lg shadow-emerald-950/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-[#050508]" />
                Run Execution
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal logs panel */}
      <div className="relative z-10 h-[32%] min-h-[140px] overflow-y-auto bg-[#040407] p-5 font-mono text-[11px] leading-relaxed border-t border-white/[0.05] scrollbar-thin select-text">
        <div className="space-y-2">
          {terminalOutput.map((line, idx) => {
            let typeStyle = 'text-zinc-300 pl-2.5 border-l border-zinc-700/30';
            let prefix = '';

            if (line.type === 'stderr') {
              typeStyle = 'text-rose-400 font-medium bg-rose-950/20 border border-rose-500/10 px-3 py-2 rounded-lg shadow-sm shadow-rose-950/20 block w-full leading-normal';
              prefix = '✖ ';
            } else if (line.type === 'system') {
              typeStyle = 'text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-500/10 px-3 py-2 rounded-lg shadow-sm shadow-emerald-950/20 block w-full leading-normal';
              prefix = '[System] ';
            } else {
              prefix = '• ';
            }

            return (
              <div key={idx} className={`${typeStyle} whitespace-pre-wrap transition-all duration-300 hover:bg-white/[0.01]`}>
                <span className="opacity-45 select-none">{prefix}</span>
                {line.text}
              </div>
            );
          })}
          {terminalOutput.length === 0 && (
            <div className="text-zinc-600 italic select-none py-1.5 pl-1.5">Console logs is clean. Code execution outputs will stream here...</div>
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
