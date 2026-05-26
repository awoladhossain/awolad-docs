"use client";

import React, { useEffect, useRef, useState } from "react";

interface MermaidProps {
  chart: string;
}

let mermaidIdCounter = 0;

export default function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
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
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-2 text-xs text-zinc-500">
        <span className="font-mono tracking-wider uppercase text-emerald-400">Architectural Diagram</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(chart);
          }}
          className="rounded px-2 py-1 transition-colors hover:bg-white/10 hover:text-white"
        >
          Copy Source
        </button>
      </div>

      {/* Render Output Area */}
      <div className="flex justify-center p-6 md:p-8 overflow-x-auto">
        {loading ? (
          <div className="flex h-32 w-full flex-col items-center justify-center space-y-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            <span className="text-xs text-zinc-500">Rendering visual diagram...</span>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full max-w-full text-slate-100 flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
}
