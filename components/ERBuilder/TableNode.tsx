'use client';

import React from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Database, Key, Link2, Trash2, Plus } from 'lucide-react';
import { Column } from './types';

// Extend React Flow Node with our custom structure
export type CustomNode = Node<{
  name: string;
  columns: Column[];
  onDeleteTable: (id: string) => void;
  onAddColumn: (tableId: string) => void;
  onDeleteColumn: (tableId: string, colIndex: number) => void;
}, 'tableNode'>;

export default function TableNode({ data, id, selected }: NodeProps<CustomNode>) {
  const { name, columns, onDeleteTable, onAddColumn, onDeleteColumn } = data;

  return (
    <div
      className={`
        w-72
        rounded-2xl
        border
        bg-[#0a0a0f]/90
        backdrop-blur-xl
        shadow-2xl
        transition-all
        duration-300
        ${
          selected
            ? 'border-emerald-500/50 shadow-emerald-500/10 scale-[1.02]'
            : 'border-white/[0.08] hover:border-white/[0.15]'
        }
      `}
    >
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Database className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white font-mono uppercase truncate max-w-[150px]">
            {name}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTable(id);
          }}
          className="h-7 w-7 flex items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.01] text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Delete Table"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Columns List */}
      <div className="p-3.5 space-y-2">
        {columns.map((column, index) => {
          const isPK = column.isPK;
          const isFK = column.isFK;

          return (
            <div
              key={index}
              className="group/row relative flex items-center justify-between rounded-lg border border-white/[0.02] bg-white/[0.01] px-3 py-2 hover:bg-white/[0.03] transition-all"
            >
              {/* Left Handle (Target) */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${id}-${column.name}-target`}
                className="!h-2.5 !w-2.5 !border-2 !border-[#0a0a0f] !bg-emerald-500 opacity-60 hover:opacity-100 transition-opacity !left-[-5px]"
              />

              {/* Column Name & Badges */}
              <div className="flex items-center gap-2 z-10">
                {isPK && (
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Primary Key">
                    <Key className="h-2.5 w-2.5 fill-current" />
                  </span>
                )}
                {isFK && (
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" title="Foreign Key">
                    <Link2 className="h-2.5 w-2.5" />
                  </span>
                )}
                <span className="text-[12px] font-semibold text-zinc-200 font-mono tracking-tight group-hover/row:text-white transition-colors">
                  {column.name}
                </span>
              </div>

              {/* Type and Actions */}
              <div className="flex items-center gap-2 z-10 select-none">
                <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase bg-white/[0.02] border border-white/[0.04] px-1.5 py-0.5 rounded">
                  {column.type}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteColumn(id, index);
                  }}
                  className="opacity-0 group-hover/row:opacity-100 h-5 w-5 flex items-center justify-center rounded border border-white/[0.04] bg-white/[0.01] text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Remove Column"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>

              {/* Right Handle (Source) */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${id}-${column.name}-source`}
                className="!h-2.5 !w-2.5 !border-2 !border-[#0a0a0f] !bg-teal-500 opacity-60 hover:opacity-100 transition-opacity !right-[-5px]"
              />
            </div>
          );
        })}

        {/* Empty State */}
        {columns.length === 0 && (
          <div className="text-center py-6 border border-dashed border-white/[0.05] rounded-xl">
            <span className="text-[10px] text-zinc-500 font-mono">No columns defined</span>
          </div>
        )}

        {/* Add Column Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddColumn(id);
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-emerald-500/20 hover:border-emerald-500/40 rounded-xl bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] text-emerald-400 hover:text-emerald-300 text-[10px] font-bold uppercase tracking-wider font-mono transition-all cursor-pointer select-none"
        >
          <Plus className="h-3 w-3" />
          Add Column
        </button>
      </div>
    </div>
  );
}
