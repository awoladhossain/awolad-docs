"use client";

import React, { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Move } from "lucide-react";

interface MermaidProps {
  chart: string;
}

let mermaidIdCounter = 0;

export default function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.0); // Natural 100% size by default to fit all diagrams
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  const idRef = useRef(`mermaid-${++mermaidIdCounter}`);
  const dragStart = useRef({ x: 0, y: 0 });

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
          // Inject custom styling to ensure text is always slightly smaller than boxes
          themeCSS: `
            g.node rect, g.node circle, g.node polygon, g.node path {
              stroke-width: 1.5px !important;
            }
            /* Style both standard SVG text and HTML foreignObject labels */
            .node text, .label text, .actor text, .messageText, .noteText, .loopText,
            .node .label div, .node .label span, .node .label {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif !important;
              font-size: 13px !important;
              font-weight: 500 !important;
              letter-spacing: -0.01em !important;
              line-height: 1.35 !important;
            }
            .node .label {
              padding: 10px 14px !important;
            }
          `,
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: "basis",
            nodeSpacing: 75, // Deep columns separation
            rankSpacing: 75, // Deep horizontal rows separation
            padding: 26,     // Extra padding around text inside boxes
          },
          sequence: {
            useMaxWidth: false,
            showSequenceNumbers: true,
            boxMargin: 15,
            actorMargin: 75,
            messageMargin: 55,
          },
          gantt: {
            useMaxWidth: false,
          },
          themeVariables: {
            background: "transparent",
            primaryColor: "#059669", // emerald-600
            primaryTextColor: "#f8fafc", // slate-50
            primaryBorderColor: "#10b981", // emerald-500
            lineColor: "#64748b", // slate-500
            secondaryColor: "#0d9488", // teal-600
            tertiaryColor: "#0f172a", // slate-900
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        });

        if (!active) return;

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(idRef.current, chart);

        if (active) {
          // Remove any inline max-width styles that Mermaid might still inject
          const cleanSvg = renderedSvg
            .replace(/max-width:\s*\d+px;/gi, "")
            .replace(/style="[^"]*max-width:\s*100%;[^"]*"/gi, "");
          setSvg(cleanSvg);
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

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.4));
  
  const handleResetZoom = () => {
    setZoom(1.0); // Reset to natural 100% size
    setPan({ x: 0, y: 0 });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mouse Drag Events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left-click drags
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!setIsDragging) return; // Hook guard check
    if (e.buttons !== 1) {
      if (isDragging) setIsDragging(false);
      return;
    }
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Mobile Touch Events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.touches[0].clientX - pan.x,
      y: e.touches[0].clientY - pan.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.current.x,
      y: e.touches[0].clientY - dragStart.current.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
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
    <div className="relative my-8 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#070709]/65 backdrop-blur-md shadow-inner select-none group">
      {/* Top Header/Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="font-mono tracking-wider uppercase text-emerald-400 font-bold select-none">
            Architectural Canvas
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-zinc-500 font-medium bg-white/[0.04] border border-white/[0.05] px-2 py-0.5 rounded-full select-none">
            <Move className="h-2.5 w-2.5 text-emerald-400" />
            Drag to pan / Zoom to inspect
          </span>
        </div>
        
        {/* Controls Container */}
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-0.5">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors"
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
              className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors"
              disabled={loading}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <div className="mx-1 h-3.5 w-px bg-white/10" />
            <button
              onClick={handleResetZoom}
              title="Reset Zoom & Pan"
              className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors"
              disabled={loading}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold transition-all ${
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

      {/* Render Output Area (Interactive Canvas) */}
      <div 
        className="relative flex justify-center items-center p-8 overflow-hidden max-h-[75vh] min-h-[380px] scrollbar-none select-none"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          background: "radial-gradient(circle, rgba(16,185,129,0.01) 0%, transparent 80%)"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          <div className="flex h-32 w-full flex-col items-center justify-center space-y-3 pointer-events-none">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            <span className="text-xs text-zinc-500">Initializing interactive canvas...</span>
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
            }}
            className="w-auto text-slate-100 flex justify-center [&>svg]:max-w-none [&>svg]:w-auto [&>svg]:h-auto shrink-0 select-none pointer-events-none"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
        
        {/* Sleek Touch Instructions for Mobile */}
        {!loading && (
          <div className="absolute bottom-3 left-4 text-[9px] font-mono text-zinc-600 uppercase tracking-widest pointer-events-none select-none opacity-60 group-hover:opacity-90 transition-opacity">
            ⚡ Drag canvas to pan • Zoom with (+/-)
          </div>
        )}
      </div>
    </div>
  );
}
