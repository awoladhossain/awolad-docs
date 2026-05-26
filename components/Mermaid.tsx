"use client";

import React, { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check } from "lucide-react";

interface MermaidProps {
  chart: string;
}

let mermaidIdCounter = 0;

export default function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.0);
  const [copied, setCopied] = useState<boolean>(false);
  const idRef = useRef(`mermaid-${++mermaidIdCounter}`);

  useEffect(() => {
    let active = true;

    async function renderDiagram() {
      try {
        setLoading(true);
        setError(false);

        // Dynamically import mermaid to avoid SSR issues
        const { default: mermaid } = await import("mermaid");

        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          themeVariables: {
            background: "transparent",
            primaryColor: "#059669", // emerald-600
            primaryTextColor: "#f8fafc", // slate-50
            primaryBorderColor: "#10b981", // emerald-500
            lineColor: "#64748b", // slate-500
            secondaryColor: "#0d9488", // teal-600
            tertiaryColor: "#0f172a", // slate-900
          },
        });

        if (!active) return;

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(idRef.current, chart);

        if (active) {
          setSvg(renderedSvg);
          setLoading(false);
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      active = false;
    };
  }, [chart]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoom(1.0);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="my-8 overflow-hidden rounded-2xl border border-red-500/20 bg-red-950/10 p-5 font-mono text-xs text-red-400">
        <div className="mb-2 font-semibold">❌ Mermaid Rendering Error</div>
        <pre className="overflow-x-auto whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="relative my-8 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
      {/* Top Header/Toolbar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs text-zinc-500">
        <span className="font-mono tracking-wider uppercase text-emerald-400 font-semibold">Architectural Diagram</span>
        
        {/* Controls Container */}
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-white/[0.03] p-0.5">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors"
              disabled={loading}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[45px] text-center font-mono text-[10px] text-zinc-400 font-semibold select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors"
              disabled={loading}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <div className="mx-1 h-3 w-px bg-white/10" />
            <button
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors"
              disabled={loading}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium transition-all ${
              copied
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "hover:bg-white/10 hover:text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy Source</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render Output Area */}
      <div className="flex justify-center p-6 md:p-8 overflow-auto max-h-[75vh] min-h-[200px] scrollbar-thin">
        {loading ? (
          <div className="flex h-32 w-full flex-col items-center justify-center space-y-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            <span className="text-xs text-zinc-500">Rendering visual diagram...</span>
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="w-full max-w-full text-slate-100 flex justify-center [&>svg]:max-w-full [&>svg]:h-auto shrink-0"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
}
