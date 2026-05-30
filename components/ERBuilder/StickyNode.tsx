import React, { useState, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Trash2, Edit } from 'lucide-react';

export interface StickyNodeData {
  label: string;
  color?: 'yellow' | 'green' | 'blue' | 'rose';
  onDeleteNode?: (id: string) => void;
  onUpdateNode?: (id: string, updatedData: Partial<StickyNodeData>) => void;
}

const StickyNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as unknown as StickyNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(nodeData.label);

  const getThemeClasses = () => {
    const activeColor = nodeData.color || 'yellow';
    switch (activeColor) {
      case 'green':
        return 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300 shadow-emerald-950/20';
      case 'blue':
        return 'bg-cyan-500/10 border-cyan-500/35 text-cyan-300 shadow-cyan-950/20';
      case 'rose':
        return 'bg-rose-500/10 border-rose-500/35 text-rose-300 shadow-rose-950/20';
      default: // yellow
        return 'bg-amber-500/10 border-amber-500/35 text-amber-300 shadow-amber-950/20';
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (nodeData.onUpdateNode) {
      nodeData.onUpdateNode(id, { label: text });
    }
  };

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl w-48 min-h-[7rem] flex flex-col relative group transition-all ${getThemeClasses()} ${selected ? 'ring-2 ring-cyan-400/30' : ''}`}>
      
      {/* 4 cardinal handles for linking notes to nodes */}
      <Handle type="target" position={Position.Top} id="top-target" className="!bg-zinc-650 !border-zinc-500 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Top} id="top-source" className="!bg-zinc-650 !border-zinc-500 !w-1.5 !h-1.5" />

      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!bg-zinc-650 !border-zinc-500 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!bg-zinc-650 !border-zinc-500 !w-1.5 !h-1.5" />

      <Handle type="target" position={Position.Left} id="left-target" className="!bg-zinc-650 !border-zinc-500 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-zinc-650 !border-zinc-500 !w-1.5 !h-1.5" />

      <Handle type="target" position={Position.Right} id="right-target" className="!bg-zinc-650 !border-zinc-500 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-zinc-650 !border-zinc-500 !w-1.5 !h-1.5" />

      {/* Main Text Content */}
      <div className="flex-1 flex flex-col w-full h-full">
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleSave}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded p-1.5 text-[10px] font-mono focus:outline-none flex-1 min-h-[5rem] text-white resize-none"
            placeholder="Write architecture notes..."
            autoFocus
          />
        ) : (
          <div 
            onDoubleClick={() => setIsEditing(true)}
            className="text-[10px] font-mono leading-relaxed break-words whitespace-pre-wrap cursor-text flex-1 select-text"
            title="Double-click to edit notes"
          >
            {nodeData.label || 'Double-click to write notes...'}
          </div>
        )}
      </div>

      {/* Float overlay panel for settings */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          {/* Color tag switchers */}
          {(['yellow', 'green', 'blue', 'rose'] as const).map((col) => (
            <button
              key={col}
              onClick={() => nodeData.onUpdateNode && nodeData.onUpdateNode(id, { color: col })}
              className={`h-3 w-3 rounded-full border transition-all cursor-pointer ${
                col === 'yellow' ? 'bg-amber-400 border-amber-600/40'
                  : col === 'green' ? 'bg-emerald-400 border-emerald-600/40'
                  : col === 'blue' ? 'bg-cyan-400 border-cyan-600/40'
                  : 'bg-rose-500 border-rose-700/40'
              } ${nodeData.color === col ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
              title={`${col} note`}
            />
          ))}
        </div>

        {/* Delete button */}
        <button
          onClick={() => nodeData.onDeleteNode && nodeData.onDeleteNode(id)}
          className="h-4.5 w-4.5 flex items-center justify-center rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
          title="Delete sticky note"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
};

export default memo(StickyNode);
