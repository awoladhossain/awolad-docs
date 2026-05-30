'use client';

import React from 'react';
import { X, Network, Share2, Shuffle } from 'lucide-react';

interface RelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: '1:1' | '1:N' | 'N:M') => void;
  sourceColumn: string;
  targetColumn: string;
}

export default function RelationModal({
  isOpen,
  onClose,
  onSubmit,
  sourceColumn,
  targetColumn,
}: RelationModalProps) {
  if (!isOpen) return null;

  const relationshipTypes = [
    {
      type: '1:1' as const,
      title: 'One to One (1:1)',
      desc: 'Each row in Table A relates to exactly one row in Table B. (e.g. User Profile)',
      icon: Network,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      hoverColor: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
    },
    {
      type: '1:N' as const,
      title: 'One to Many (1:N)',
      desc: 'Each row in Table A relates to multiple rows in Table B. (e.g. Users & Orders)',
      icon: Share2,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
      hoverColor: 'hover:border-cyan-500/50 hover:bg-cyan-500/5',
    },
    {
      type: 'N:M' as const,
      title: 'Many to Many (N:M)',
      desc: 'Multiple rows in Table A relate to multiple rows in Table B. (Requires Junction Table)',
      icon: Shuffle,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
      hoverColor: 'hover:border-purple-500/50 hover:bg-purple-500/5',
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      {/* Modal Card */}
      <div className="w-[450px] rounded-2xl border border-white/[0.08] bg-[#09090c]/90 p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5">
          <div className="flex flex-col">
            <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-emerald-400">Relationship Cardinality</span>
            <span className="text-zinc-500 text-[10px] font-mono mt-0.5 uppercase tracking-widest">
              {sourceColumn} → {targetColumn}
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.01] text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-3.5">
          {relationshipTypes.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                onClick={() => onSubmit(opt.type)}
                className={`w-full flex items-start gap-4 rounded-xl border p-4 bg-gradient-to-r ${opt.color} ${opt.hoverColor} transition-all text-left group cursor-pointer`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] group-hover:scale-105 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold font-mono tracking-tight text-white uppercase">
                    {opt.title}
                  </div>
                  <div className="text-[10px] leading-relaxed text-zinc-400 font-light mt-1 max-w-[320px]">
                    {opt.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Notes */}
        <div className="mt-5 border-t border-white/[0.06] pt-4 flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
          <span>Relational Integrity Engine</span>
          <span>Base DDL Sync Active</span>
        </div>
      </div>
    </div>
  );
}
