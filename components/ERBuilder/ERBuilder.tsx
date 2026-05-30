'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Database,
  Plus,
  Play,
  Trash2,
  Download,
  Upload,
  Search,
  Maximize2,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';
import { Table, Relation, Column } from './types';
import TableNode, { CustomNode } from './TableNode';
import RelationModal from './RelationModal';
import { getLayoutedElements } from './layout';
import { generateSQL } from './sqlGenerator';

// Presets data definitions
const ECOMMERCE_PRESETS: Table[] = [
  {
    id: 'users',
    name: 'users',
    x: 100,
    y: 100,
    columns: [
      { name: 'id', type: 'INT', isPK: true },
      { name: 'email', type: 'VARCHAR(255)', isNullable: false },
      { name: 'password_hash', type: 'VARCHAR(255)', isNullable: false },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },
  {
    id: 'orders',
    name: 'orders',
    x: 450,
    y: 100,
    columns: [
      { name: 'id', type: 'INT', isPK: true },
      { name: 'user_id', type: 'INT', isFK: true },
      { name: 'total_amount', type: 'DECIMAL(10,2)' },
      { name: 'status', type: 'VARCHAR(50)' },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },
  {
    id: 'order_items',
    name: 'order_items',
    x: 800,
    y: 100,
    columns: [
      { name: 'id', type: 'INT', isPK: true },
      { name: 'order_id', type: 'INT', isFK: true },
      { name: 'product_id', type: 'INT', isFK: true },
      { name: 'quantity', type: 'INT' },
      { name: 'price', type: 'DECIMAL(10,2)' },
    ],
  },
  {
    id: 'products',
    name: 'products',
    x: 800,
    y: 400,
    columns: [
      { name: 'id', type: 'INT', isPK: true },
      { name: 'name', type: 'VARCHAR(255)' },
      { name: 'price', type: 'DECIMAL(10,2)' },
      { name: 'stock_quantity', type: 'INT' },
    ],
  },
  {
    id: 'payments',
    name: 'payments',
    x: 450,
    y: 400,
    columns: [
      { name: 'id', type: 'INT', isPK: true },
      { name: 'order_id', type: 'INT', isFK: true },
      { name: 'amount', type: 'DECIMAL(10,2)' },
      { name: 'provider', type: 'VARCHAR(100)' },
      { name: 'status', type: 'VARCHAR(50)' },
    ],
  },
];

const ECOMMERCE_RELATIONS: Relation[] = [
  {
    id: 'rel_users_orders',
    sourceTable: 'orders',
    sourceColumn: 'user_id',
    targetTable: 'users',
    targetColumn: 'id',
    type: '1:N',
  },
  {
    id: 'rel_orders_items',
    sourceTable: 'order_items',
    sourceColumn: 'order_id',
    targetTable: 'orders',
    targetColumn: 'id',
    type: '1:N',
  },
  {
    id: 'rel_products_items',
    sourceTable: 'order_items',
    sourceColumn: 'product_id',
    targetTable: 'products',
    targetColumn: 'id',
    type: '1:N',
  },
  {
    id: 'rel_orders_payments',
    sourceTable: 'payments',
    sourceColumn: 'order_id',
    targetTable: 'orders',
    targetColumn: 'id',
    type: '1:1',
  },
];

const NODE_TYPES = {
  tableNode: TableNode,
};

export default function ERBuilder() {
  const [mounted, setMounted] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);

  // UI inputs state
  const [searchQuery, setSearchQuery] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [copied, setCopied] = useState(false);

  // Column creation modal
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [activeTableForCol, setActiveTableForCol] = useState<string | null>(null);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState('INT');
  const [newColIsPK, setNewColIsPK] = useState(false);
  const [newColIsFK, setNewColIsFK] = useState(false);

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Check hydration mount
  useEffect(() => {
    setMounted(true);
    // Load local storage diagram if exists, otherwise load preset
    const saved = localStorage.getItem('core_kernel_diagram');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTables(parsed.tables || []);
        setRelations(parsed.relations || []);
      } catch (e) {
        // Fallback
        setTables(ECOMMERCE_PRESETS);
        setRelations(ECOMMERCE_RELATIONS);
      }
    } else {
      setTables(ECOMMERCE_PRESETS);
      setRelations(ECOMMERCE_RELATIONS);
    }
  }, []);

  // Save to local storage on schema changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(
      'core_kernel_diagram',
      JSON.stringify({ tables, relations })
    );
  }, [tables, relations, mounted]);

  // Synchronize React Flow nodes with tables state
  useEffect(() => {
    const tableNodes: Node[] = tables.map((table) => ({
      id: table.id,
      type: 'tableNode',
      position: { x: table.x, y: table.y },
      selected: false,
      data: {
        name: table.name,
        columns: table.columns,
        onDeleteTable: (tableId: string) => {
          setTables((prev) => prev.filter((t) => t.id !== tableId));
          setRelations((prev) =>
            prev.filter((r) => r.sourceTable !== tableId && r.targetTable !== tableId)
          );
        },
        onAddColumn: (tableId: string) => {
          setActiveTableForCol(tableId);
          setIsAddingCol(true);
        },
        onDeleteColumn: (tableId: string, colIndex: number) => {
          setTables((prev) =>
            prev.map((t) => {
              if (t.id !== tableId) return t;
              const newCols = [...t.columns];
              newCols.splice(colIndex, 1);
              return { ...t, columns: newCols };
            })
          );
        },
      },
    }));

    setNodes(tableNodes);
  }, [tables, setNodes]);

  // Synchronize React Flow edges with relations state
  useEffect(() => {
    const flowEdges: Edge[] = relations.map((rel) => {
      // Find edge colors based on types
      let strokeColor = '#10b981'; // emerald for 1:N
      if (rel.type === '1:1') strokeColor = '#06b6d4'; // cyan
      if (rel.type === 'N:M') strokeColor = '#8b5cf6'; // purple

      return {
        id: rel.id,
        source: rel.sourceTable,
        target: rel.targetTable,
        sourceHandle: `${rel.sourceTable}-${rel.sourceColumn}-source`,
        targetHandle: `${rel.targetTable}-${rel.targetColumn}-target`,
        animated: true,
        type: 'step',
        label: rel.type,
        labelStyle: { fill: '#ffffff', fontWeight: 700, fontSize: 8, fontClassName: 'font-mono' },
        labelBgPadding: [4, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#0a0a0f', fillOpacity: 0.9, stroke: strokeColor, strokeWidth: 1 },
        style: { stroke: strokeColor, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 12,
          height: 12,
        },
      };
    });

    setEdges(flowEdges);
  }, [relations, setEdges]);

  // Handle manual position changes during dragging
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      changes.forEach((change: any) => {
        if (change.type === 'position' && change.position) {
          setTables((prev) =>
            prev.map((t) =>
              t.id === change.id
                ? { ...t, x: change.position.x, y: change.position.y }
                : t
            )
          );
        }
      });
    },
    [onNodesChange]
  );

  // Trigger relation modal on handle connections
  const onConnect = useCallback((connection: Connection) => {
    setPendingConnection(connection);
  }, []);

  const handleRelationModalSubmit = (type: '1:1' | '1:N' | 'N:M') => {
    if (!pendingConnection) return;
    const { source, target, sourceHandle, targetHandle } = pendingConnection;
    if (!source || !target || !sourceHandle || !targetHandle) return;

    // Parse column names out of handle IDs (e.g. users-email-source -> email)
    const sourceCol = sourceHandle.replace(`${source}-`, '').replace('-source', '');
    const targetCol = targetHandle.replace(`${target}-`, '').replace('-target', '');

    const newRelation: Relation = {
      id: `rel_${source}_${sourceCol}_to_${target}_${targetCol}`,
      sourceTable: source,
      sourceColumn: sourceCol,
      targetTable: target,
      targetColumn: targetCol,
      type,
    };

    // Prevent duplicate relations
    if (!relations.some((r) => r.id === newRelation.id)) {
      setRelations((prev) => [...prev, newRelation]);
    }
    setPendingConnection(null);
  };

  // Add Table action
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    const cleanName = newTableName.trim().toLowerCase().replace(/\s+/g, '_');

    // Prevent duplicate tables
    if (tables.some((t) => t.name === cleanName)) {
      alert('Table already exists!');
      return;
    }

    const newTable: Table = {
      id: cleanName,
      name: cleanName,
      x: 150 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      columns: [
        { name: 'id', type: 'INT', isPK: true },
        { name: 'created_at', type: 'TIMESTAMP' },
      ],
    };

    setTables((prev) => [...prev, newTable]);
    setNewTableName('');
  };

  // Add Column action
  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTableForCol || !newColName.trim()) return;
    const cleanName = newColName.trim().toLowerCase().replace(/\s+/g, '_');

    const newCol: Column = {
      name: cleanName,
      type: newColType,
      isPK: newColIsPK,
      isFK: newColIsFK,
    };

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== activeTableForCol) return t;
        // Avoid duplicate columns
        if (t.columns.some((c) => c.name === cleanName)) {
          alert('Column already exists!');
          return t;
        }
        return { ...t, columns: [...t.columns, newCol] };
      })
    );

    // Reset column state
    setIsAddingCol(false);
    setNewColName('');
    setNewColType('INT');
    setNewColIsPK(false);
    setNewColIsFK(false);
  };

  // Clear/Reset Schema
  const handleResetDiagram = () => {
    if (confirm('Are you sure you want to delete the entire schema? This action is irreversible.')) {
      setTables([]);
      setRelations([]);
      localStorage.removeItem('core_kernel_diagram');
    }
  };

  // Preset Loaders
  const handleLoadPreset = (type: 'ecommerce' | 'billing' | 'cms') => {
    if (confirm('Loading a preset will replace your current working schema. Proceed?')) {
      if (type === 'ecommerce') {
        setTables(ECOMMERCE_PRESETS);
        setRelations(ECOMMERCE_RELATIONS);
      } else if (type === 'billing') {
        setTables([
          {
            id: 'accounts',
            name: 'accounts',
            x: 100,
            y: 100,
            columns: [
              { name: 'id', type: 'INT', isPK: true },
              { name: 'company_name', type: 'VARCHAR(255)' },
              { name: 'billing_email', type: 'VARCHAR(255)' },
            ],
          },
          {
            id: 'subscriptions',
            name: 'subscriptions',
            x: 450,
            y: 100,
            columns: [
              { name: 'id', type: 'INT', isPK: true },
              { name: 'account_id', type: 'INT', isFK: true },
              { name: 'plan_id', type: 'INT', isFK: true },
              { name: 'status', type: 'VARCHAR(50)' },
              { name: 'renews_at', type: 'TIMESTAMP' },
            ],
          },
          {
            id: 'plans',
            name: 'plans',
            x: 800,
            y: 100,
            columns: [
              { name: 'id', type: 'INT', isPK: true },
              { name: 'name', type: 'VARCHAR(100)' },
              { name: 'amount_cents', type: 'INT' },
              { name: 'interval', type: 'VARCHAR(20)' },
            ],
          },
        ]);
        setRelations([
          {
            id: 'rel_accounts_subs',
            sourceTable: 'subscriptions',
            sourceColumn: 'account_id',
            targetTable: 'accounts',
            targetColumn: 'id',
            type: '1:N',
          },
          {
            id: 'rel_plans_subs',
            sourceTable: 'subscriptions',
            sourceColumn: 'plan_id',
            targetTable: 'plans',
            targetColumn: 'id',
            type: '1:N',
          },
        ]);
      } else {
        // CMS preset
        setTables([
          {
            id: 'authors',
            name: 'authors',
            x: 100,
            y: 100,
            columns: [
              { name: 'id', type: 'INT', isPK: true },
              { name: 'username', type: 'VARCHAR(100)' },
            ],
          },
          {
            id: 'posts',
            name: 'posts',
            x: 450,
            y: 100,
            columns: [
              { name: 'id', type: 'INT', isPK: true },
              { name: 'author_id', type: 'INT', isFK: true },
              { name: 'title', type: 'VARCHAR(255)' },
              { name: 'body', type: 'TEXT' },
            ],
          },
          {
            id: 'comments',
            name: 'comments',
            x: 800,
            y: 100,
            columns: [
              { name: 'id', type: 'INT', isPK: true },
              { name: 'post_id', type: 'INT', isFK: true },
              { name: 'content', type: 'TEXT' },
            ],
          },
        ]);
        setRelations([
          {
            id: 'rel_authors_posts',
            sourceTable: 'posts',
            sourceColumn: 'author_id',
            targetTable: 'authors',
            targetColumn: 'id',
            type: '1:N',
          },
          {
            id: 'rel_posts_comments',
            sourceTable: 'comments',
            sourceColumn: 'post_id',
            targetTable: 'posts',
            targetColumn: 'id',
            type: '1:N',
          },
        ]);
      }
      setTimeout(() => triggerAutoLayout(), 100);
    }
  };

  // Trigger Dagre automatic layout
  const triggerAutoLayout = () => {
    const { nodes: lNodes, edges: lEdges } = getLayoutedElements(nodes, edges, 'LR');
    setTables((prev) =>
      prev.map((t) => {
        const found = lNodes.find((n) => n.id === t.id);
        if (found) {
          return { ...t, x: found.position.x, y: found.position.y };
        }
        return t;
      })
    );
  };

  // Compile schema details to raw SQL text
  const compiledSql = useMemo(() => {
    return generateSQL(tables, relations);
  }, [tables, relations]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(compiledSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Table sidebar filtering
  const filteredSidebarTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    return tables.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tables, searchQuery]);

  if (!mounted) return null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-[#09090b] text-white select-none relative z-10 antialiased">
      {/* Background Lighting meshes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-teal-500/5 blur-[100px]" />
      </div>

      {/* 📋 Sidebar Controls Panel */}
      <aside className="w-80 h-full border-r border-white/[0.06] bg-[#0c0c10]/40 backdrop-blur-xl flex flex-col shrink-0 z-10 relative">
        {/* Presets and Global Actions */}
        <div className="p-4 border-b border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Presets & Engine
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleLoadPreset('ecommerce')}
              className="py-1.5 px-2 border border-white/[0.05] bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              Shop
            </button>
            <button
              onClick={() => handleLoadPreset('billing')}
              className="py-1.5 px-2 border border-white/[0.05] bg-white/[0.02] hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-400 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              SaaS
            </button>
            <button
              onClick={() => handleLoadPreset('cms')}
              className="py-1.5 px-2 border border-white/[0.05] bg-white/[0.02] hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-purple-400 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              CMS
            </button>
          </div>
        </div>

        {/* Add Table Field */}
        <div className="p-4 border-b border-white/[0.06]">
          <form onSubmit={handleAddTable} className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400">
                Create New Table
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="e.g. transactions"
                className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs font-mono text-white placeholder-zinc-500 focus:border-emerald-500/30 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-500 text-[#09090b] hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Quick Node Search */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table node..."
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:border-emerald-500/30 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Active Tables List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono mb-2">
            Active Schemas ({tables.length})
          </div>
          {filteredSidebarTables.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2 hover:bg-white/[0.03] transition-all group"
            >
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="truncate max-w-[170px] uppercase font-bold">{t.name}</span>
                <span className="text-[9px] text-zinc-500 font-normal font-sans">({t.columns.length} cols)</span>
              </div>
              <button
                onClick={() => {
                  setTables((prev) => prev.filter((tab) => tab.id !== t.id));
                  setRelations((prev) =>
                    prev.filter((r) => r.sourceTable !== t.id && r.targetTable !== t.id)
                  );
                }}
                className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded border border-white/[0.04] bg-white/[0.01] text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          {filteredSidebarTables.length === 0 && (
            <div className="text-center py-8 text-xs text-zinc-500 font-mono">
              No matching tables found
            </div>
          )}
        </div>

        {/* Action Panel Footer */}
        <div className="p-4 border-t border-white/[0.06] flex gap-2">
          <button
            onClick={triggerAutoLayout}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#09090b] text-emerald-400 text-[10px] font-black uppercase tracking-wider font-mono rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-emerald-500/10"
            title="Auto Layout Tree"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Auto Layout
          </button>
          <button
            onClick={handleResetDiagram}
            className="h-9 w-9 flex items-center justify-center border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500 hover:text-white text-rose-400 rounded-lg transition-all active:scale-95 cursor-pointer"
            title="Delete Schema"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* 🚀 Main Layout Split Arena */}
      <main className="flex-1 h-full flex flex-col min-w-0 z-10 relative">
        {/* Dynamic Canvas Area */}
        <div className="flex-1 w-full h-full relative" data-lenis-prevent="true">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={NODE_TYPES}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
            defaultViewport={{ x: 50, y: 50, zoom: 0.8 }}
          >
            <Background color="#10b981" gap={24} style={{ opacity: 0.08 }} />
            <Controls className="!bg-[#0a0a0f] !border-white/[0.08] !rounded-xl !shadow-2xl overflow-hidden [&_button]:!bg-[#0a0a0f] [&_button]:!border-white/[0.05] [&_button]:!text-zinc-400 [&_button:hover]:!text-white [&_svg]:!fill-current" />
          </ReactFlow>

          {/* Quick instructions floating badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0c0c10]/80 px-4 py-2.5 backdrop-blur-md text-[10px] font-mono text-zinc-400 shadow-xl pointer-events-none select-none">
            <Info className="h-4 w-4 text-emerald-400" />
            <span>Drag teal circles (Source) to emerald circles (Target) to draw relations!</span>
          </div>
        </div>

        {/* 📟 Collapsible Retro SQL Console Terminal */}
        <section className="h-64 border-t border-white/[0.06] bg-[#07070a] flex flex-col">
          {/* Console Header Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.01] px-6 py-2.5">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">
                Real-Time SQL DDL Script
              </span>
            </div>
            
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 rounded border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy Script
                </>
              )}
            </button>
          </div>

          {/* SQL Output Box */}
          <div className="flex-1 p-5 overflow-auto font-mono text-[12px] leading-relaxed text-zinc-300 scrollbar-thin bg-black/40">
            <pre className="select-text whitespace-pre-wrap">{compiledSql}</pre>
          </div>
        </section>
      </main>

      {/* Column creation dialog popover */}
      {isAddingCol && activeTableForCol && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleAddColumnSubmit}
            className="w-96 rounded-2xl border border-white/[0.08] bg-[#09090c]/90 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 space-y-4"
          >
            <div className="border-b border-white/[0.06] pb-3 mb-2 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Create Column</span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  Target: {activeTableForCol}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingCol(false)}
                className="text-zinc-500 hover:text-white text-xs font-mono font-bold border border-white/[0.04] bg-white/[0.01] px-2 py-0.5 rounded cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Column Name
              </label>
              <input
                type="text"
                required
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="e.g. quantity"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:border-emerald-500/30 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* Datatype Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Data Type
              </label>
              <select
                value={newColType}
                onChange={(e) => setNewColType(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs font-mono text-white bg-[#09090c] focus:border-emerald-500/30 focus:outline-none transition-colors [&_option]:bg-[#09090c]"
              >
                <option value="INT">INT</option>
                <option value="BIGINT">BIGINT</option>
                <option value="VARCHAR(255)">VARCHAR(255)</option>
                <option value="TEXT">TEXT</option>
                <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                <option value="TIMESTAMP">TIMESTAMP</option>
                <option value="BOOLEAN">BOOLEAN</option>
              </select>
            </div>

            {/* Key checkboxes */}
            <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/[0.04]">
              <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={newColIsPK}
                  onChange={(e) => {
                    setNewColIsPK(e.target.checked);
                    if (e.target.checked) setNewColIsFK(false);
                  }}
                  className="rounded border-white/[0.1] bg-white/[0.02] text-emerald-500 focus:ring-0 cursor-pointer h-4 w-4"
                />
                Primary Key (PK)
              </label>
              <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={newColIsFK}
                  onChange={(e) => {
                    setNewColIsFK(e.target.checked);
                    if (e.target.checked) setNewColIsPK(false);
                  }}
                  className="rounded border-white/[0.1] bg-white/[0.02] text-cyan-500 focus:ring-0 cursor-pointer h-4 w-4"
                />
                Foreign Key (FK)
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2 px-3 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#09090b] text-emerald-400 text-xs font-black uppercase tracking-wider font-mono rounded-lg transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/10"
            >
              Add Column to Table
            </button>
          </form>
        </div>
      )}

      {/* Edge relations type dialog modal popup */}
      <RelationModal
        isOpen={pendingConnection !== null}
        onClose={() => setPendingConnection(null)}
        onSubmit={handleRelationModalSubmit}
        sourceColumn={
          pendingConnection?.sourceHandle
            ? pendingConnection.sourceHandle.replace(`${pendingConnection.source}-`, '').replace('-source', '')
            : ''
        }
        targetColumn={
          pendingConnection?.targetHandle
            ? pendingConnection.targetHandle.replace(`${pendingConnection.target}-`, '').replace('-target', '')
            : ''
        }
      />
    </div>
  );
}
