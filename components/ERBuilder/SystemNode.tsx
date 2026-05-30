import React, { useState, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Trash2, 
  Settings2,
  Activity,
  Globe,
  Database,
  Cpu,
  Server,
  Layers,
  HardDrive,
  MessageSquare,
  Sparkles,
  Zap,
  Search,
  Package,
  Shuffle,
  Key,
} from 'lucide-react';

export interface SystemNodeData {
  label: string;
  icon: 'aws' | 'gcp' | 'kubernetes' | 'postgres' | 'redis' | 'kafka' | 'server' | 'client' | 'nginx' | 'node' | 'lambda' | 'cdn' | 's3' | 'rabbitmq' | 'elasticsearch' | 'docker' | 'gateway';
  status: 'healthy' | 'warning' | 'degraded' | 'none';
  description?: string;
  color?: 'slate' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose';
  onDeleteNode?: (id: string) => void;
  onUpdateNode?: (id: string, updatedData: Partial<SystemNodeData>) => void;
}

const SystemNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as unknown as SystemNodeData;
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(nodeData.label);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(nodeData.description || '');
  const [showSettings, setShowSettings] = useState(false);

  const getCardThemeClass = () => {
    const activeColor = nodeData.color || 'slate';
    switch (activeColor) {
      case 'emerald':
        return 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 shadow-emerald-500/5 hover:border-emerald-500/50';
      case 'cyan':
        return 'bg-cyan-950/20 border-cyan-500/30 text-cyan-300 shadow-cyan-500/5 hover:border-cyan-500/50';
      case 'purple':
        return 'bg-purple-950/20 border-purple-500/30 text-purple-300 shadow-purple-500/5 hover:border-purple-500/50';
      case 'rose':
        return 'bg-rose-950/20 border-rose-500/30 text-rose-300 shadow-rose-500/5 hover:border-rose-500/50';
      case 'amber':
        return 'bg-amber-950/20 border-amber-500/30 text-amber-300 shadow-amber-500/5 hover:border-amber-500/50';
      default: // slate
        return 'bg-[#0c0c10]/80 border-white/[0.08] text-zinc-300 shadow-black/40 hover:border-white/[0.15]';
    }
  };

  const getStatusColor = () => {
    switch (nodeData.status) {
      case 'healthy': return 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5';
      case 'warning': return 'border-amber-500/40 text-amber-400 bg-amber-500/5';
      case 'degraded': return 'border-rose-500/40 text-rose-400 bg-rose-500/5';
      default: return 'border-white/[0.08] text-zinc-400 bg-white/[0.01]';
    }
  };

  const getStatusIndicator = () => {
    switch (nodeData.status) {
      case 'healthy': return 'bg-emerald-400 animate-pulse';
      case 'warning': return 'bg-amber-400 animate-bounce';
      case 'degraded': return 'bg-rose-500 animate-ping';
      default: return 'bg-zinc-600';
    }
  };

  // Render highly-detailed technical SVG logos
  const renderIcon = () => {
    switch (nodeData.icon) {
      case 'postgres':
        return <Database className="h-6 w-6 text-cyan-400" />;
      case 'redis':
        return <Layers className="h-6 w-6 text-rose-455" />;
      case 'kafka':
        return <MessageSquare className="h-6 w-6 text-purple-400" />;
      case 'kubernetes':
        return <Layers className="h-6 w-6 text-blue-400" />;
      case 'aws':
        return <Layers className="h-6 w-6 text-amber-500" />;
      case 'client':
        return <Globe className="h-6 w-6 text-emerald-400" />;
      case 'nginx':
        return <Cpu className="h-6 w-6 text-emerald-500" />;
      case 'server':
        return <Server className="h-6 w-6 text-sky-400" />;
      case 'lambda':
        return <Zap className="h-6 w-6 text-amber-400 animate-pulse" />;
      case 'cdn':
        return <Globe className="h-6 w-6 text-teal-400 animate-pulse" />;
      case 's3':
        return <HardDrive className="h-6 w-6 text-yellow-500" />;
      case 'rabbitmq':
        return <MessageSquare className="h-6 w-6 text-orange-400 animate-bounce" />;
      case 'elasticsearch':
        return <Search className="h-6 w-6 text-emerald-300" />;
      case 'docker':
        return <Package className="h-6 w-6 text-blue-450" />;
      case 'gateway':
        return <Shuffle className="h-6 w-6 text-indigo-400 animate-pulse" />;
      default:
        return <Server className="h-6 w-6 text-zinc-400" />;
    }
  };

  const handleSaveLabel = () => {
    setIsEditingLabel(false);
    if (nodeData.onUpdateNode && tempLabel.trim()) {
      nodeData.onUpdateNode(id, { label: tempLabel.trim() });
    }
  };

  const handleSaveDesc = () => {
    setIsEditingDesc(false);
    if (nodeData.onUpdateNode) {
      nodeData.onUpdateNode(id, { description: tempDesc.trim() });
    }
  };

  return (
    <div className={`rounded-xl border backdrop-blur-xl p-3.5 transition-all w-56 flex flex-col shadow-2xl relative group z-10 ${getCardThemeClass()} ${selected ? 'border-cyan-400/50 ring-2 ring-cyan-400/20 shadow-cyan-400/5' : ''}`}>
      
      {/* Target & Source Handles in 4 cardinal directions */}
      <Handle type="target" position={Position.Top} id="top-target" className="!bg-cyan-500 !border-cyan-650 !w-2 !h-2" />
      <Handle type="source" position={Position.Top} id="top-source" className="!bg-emerald-500 !border-emerald-650 !w-2 !h-2" />

      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!bg-cyan-500 !border-cyan-650 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!bg-emerald-500 !border-emerald-650 !w-2 !h-2" />

      <Handle type="target" position={Position.Left} id="left-target" className="!bg-cyan-500 !border-cyan-650 !w-2 !h-2" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-emerald-500 !border-emerald-650 !w-2 !h-2" />

      <Handle type="target" position={Position.Right} id="right-target" className="!bg-cyan-500 !border-cyan-650 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-emerald-500 !border-emerald-650 !w-2 !h-2" />

      {/* Card Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
            {renderIcon()}
          </div>
          <div className="flex flex-col min-w-0">
            {isEditingLabel ? (
              <input
                type="text"
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                onBlur={handleSaveLabel}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel()}
                className="bg-white/[0.04] border border-white/[0.1] rounded px-1.5 py-0.5 text-xs text-white font-mono focus:outline-none w-28"
                autoFocus
              />
            ) : (
              <span 
                onDoubleClick={() => setIsEditingLabel(true)}
                className="text-xs font-bold text-zinc-100 font-mono truncate hover:text-white cursor-text"
                title="Double click to edit label"
              >
                {nodeData.label}
              </span>
            )}
            <span className="text-[8px] font-mono tracking-wide text-zinc-500 uppercase">
              {nodeData.icon}
            </span>
          </div>
        </div>

        {/* Pulse Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`h-2 w-2 rounded-full ${getStatusIndicator()}`} />
        </div>
      </div>

      {/* Description / Metadata */}
      <div className="py-2 flex flex-col min-h-[2rem]">
        {isEditingDesc ? (
          <textarea
            value={tempDesc}
            onChange={(e) => setTempDesc(e.target.value)}
            onBlur={handleSaveDesc}
            className="w-full bg-white/[0.04] border border-white/[0.1] rounded p-1 text-[9px] text-zinc-300 font-mono focus:outline-none h-12 resize-none"
            placeholder="Add micro-spec note..."
            autoFocus
          />
        ) : (
          <span 
            onDoubleClick={() => setIsEditingDesc(true)}
            className="text-[9px] font-mono text-zinc-400 leading-normal hover:text-zinc-200 cursor-text min-h-[1.5rem] italic"
            title="Double click to edit specs"
          >
            {nodeData.description || 'Double-click to write specification notes...'}
          </span>
        )}
      </div>

      {/* Footer controls (visible on hover) */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Health selectors */}
            {['healthy', 'warning', 'degraded'].map((st) => (
              <button
                key={st}
                onClick={() => nodeData.onUpdateNode && nodeData.onUpdateNode(id, { status: st as any })}
                className={`h-4 px-1 rounded text-[7px] font-black uppercase font-mono border transition-all cursor-pointer ${
                  nodeData.status === st
                    ? st === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : st === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                {st === 'healthy' ? 'OK' : st === 'warning' ? 'WARN' : 'ERR'}
              </button>
            ))}
          </div>

          {/* Delete Trigger */}
          <button
            onClick={() => nodeData.onDeleteNode && nodeData.onDeleteNode(id)}
            className="h-5 w-5 flex items-center justify-center rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
            title="Delete component node"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        {/* Color customizer bubbles */}
        <div className="flex items-center gap-1.5 justify-start">
          <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest font-mono mr-1">Theme:</span>
          {(['slate', 'emerald', 'cyan', 'purple', 'amber', 'rose'] as const).map((col) => (
            <button
              key={col}
              onClick={() => nodeData.onUpdateNode && nodeData.onUpdateNode(id, { color: col })}
              className={`h-3 w-3 rounded-full border transition-all cursor-pointer ${
                col === 'slate' ? 'bg-zinc-600 border-zinc-500/40'
                  : col === 'emerald' ? 'bg-emerald-400 border-emerald-600/40'
                  : col === 'cyan' ? 'bg-cyan-400 border-cyan-600/40'
                  : col === 'purple' ? 'bg-purple-400 border-purple-600/40'
                  : col === 'amber' ? 'bg-amber-400 border-amber-600/40'
                  : 'bg-rose-500 border-rose-700/40'
              } ${nodeData.color === col || (!nodeData.color && col === 'slate') ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
              title={`${col} theme`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(SystemNode);
