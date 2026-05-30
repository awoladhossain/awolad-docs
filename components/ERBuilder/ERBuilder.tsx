'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Database,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Info,
  Download,
  Upload,
  Settings,
  HelpCircle,
  Import,
  Maximize2,
  ChevronDown,
  FolderOpen,
} from 'lucide-react';
import { Table, Relation, Column } from './types';
import TableNode from './TableNode';
import RelationModal from './RelationModal';
import { getLayoutedElements } from './layout';
import { generateSQL } from './sqlGenerator';

// A comprehensive standard database datatypes catalog
const DATA_TYPES = [
  // Numeric
  { group: 'Numeric', value: 'INT', label: 'INT (Integer)' },
  { group: 'Numeric', value: 'BIGINT', label: 'BIGINT (Large Integer)' },
  { group: 'Numeric', value: 'SERIAL', label: 'SERIAL (Auto-Incrementing)' },
  { group: 'Numeric', value: 'DECIMAL(10,2)', label: 'DECIMAL (Fixed decimal)' },
  { group: 'Numeric', value: 'NUMERIC', label: 'NUMERIC (Arbitrary precision)' },
  { group: 'Numeric', value: 'REAL', label: 'REAL (Single precision float)' },
  { group: 'Numeric', value: 'DOUBLE PRECISION', label: 'DOUBLE PRECISION' },
  // String / Characters
  { group: 'String', value: 'VARCHAR(255)', label: 'VARCHAR(255)' },
  { group: 'String', value: 'VARCHAR(100)', label: 'VARCHAR(100)' },
  { group: 'String', value: 'VARCHAR(50)', label: 'VARCHAR(50)' },
  { group: 'String', value: 'TEXT', label: 'TEXT (Unbounded text)' },
  { group: 'String', value: 'CHAR(36)', label: 'CHAR(36) (Fixed char)' },
  { group: 'String', value: 'UUID', label: 'UUID (Universally Unique ID)' },
  // Temporal
  { group: 'Temporal', value: 'TIMESTAMP', label: 'TIMESTAMP (Date + Time)' },
  { group: 'Temporal', value: 'DATE', label: 'DATE' },
  { group: 'Temporal', value: 'TIME', label: 'TIME' },
  { group: 'Temporal', value: 'INTERVAL', label: 'INTERVAL' },
  // Advanced / Binary
  { group: 'Advanced', value: 'BOOLEAN', label: 'BOOLEAN' },
  { group: 'Advanced', value: 'JSON', label: 'JSON' },
  { group: 'Advanced', value: 'JSONB', label: 'JSONB (Binary JSON)' },
  { group: 'Advanced', value: 'BYTEA', label: 'BYTEA (Binary byte data)' },
];

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

// Robust SQL DDL Schema Parser for Reverse Engineering
const parseSQL = (sqlText: string): { tables: Table[]; relations: Relation[] } => {
  const tables: Table[] = [];
  const relations: Relation[] = [];

  // Remove comments (lines starting with -- or within /* */)
  let cleanSql = sqlText.replace(/--.*$/gm, '');
  cleanSql = cleanSql.replace(/\/\*[\s\S]*?\*\//g, '');

  // Split by statements (semicolon)
  const statements = cleanSql.split(';');

  statements.forEach((stmt) => {
    const trimmed = stmt.trim();
    if (!trimmed) return;

    // 1. CREATE TABLE parser
    const createTableMatch = trimmed.match(/create\s+table\s+(\w+)\s*\(([\s\S]+)\)/i);
    if (createTableMatch) {
      const tableName = createTableMatch[1].trim().toLowerCase();
      const body = createTableMatch[2];

      const columns: Column[] = [];
      // Split body by commas, keeping nested parenthesis intact (e.g. DECIMAL(10,2))
      const colMatches: string[] = [];
      let depth = 0;
      let current = '';

      for (let i = 0; i < body.length; i++) {
        const char = body[i];
        if (char === '(') depth++;
        if (char === ')') depth--;

        if (char === ',' && depth === 0) {
          colMatches.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      if (current.trim()) {
        colMatches.push(current.trim());
      }

      colMatches.forEach((line) => {
        const cleanLine = line.trim().replace(/\s+/g, ' ');
        if (!cleanLine) return;

        // Skip constraint lines (e.g. CONSTRAINT pk_name PRIMARY KEY (...))
        if (
          cleanLine.toUpperCase().startsWith('CONSTRAINT') ||
          cleanLine.toUpperCase().startsWith('PRIMARY KEY') ||
          cleanLine.toUpperCase().startsWith('FOREIGN KEY')
        ) {
          // If inline table PRIMARY KEY constraint is defined
          if (cleanLine.toUpperCase().startsWith('PRIMARY KEY') || (cleanLine.toUpperCase().startsWith('CONSTRAINT') && cleanLine.toUpperCase().includes('PRIMARY KEY'))) {
            // Try to extract primary key columns
            const pkMatch = cleanLine.match(/primary\s+key\s*\(([^)]+)\)/i);
            if (pkMatch) {
              const pkColsList = pkMatch[1].split(',').map((c) => c.trim().toLowerCase());
              pkColsList.forEach((colName) => {
                const existingCol = columns.find((c) => c.name === colName);
                if (existingCol) existingCol.isPK = true;
              });
            }
          }
          return;
        }

        const parts = cleanLine.split(' ');
        if (parts.length < 2) return;

        const colName = parts[0].toLowerCase();
        let colType = parts[1].toUpperCase();

        // Handle types with parameters like VARCHAR(255), DECIMAL(10,2)
        const typeParamsMatch = cleanLine.match(new RegExp(`${parts[0]}\\s+([\\w\\(\\),\\s]+)`, 'i'));
        if (typeParamsMatch) {
          const rawType = typeParamsMatch[1].trim();
          // Extract just the datatype e.g. VARCHAR(255)
          const mainTypeMatch = rawType.match(/^(\w+(?:\([^)]+\))?)/);
          if (mainTypeMatch) {
            colType = mainTypeMatch[1].toUpperCase();
          }
        }

        const upperLine = cleanLine.toUpperCase();
        const isPK = upperLine.includes('PRIMARY KEY');
        const isNullable = !upperLine.includes('NOT NULL');

        columns.push({
          name: colName,
          type: colType,
          isPK,
          isNullable,
          isFK: false,
        });
      });

      tables.push({
        id: tableName,
        name: tableName,
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 300,
        columns,
      });
    }

    // 2. ALTER TABLE ADD FOREIGN KEY parser
    const alterMatch = trimmed.match(/alter\s+table\s+(\w+)\s+add\s+(?:constraint\s+\w+\s+)?foreign\s+key\s*\((\w+)\)\s*references\s*(\w+)\s*\((\w+)\)/i);
    if (alterMatch) {
      const sourceTable = alterMatch[1].trim().toLowerCase();
      const sourceCol = alterMatch[2].trim().toLowerCase();
      const targetTable = alterMatch[3].trim().toLowerCase();
      const targetCol = alterMatch[4].trim().toLowerCase();

      relations.push({
        id: `rel_${sourceTable}_${sourceCol}_to_${targetTable}_${targetCol}`,
        sourceTable,
        sourceColumn: sourceCol,
        targetTable,
        targetColumn: targetCol,
        type: '1:N',
      });
    }
  });

  // Automatically mark source columns as FK
  relations.forEach((rel) => {
    const table = tables.find((t) => t.id === rel.sourceTable);
    if (table) {
      const col = table.columns.find((c) => c.name === rel.sourceColumn);
      if (col) col.isFK = true;
    }
  });

  return { tables, relations };
};

interface Project {
  id: string;
  name: string;
  createdAt: string;
  nodes: Node[];
  edges: Edge[];
}

const NODE_TYPES = {
  tableNode: TableNode,
};

function ERBuilderContent() {
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fitView } = useReactFlow();

  // UI inputs state
  const [searchQuery, setSearchQuery] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [copied, setCopied] = useState(false);

  // Column creation modal state
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [activeTableForCol, setActiveTableForCol] = useState<string | null>(null);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState('INT');
  const [newColIsPK, setNewColIsPK] = useState(false);
  const [newColIsFK, setNewColIsFK] = useState(false);
  const [newColIsNullable, setNewColIsNullable] = useState(false);

  // Column editing modal state
  const [isEditingCol, setIsEditingCol] = useState(false);
  const [activeTableForEditCol, setActiveTableForEditCol] = useState<string | null>(null);
  const [activeColIndexForEdit, setActiveColIndexForEdit] = useState<number | null>(null);
  const [editColName, setEditColName] = useState('');
  const [editColType, setEditColType] = useState('INT');
  const [editColIsPK, setEditColIsPK] = useState(false);
  const [editColIsFK, setEditColIsFK] = useState(false);
  const [editColIsNullable, setEditColIsNullable] = useState(false);

  // Reverse Engineering SQL Modal state
  const [isReversingSQL, setIsReversingSQL] = useState(false);
  const [pastedSQL, setPastedSQL] = useState('');

  // React Flow states (single source of truth)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Create Table Node utility (fully self-contained, binds state modifiers perfectly)
  const createTableNode = useCallback((
    id: string, 
    name: string, 
    x: number, 
    y: number, 
    columns: Column[],
    color: 'slate' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose' = 'slate'
  ): Node => {
    return {
      id,
      type: 'tableNode',
      position: { x, y },
      data: {
        name,
        columns,
        color,
        onDeleteTable: (tableId: string) => {
          setNodes((nds) => nds.filter((n) => n.id !== tableId));
          setEdges((eds) => eds.filter((e) => e.source !== tableId && e.target !== tableId));
        },
        onAddColumn: (tableId: string) => {
          setActiveTableForCol(tableId);
          setIsAddingCol(true);
        },
        onEditColumn: (tableId: string, colIndex: number) => {
          setActiveTableForEditCol(tableId);
          setActiveColIndexForEdit(colIndex);
          setNodes((nds) => {
            const node = nds.find((n) => n.id === tableId);
            if (node) {
              const col = (node.data.columns as Column[])[colIndex];
              if (col) {
                setEditColName(col.name);
                setEditColType(col.type);
                setEditColIsPK(!!col.isPK);
                setEditColIsFK(!!col.isFK);
                setEditColIsNullable(!!col.isNullable);
              }
            }
            return nds;
          });
          setIsEditingCol(true);
        },
        onDeleteColumn: (tableId: string, colIndex: number) => {
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id !== tableId) return n;
              const newCols = [...(n.data.columns as Column[])];
              newCols.splice(colIndex, 1);
              return {
                ...n,
                data: { ...n.data, columns: newCols },
              };
            })
          );
        },
        onChangeColor: (tableId: string, newColor: 'slate' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose') => {
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id !== tableId) return n;
              return {
                ...n,
                data: { ...n.data, color: newColor },
              };
            })
          );
        },
      },
    };
  }, [setNodes, setEdges]);

  // Multi-Project Management States
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');

  const handleSwitchProject = useCallback((projectId: string) => {
    localStorage.setItem('er_arena_active_project_id_v1', projectId);
    setActiveProjectId(projectId);
    
    setProjects((prev) => {
      const proj = prev.find((p) => p.id === projectId);
      if (proj) {
        // Re-inject callbacks into imported nodes
        const formattedNodes = proj.nodes.map((node: any) => ({
          ...node,
          data: {
            ...node.data,
            onDeleteTable: (tableId: string) => {
              setNodes((nds) => nds.filter((n) => n.id !== tableId));
              setEdges((eds) => eds.filter((e) => e.source !== tableId && e.target !== tableId));
            },
            onAddColumn: (tableId: string) => {
              setActiveTableForCol(tableId);
              setIsAddingCol(true);
            },
            onEditColumn: (tableId: string, colIndex: number) => {
              setActiveTableForEditCol(tableId);
              setActiveColIndexForEdit(colIndex);
              setNodes((nds) => {
                const n = nds.find((item) => item.id === tableId);
                if (n) {
                  const col = (n.data.columns as Column[])[colIndex];
                  if (col) {
                    setEditColName(col.name);
                    setEditColType(col.type);
                    setEditColIsPK(!!col.isPK);
                    setEditColIsFK(!!col.isFK);
                    setEditColIsNullable(!!col.isNullable);
                  }
                }
                return nds;
              });
              setIsEditingCol(true);
            },
            onDeleteColumn: (tableId: string, colIndex: number) => {
              setNodes((nds) =>
                nds.map((n) => {
                  if (n.id !== tableId) return n;
                  const newCols = [...(n.data.columns as Column[])];
                  newCols.splice(colIndex, 1);
                  return {
                    ...n,
                    data: { ...n.data, columns: newCols },
                  };
                })
              );
            },
            onChangeColor: (tableId: string, newColor: 'slate' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose') => {
              setNodes((nds) =>
                nds.map((n) => {
                  if (n.id !== tableId) return n;
                  return {
                    ...n,
                    data: { ...n.data, color: newColor },
                  };
                })
              );
            },
          },
        }));
        setNodes(formattedNodes);
        setEdges(proj.edges);
        
        setTimeout(() => {
          fitView({ duration: 600 });
        }, 100);
      }
      return prev;
    });
  }, [setNodes, setEdges, fitView]);

  const handleCreateProject = useCallback((name: string) => {
    const id = name.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    const newProj: Project = {
      id,
      name,
      createdAt: new Date().toISOString(),
      nodes: [
        createTableNode('users', 'users', 100, 100, [
          { name: 'id', type: 'INT', isPK: true },
          { name: 'username', type: 'VARCHAR(100)' },
        ], 'slate')
      ],
      edges: [],
    };
    
    setProjects((prev) => {
      const updated = [...prev, newProj];
      localStorage.setItem('er_arena_projects_v1', JSON.stringify(updated));
      return updated;
    });
    
    setTimeout(() => {
      handleSwitchProject(id);
    }, 50);
  }, [createTableNode, handleSwitchProject]);

  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects((prev) => {
      if (prev.length <= 1) return prev;
      if (confirm('Are you sure you want to delete this entire project folder? All ER diagram tables inside it will be lost.')) {
        const remaining = prev.filter(p => p.id !== projectId);
        localStorage.setItem('er_arena_projects_v1', JSON.stringify(remaining));
        
        const nextActiveId = remaining[0].id;
        localStorage.setItem('er_arena_active_project_id_v1', nextActiveId);
        
        // Trigger switch
        setTimeout(() => {
          handleSwitchProject(nextActiveId);
        }, 50);
        
        return remaining;
      }
      return prev;
    });
  }, [handleSwitchProject]);

  // Custom Combobox select states
  const [isOpenAddColType, setIsOpenAddColType] = useState(false);
  const [isOpenEditColType, setIsOpenEditColType] = useState(false);
  const [isOpenProjectSelector, setIsOpenProjectSelector] = useState(false);

  // Load from local storage or presets on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('er_arena_projects_v1');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Project[];
        if (parsed.length > 0) {
          setProjects(parsed);
          const lastActiveId = localStorage.getItem('er_arena_active_project_id_v1') || parsed[0].id;
          setActiveProjectId(lastActiveId);
          
          const activeProj = parsed.find(p => p.id === lastActiveId) || parsed[0];
          
          const formattedNodes = activeProj.nodes.map((node: any) => ({
            ...node,
            data: {
              ...node.data,
              onDeleteTable: (tableId: string) => {
                setNodes((nds) => nds.filter((n) => n.id !== tableId));
                setEdges((eds) => eds.filter((e) => e.source !== tableId && e.target !== tableId));
              },
              onAddColumn: (tableId: string) => {
                setActiveTableForCol(tableId);
                setIsAddingCol(true);
              },
              onEditColumn: (tableId: string, colIndex: number) => {
                setActiveTableForEditCol(tableId);
                setActiveColIndexForEdit(colIndex);
                setNodes((nds) => {
                  const n = nds.find((item) => item.id === tableId);
                  if (n) {
                    const col = (n.data.columns as Column[])[colIndex];
                    if (col) {
                      setEditColName(col.name);
                      setEditColType(col.type);
                      setEditColIsPK(!!col.isPK);
                      setEditColIsFK(!!col.isFK);
                      setEditColIsNullable(!!col.isNullable);
                    }
                  }
                  return nds;
                });
                setIsEditingCol(true);
              },
              onDeleteColumn: (tableId: string, colIndex: number) => {
                setNodes((nds) =>
                  nds.map((n) => {
                    if (n.id !== tableId) return n;
                    const newCols = [...(n.data.columns as Column[])];
                    newCols.splice(colIndex, 1);
                    return {
                      ...n,
                      data: { ...n.data, columns: newCols },
                    };
                  })
                );
              },
              onChangeColor: (tableId: string, newColor: 'slate' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose') => {
                setNodes((nds) =>
                  nds.map((n) => {
                    if (n.id !== tableId) return n;
                    return {
                      ...n,
                      data: { ...n.data, color: newColor },
                    };
                  })
                );
              },
            },
          }));
          setNodes(formattedNodes);
          setEdges(activeProj.edges);
          return;
        }
      } catch (e) {
        // Fail silently
      }
    }

    // Default Initialization
    const defaultProjList: Project[] = [
      {
        id: 'ecommerce_store',
        name: 'E-Commerce Store',
        createdAt: new Date().toISOString(),
        nodes: ECOMMERCE_PRESETS.map((t) => createTableNode(t.id, t.name, t.x, t.y, t.columns, 'slate')),
        edges: ECOMMERCE_RELATIONS.map((rel) => {
          let strokeColor = '#10b981';
          if (rel.type === '1:1') strokeColor = '#06b6d4';
          if (rel.type === 'N:M') strokeColor = '#8b5cf6';

          return {
            id: rel.id,
            source: rel.sourceTable,
            target: rel.targetTable,
            sourceHandle: `${rel.sourceTable}-${rel.sourceColumn}-source`,
            targetHandle: `${rel.targetTable}-${rel.targetColumn}-target`,
            animated: true,
            type: 'step',
            label: rel.type,
            labelStyle: { fill: '#ffffff', fontWeight: 700, fontSize: 8, fontFamily: 'monospace' },
            labelBgPadding: [4, 4] as [number, number],
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
        }),
      },
      {
        id: 'saas_billing',
        name: 'SaaS Billing System',
        createdAt: new Date().toISOString(),
        nodes: [
          createTableNode('accounts', 'accounts', 100, 100, [
            { name: 'id', type: 'INT', isPK: true },
            { name: 'company_name', type: 'VARCHAR(255)' },
            { name: 'billing_email', type: 'VARCHAR(255)' },
          ], 'cyan'),
          createTableNode('subscriptions', 'subscriptions', 450, 100, [
            { name: 'id', type: 'INT', isPK: true },
            { name: 'account_id', type: 'INT', isFK: true },
            { name: 'plan_id', type: 'INT', isFK: true },
            { name: 'status', type: 'VARCHAR(50)' },
            { name: 'renews_at', type: 'TIMESTAMP' },
          ], 'cyan'),
          createTableNode('plans', 'plans', 800, 100, [
            { name: 'id', type: 'INT', isPK: true },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'amount_cents', type: 'INT' },
            { name: 'interval', type: 'VARCHAR(20)' },
          ], 'cyan'),
        ],
        edges: [
          {
            id: 'rel_accounts_subs',
            source: 'subscriptions',
            target: 'accounts',
            sourceHandle: 'subscriptions-account_id-source',
            targetHandle: 'accounts-id-target',
            animated: true,
            type: 'step',
            label: '1:N',
            labelStyle: { fill: '#ffffff', fontWeight: 700, fontSize: 8, fontFamily: 'monospace' },
            labelBgPadding: [4, 4],
            labelBgBorderRadius: 4,
            labelBgStyle: { fill: '#0a0a0f', fillOpacity: 0.9, stroke: '#10b981', strokeWidth: 1 },
            style: { stroke: '#10b981', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10b981',
              width: 12,
              height: 12,
            },
          },
          {
            id: 'rel_plans_subs',
            source: 'subscriptions',
            target: 'plans',
            sourceHandle: 'subscriptions-plan_id-source',
            targetHandle: 'plans-id-target',
            animated: true,
            type: 'step',
            label: '1:N',
            labelStyle: { fill: '#ffffff', fontWeight: 700, fontSize: 8, fontFamily: 'monospace' },
            labelBgPadding: [4, 4],
            labelBgBorderRadius: 4,
            labelBgStyle: { fill: '#0a0a0f', fillOpacity: 0.9, stroke: '#10b981', strokeWidth: 1 },
            style: { stroke: '#10b981', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10b981',
              width: 12,
              height: 12,
            },
          },
        ],
      }
    ];

    setProjects(defaultProjList);
    setActiveProjectId('ecommerce_store');
    setNodes(defaultProjList[0].nodes);
    setEdges(defaultProjList[0].edges);
  }, [createTableNode, setNodes, setEdges]);

  // Auto-save active schema back to project list & localStorage
  useEffect(() => {
    if (!mounted || !activeProjectId) return;
    
    setProjects((prev) => {
      const currentProj = prev.find(p => p.id === activeProjectId);
      if (currentProj && (currentProj.nodes !== nodes || currentProj.edges !== edges)) {
        const updated = prev.map((p) => {
          if (p.id === activeProjectId) {
            return {
              ...p,
              nodes,
              edges,
            };
          }
          return p;
        });
        localStorage.setItem('er_arena_projects_v1', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, [nodes, edges, activeProjectId, mounted]);

  // Derive Table metadata dynamically for SQL generation
  const tables = useMemo<Table[]>(() => {
    return nodes.map((node) => ({
      id: node.id,
      name: node.data.name as string,
      x: node.position.x,
      y: node.position.y,
      columns: (node.data.columns as Column[]) || [],
    }));
  }, [nodes]);

  // Derive Relation metadata dynamically for SQL generation
  const relations = useMemo<Relation[]>(() => {
    return edges.map((edge) => {
      const sourceCol = edge.sourceHandle
        ? edge.sourceHandle.replace(`${edge.source}-`, '').replace('-source', '')
        : '';
      const targetCol = edge.targetHandle
        ? edge.targetHandle.replace(`${edge.target}-`, '').replace('-target', '')
        : '';

      return {
        id: edge.id,
        sourceTable: edge.source,
        sourceColumn: sourceCol,
        targetTable: edge.target,
        targetColumn: targetCol,
        type: (edge.label as '1:1' | '1:N' | 'N:M') || '1:N',
      };
    });
  }, [edges]);

  // Handle connection events
  const onConnect = useCallback((connection: Connection) => {
    setPendingConnection(connection);
  }, []);

  // Double Click Edge to Delete
  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (confirm(`Do you want to delete the relationship between ${edge.source} and ${edge.target}?`)) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
  }, [setEdges]);

  const handleRelationModalSubmit = (type: '1:1' | '1:N' | 'N:M') => {
    if (!pendingConnection) return;
    const { source, target, sourceHandle, targetHandle } = pendingConnection;
    if (!source || !target || !sourceHandle || !targetHandle) return;

    let strokeColor = '#10b981';
    if (type === '1:1') strokeColor = '#06b6d4';
    if (type === 'N:M') strokeColor = '#8b5cf6';

    const newEdge: Edge = {
      id: `rel_${source}_${sourceHandle}_to_${target}_${targetHandle}`,
      source,
      target,
      sourceHandle,
      targetHandle,
      animated: true,
      type: 'step',
      label: type,
      labelStyle: { fill: '#ffffff', fontWeight: 700, fontSize: 8, fontFamily: 'monospace' },
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

    setEdges((eds) => addEdge(newEdge, eds));
    setPendingConnection(null);
  };

  // Add Table action
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    const cleanName = newTableName.trim().toLowerCase().replace(/\s+/g, '_');

    if (nodes.some((n) => n.id === cleanName)) {
      alert('Table already exists!');
      return;
    }

    const newNode = createTableNode(
      cleanName,
      cleanName,
      150 + Math.random() * 200,
      150 + Math.random() * 200,
      [
        { name: 'id', type: 'INT', isPK: true },
        { name: 'created_at', type: 'TIMESTAMP' },
      ]
    );

    setNodes((nds) => [...nds, newNode]);
    setNewTableName('');
  };

  // Add Column Form Submit Action
  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTableForCol || !newColName.trim()) return;
    const cleanName = newColName.trim().toLowerCase().replace(/\s+/g, '_');

    const newCol: Column = {
      name: cleanName,
      type: newColType,
      isPK: newColIsPK,
      isFK: newColIsFK,
      isNullable: newColIsNullable,
    };

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== activeTableForCol) return node;
        const cols = (node.data.columns as Column[]) || [];
        if (cols.some((c) => c.name === cleanName)) {
          alert('Column already exists!');
          return node;
        }
        return {
          ...node,
          data: {
            ...node.data,
            columns: [...cols, newCol],
          },
        };
      })
    );

    setIsAddingCol(false);
    setNewColName('');
    setNewColType('INT');
    setNewColIsPK(false);
    setNewColIsFK(false);
    setNewColIsNullable(false);
    setIsOpenAddColType(false);
  };

  // Edit Column Form Submit Action
  const handleEditColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTableForEditCol || activeColIndexForEdit === null || !editColName.trim()) return;
    const cleanName = editColName.trim().toLowerCase().replace(/\s+/g, '_');

    const updatedCol: Column = {
      name: cleanName,
      type: editColType,
      isPK: editColIsPK,
      isFK: editColIsFK,
      isNullable: editColIsNullable,
    };

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== activeTableForEditCol) return node;
        const newCols = [...(node.data.columns as Column[])];
        newCols[activeColIndexForEdit] = updatedCol;
        return {
          ...node,
          data: { ...node.data, columns: newCols },
        };
      })
    );

    setIsEditingCol(false);
    setActiveTableForEditCol(null);
    setActiveColIndexForEdit(null);
    setIsOpenEditColType(false);
  };

  // Focus and Zoom onto a specific table node from Sidebar List
  const handleFocusTableNode = (tableId: string) => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === tableId,
      }))
    );
    setTimeout(() => {
      fitView({ nodes: [{ id: tableId }], duration: 800, maxZoom: 1.1 });
    }, 50);
  };

  // Reverse Engineering past DDL SQL Form Handler
  const handleReverseSQLSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedSQL.trim()) return;

    try {
      const { tables: parsedTables, relations: parsedRelations } = parseSQL(pastedSQL);
      if (parsedTables.length === 0) {
        alert('Failed to parse schema. No CREATE TABLE statements found.');
        return;
      }

      const parsedNodes = parsedTables.map((t) => createTableNode(t.id, t.name, t.x, t.y, t.columns, 'slate'));
      const parsedEdges = parsedRelations.map((rel) => {
        let strokeColor = '#10b981';
        if (rel.type === '1:1') strokeColor = '#06b6d4';
        if (rel.type === 'N:M') strokeColor = '#8b5cf6';

        return {
          id: rel.id,
          source: rel.sourceTable,
          target: rel.targetTable,
          sourceHandle: `${rel.sourceTable}-${rel.sourceColumn}-source`,
          targetHandle: `${rel.targetTable}-${rel.targetColumn}-target`,
          animated: true,
          type: 'step',
          label: rel.type,
          labelStyle: { fill: '#ffffff', fontWeight: 700, fontSize: 8, fontFamily: 'monospace' },
          labelBgPadding: [4, 4] as [number, number],
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

      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setIsReversingSQL(false);
      setPastedSQL('');

      // Auto layout and center view
      setTimeout(() => {
        const { nodes: lNodes } = getLayoutedElements(parsedNodes, parsedEdges, 'LR');
        setNodes(lNodes);
        
        setTimeout(() => {
          fitView({ duration: 900 });
        }, 150);
      }, 100);

      alert(`Successfully reverse engineered ${parsedTables.length} tables and ${parsedRelations.length} relationships!`);
    } catch (err) {
      alert('Reverse engineering failed. Please check your SQL syntax.');
    }
  };

  // Clear/Reset entire Schema
  const handleResetDiagram = () => {
    if (confirm('Are you sure you want to delete the entire schema? This action is irreversible.')) {
      setNodes([]);
      setEdges([]);
      localStorage.removeItem('core_kernel_diagram_v5');
    }
  };

  // Backup System: Export to JSON File
  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `er-diagram-schema-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Backup System: Import from JSON File
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          // Re-inject callbacks into imported nodes
          const formattedNodes = parsed.nodes.map((node: any) => ({
            ...node,
            data: {
              ...node.data,
              onDeleteTable: (tableId: string) => {
                setNodes((nds) => nds.filter((n) => n.id !== tableId));
                setEdges((eds) => eds.filter((e) => e.source !== tableId && e.target !== tableId));
              },
              onAddColumn: (tableId: string) => {
                setActiveTableForCol(tableId);
                setIsAddingCol(true);
              },
              onEditColumn: (tableId: string, colIndex: number) => {
                setActiveTableForEditCol(tableId);
                setActiveColIndexForEdit(colIndex);
                setNodes((nds) => {
                  const n = nds.find((item) => item.id === tableId);
                  if (n) {
                    const col = (n.data.columns as Column[])[colIndex];
                    if (col) {
                      setEditColName(col.name);
                      setEditColType(col.type);
                      setEditColIsPK(!!col.isPK);
                      setEditColIsFK(!!col.isFK);
                      setEditColIsNullable(!!col.isNullable);
                    }
                  }
                  return nds;
                });
                setIsEditingCol(true);
              },
              onDeleteColumn: (tableId: string, colIndex: number) => {
                setNodes((nds) =>
                  nds.map((n) => {
                    if (n.id !== tableId) return n;
                    const newCols = [...(n.data.columns as Column[])];
                    newCols.splice(colIndex, 1);
                    return {
                      ...n,
                      data: { ...n.data, columns: newCols },
                    };
                  })
                );
              },
              onChangeColor: (tableId: string, newColor: 'slate' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose') => {
                setNodes((nds) =>
                  nds.map((n) => {
                    if (n.id !== tableId) return n;
                    return {
                      ...n,
                      data: { ...n.data, color: newColor },
                    };
                  })
                );
              },
            },
          }));
          setNodes(formattedNodes);
          setEdges(parsed.edges);
          alert('Schema imported successfully!');
        } else {
          alert('Invalid backup schema file format!');
        }
      } catch (err) {
        alert('Failed to parse schema JSON file.');
      }
    };
    reader.readAsText(file);
    // Clear input selection
    e.target.value = '';
  };

  // Preset Loaders
  const handleLoadPreset = (type: 'ecommerce' | 'billing' | 'cms') => {
    if (confirm('Loading a preset will replace your current working schema. Proceed?')) {
      let presetTables: Table[] = [];
      let presetRelations: Relation[] = [];

      if (type === 'ecommerce') {
        presetTables = ECOMMERCE_PRESETS;
        presetRelations = ECOMMERCE_RELATIONS;
      } else if (type === 'billing') {
        presetTables = [
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
        ];
        presetRelations = [
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
        ];
      } else {
        presetTables = [
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
        ];
        presetRelations = [
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
        ];
      }

      const pNodes = presetTables.map((t) => createTableNode(t.id, t.name, t.x, t.y, t.columns, 'slate'));
      const pEdges = presetRelations.map((rel) => {
        let strokeColor = '#10b981';
        if (rel.type === '1:1') strokeColor = '#06b6d4';
        if (rel.type === 'N:M') strokeColor = '#8b5cf6';

        return {
          id: rel.id,
          source: rel.sourceTable,
          target: rel.targetTable,
          sourceHandle: `${rel.sourceTable}-${rel.sourceColumn}-source`,
          targetHandle: `${rel.targetTable}-${rel.targetColumn}-target`,
          animated: true,
          type: 'step',
          label: rel.type,
          labelStyle: { fill: '#ffffff', fontWeight: 700, fontSize: 8, fontFamily: 'monospace' },
          labelBgPadding: [4, 4] as [number, number],
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

      setNodes(pNodes);
      setEdges(pEdges);
      setTimeout(() => triggerAutoLayout(), 100);
    }
  };

  // Trigger Dagre automatic layout
  const triggerAutoLayout = () => {
    const { nodes: lNodes } = getLayoutedElements(nodes, edges, 'LR');
    setNodes(lNodes);
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
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-[#09090b] text-white select-none relative z-10 antialiased font-sans">
      {/* Background Lighting meshes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-teal-500/5 blur-[100px]" />
      </div>

      {/* Hidden File Input for JSON Imports */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        accept=".json"
        className="hidden"
      />

      {/* 📋 Sidebar Controls Panel */}
      <aside className="w-80 h-full border-r border-white/[0.06] bg-[#0c0c10]/40 backdrop-blur-xl flex flex-col shrink-0 z-10 relative">
        {/* 📁 Active Directory Project Folders Section */}
        <div className="p-4 border-b border-white/[0.06] bg-white/[0.01] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                Project Directory
              </span>
            </div>
            
            <button
              onClick={() => {
                const name = prompt('Enter new project folder name (e.g. HRIS, E-commerce):');
                if (name && name.trim()) {
                  handleCreateProject(name.trim());
                }
              }}
              className="h-5 px-2 flex items-center justify-center gap-1 rounded border border-white/[0.05] bg-white/[0.01] text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-[8px] font-bold uppercase font-mono cursor-pointer"
            >
              <Plus className="h-2.5 w-2.5" />
              New
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => setIsOpenProjectSelector(!isOpenProjectSelector)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs font-mono text-white text-left flex items-center justify-between hover:border-white/[0.15] transition-colors focus:outline-none cursor-pointer"
              >
                <span className="truncate">📁 {projects.find(p => p.id === activeProjectId)?.name || 'E-Commerce Store'}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 shrink-0 ml-1 ${isOpenProjectSelector ? 'rotate-180' : ''}`} />
              </button>

              {/* Custom options grouped popover dropdown */}
              {isOpenProjectSelector && (
                <div 
                  className="absolute left-0 right-0 mt-1 z-[130] rounded-xl border border-white/[0.08] bg-[#0c0c10] max-h-52 overflow-y-auto p-1.5 space-y-0.5 shadow-2xl scrollbar-thin"
                  data-lenis-prevent="true"
                >
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        handleSwitchProject(p.id);
                        setIsOpenProjectSelector(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between hover:bg-white/[0.05] cursor-pointer ${
                        activeProjectId === p.id
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold'
                          : 'text-zinc-400 hover:text-white border border-transparent'
                      }`}
                    >
                      <span className="truncate">📁 {p.name}</span>
                      {activeProjectId === p.id && <Check className="h-3 w-3 text-cyan-400 shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {projects.length > 1 && (
              <button
                onClick={() => handleDeleteProject(activeProjectId)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shrink-0"
                title="Delete active folder project"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Presets and Global Actions */}
        <div className="p-4 border-b border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Presets & Engine
              </h2>
            </div>
            
            {/* Backup Action Icons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportJSON}
                className="h-6 px-2 flex items-center justify-center gap-1 rounded border border-white/[0.05] bg-white/[0.01] text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-[9px] font-bold uppercase font-mono cursor-pointer"
                title="Export Diagram Backups (JSON)"
              >
                <Download className="h-3 w-3" />
                Backup
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-6 px-2 flex items-center justify-center gap-1 rounded border border-white/[0.05] bg-white/[0.01] text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-[9px] font-bold uppercase font-mono cursor-pointer"
                title="Import Diagram Backups (JSON)"
              >
                <Upload className="h-3 w-3" />
                Load
              </button>
            </div>
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

          {/* Reverse Engineer pasted SQL Button */}
          <button
            onClick={() => setIsReversingSQL(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300 text-[10px] font-black uppercase tracking-wider font-mono rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <Import className="h-3.5 w-3.5" />
            Reverse Engineer SQL
          </button>
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

        {/* Active Tables List with click to focus fly-to node transitions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin" data-lenis-prevent="true">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono mb-2 flex items-center justify-between">
            <span>Active Schemas ({tables.length})</span>
            <span className="text-[8px] text-zinc-600 font-normal">Click to Focus</span>
          </div>
          {filteredSidebarTables.map((t) => {
            // Find domain color styling for listing dot indicator
            const activeNode = nodes.find((n) => n.id === t.id);
            const domainColor = (activeNode?.data?.color as 'slate' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose') || 'slate';
            
            const dotColorMap: Record<string, string> = {
              slate: 'bg-zinc-500',
              emerald: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
              cyan: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
              purple: 'bg-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.4)]',
              amber: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
              rose: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]',
            };

            return (
              <div
                key={t.id}
                onClick={() => handleFocusTableNode(t.id)}
                className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2 hover:bg-white/[0.03] transition-all group cursor-pointer border-l-2 border-l-transparent hover:border-l-emerald-500"
              >
                <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                  <div className={`h-1.5 w-1.5 rounded-full transition-all ${dotColorMap[domainColor]}`} />
                  <span className="truncate max-w-[150px] uppercase font-bold text-zinc-200 group-hover:text-white">{t.name}</span>
                  <span className="text-[9px] text-zinc-500 font-normal font-sans">({t.columns.length})</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span title="Focus Canvas">
                    <Maximize2 className="h-2.5 w-2.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNodes((nds) => nds.filter((tab) => tab.id !== t.id));
                      setEdges((eds) => eds.filter((e) => e.source !== t.id && e.target !== t.id));
                    }}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded border border-white/[0.04] bg-white/[0.01] text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
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
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeDoubleClick={onEdgeDoubleClick}
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
          <div className="absolute top-4 right-4 flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-[#0c0c10]/85 px-4 py-3.5 backdrop-blur-md text-[10px] font-mono text-zinc-400 shadow-xl pointer-events-none select-none max-w-sm">
            <div className="flex items-center gap-2 font-bold text-zinc-200">
              <Info className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>ER Arena System Instructions</span>
            </div>
            <ul className="list-disc pl-4 space-y-1.5 mt-0.5 text-zinc-400 text-[9px] leading-relaxed">
              <li>Drag teal circles (Source) to emerald circles (Target) to draw relations.</li>
              <li>Hover table header to category brand it with a domain color tag.</li>
              <li>Hover column rows inside table cards to Edit/Settings or Delete columns.</li>
              <li>Double-click any relation line to delete that connection.</li>
            </ul>
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
          <div className="flex-1 p-5 overflow-auto font-mono text-[12px] leading-relaxed text-zinc-300 scrollbar-thin bg-black/40" data-lenis-prevent="true">
            <pre className="select-text whitespace-pre-wrap">{compiledSql}</pre>
          </div>
        </section>
      </main>

      {/* ➕ Column Creation Dialog Popover */}
      {isAddingCol && activeTableForCol && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleAddColumnSubmit}
            className="w-[420px] rounded-2xl border border-white/[0.08] bg-[#09090c]/95 p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 space-y-4"
          >
            <div className="border-b border-white/[0.06] pb-3 mb-2 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Create Column</span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                  Target Table: {activeTableForCol}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCol(false);
                  setIsOpenAddColType(false);
                }}
                className="text-zinc-500 hover:text-white text-xs font-mono font-bold border border-white/[0.04] bg-white/[0.01] px-2 py-0.5 rounded cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Column Name */}
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

            {/* Column Datatype Select */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Data Type
              </label>
              <button
                type="button"
                onClick={() => setIsOpenAddColType(!isOpenAddColType)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs font-mono text-white text-left flex items-center justify-between hover:border-white/[0.15] transition-colors focus:outline-none cursor-pointer"
              >
                <span>{DATA_TYPES.find(d => d.value === newColType)?.label || newColType}</span>
                <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isOpenAddColType ? 'rotate-180' : ''}`} />
              </button>

              {/* Custom options grouped popover dropdown */}
              {isOpenAddColType && (
                <div 
                  className="absolute left-0 right-0 mt-1 z-[120] rounded-xl border border-white/[0.08] bg-[#0c0c10] max-h-52 overflow-y-auto p-2 space-y-2.5 shadow-2xl scrollbar-thin"
                  data-lenis-prevent="true"
                >
                  {['Numeric', 'String', 'Temporal', 'Advanced'].map((gpName) => {
                    const types = DATA_TYPES.filter((d) => d.group === gpName);
                    return (
                      <div key={gpName} className="space-y-1">
                        <div className="text-[8px] font-black uppercase tracking-widest text-zinc-650 font-mono px-2">
                          {gpName}
                        </div>
                        <div className="space-y-0.5">
                          {types.map((dt) => (
                            <button
                              key={dt.value}
                              type="button"
                              onClick={() => {
                                setNewColType(dt.value);
                                setIsOpenAddColType(false);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between hover:bg-white/[0.05] cursor-pointer ${
                                newColType === dt.value
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
                                  : 'text-zinc-400 hover:text-white border border-transparent'
                              }`}
                            >
                              <span>{dt.label}</span>
                              {newColType === dt.value && <Check className="h-3 w-3 text-emerald-400" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Key / Nullable toggles */}
            <div className="grid grid-cols-3 gap-2.5 py-2.5 border-y border-white/[0.04] text-[10px] font-mono">
              <label className="flex items-center gap-1.5 text-zinc-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={newColIsPK}
                  onChange={(e) => {
                    setNewColIsPK(e.target.checked);
                    if (e.target.checked) {
                      setNewColIsFK(false);
                      setNewColIsNullable(false);
                    }
                  }}
                  className="rounded border-white/[0.1] bg-white/[0.02] text-emerald-500 focus:ring-0 cursor-pointer h-4 w-4"
                />
                PK (Primary)
              </label>
              <label className="flex items-center gap-1.5 text-zinc-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={newColIsFK}
                  onChange={(e) => {
                    setNewColIsFK(e.target.checked);
                    if (e.target.checked) setNewColIsPK(false);
                  }}
                  className="rounded border-white/[0.1] bg-white/[0.02] text-cyan-500 focus:ring-0 cursor-pointer h-4 w-4"
                />
                FK (Foreign)
              </label>
              <label className="flex items-center gap-1.5 text-zinc-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={newColIsNullable}
                  disabled={newColIsPK}
                  onChange={(e) => setNewColIsNullable(e.target.checked)}
                  className="rounded border-white/[0.1] bg-white/[0.02] text-amber-500 focus:ring-0 cursor-pointer h-4 w-4 disabled:opacity-30"
                />
                Nullable
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2 px-3 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#09090b] text-emerald-400 text-xs font-black uppercase tracking-wider font-mono rounded-lg transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/10 animate-pulse hover:animate-none"
            >
              Add Column to Table
            </button>
          </form>
        </div>
      )}

      {/* ⚙️ Column Modification dialog popover */}
      {isEditingCol && activeTableForEditCol && activeColIndexForEdit !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleEditColumnSubmit}
            className="w-[420px] rounded-2xl border border-white/[0.08] bg-[#09090c]/95 p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 space-y-4"
          >
            <div className="border-b border-white/[0.06] pb-3 mb-2 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <Settings className="h-4 w-4 text-emerald-400 shrink-0" />
                  Modify Column Settings
                </span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                  Table: {activeTableForEditCol}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditingCol(false);
                  setActiveTableForEditCol(null);
                  setActiveColIndexForEdit(null);
                  setIsOpenEditColType(false);
                }}
                className="text-zinc-500 hover:text-white text-xs font-mono font-bold border border-white/[0.04] bg-white/[0.01] px-2 py-0.5 rounded cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Column Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Column Name
              </label>
              <input
                type="text"
                required
                value={editColName}
                onChange={(e) => setEditColName(e.target.value)}
                placeholder="e.g. quantity"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:border-emerald-500/30 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* Column Datatype Select */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Data Type
              </label>
              <button
                type="button"
                onClick={() => setIsOpenEditColType(!isOpenEditColType)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs font-mono text-white text-left flex items-center justify-between hover:border-white/[0.15] transition-colors focus:outline-none cursor-pointer"
              >
                <span>{DATA_TYPES.find(d => d.value === editColType)?.label || editColType}</span>
                <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isOpenEditColType ? 'rotate-180' : ''}`} />
              </button>

              {/* Custom options grouped popover dropdown */}
              {isOpenEditColType && (
                <div 
                  className="absolute left-0 right-0 mt-1 z-[120] rounded-xl border border-white/[0.08] bg-[#0c0c10] max-h-52 overflow-y-auto p-2 space-y-2.5 shadow-2xl scrollbar-thin"
                  data-lenis-prevent="true"
                >
                  {['Numeric', 'String', 'Temporal', 'Advanced'].map((gpName) => {
                    const types = DATA_TYPES.filter((d) => d.group === gpName);
                    return (
                      <div key={gpName} className="space-y-1">
                        <div className="text-[8px] font-black uppercase tracking-widest text-zinc-650 font-mono px-2">
                          {gpName}
                        </div>
                        <div className="space-y-0.5">
                          {types.map((dt) => (
                            <button
                              key={dt.value}
                              type="button"
                              onClick={() => {
                                setEditColType(dt.value);
                                setIsOpenEditColType(false);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between hover:bg-white/[0.05] cursor-pointer ${
                                editColType === dt.value
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
                                  : 'text-zinc-400 hover:text-white border border-transparent'
                              }`}
                            >
                              <span>{dt.label}</span>
                              {editColType === dt.value && <Check className="h-3 w-3 text-emerald-400" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Key / Nullable toggles */}
            <div className="grid grid-cols-3 gap-2.5 py-2.5 border-y border-white/[0.04] text-[10px] font-mono">
              <label className="flex items-center gap-1.5 text-zinc-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={editColIsPK}
                  onChange={(e) => {
                    setEditColIsPK(e.target.checked);
                    if (e.target.checked) {
                      setEditColIsFK(false);
                      setEditColIsNullable(false);
                    }
                  }}
                  className="rounded border-white/[0.1] bg-white/[0.02] text-emerald-500 focus:ring-0 cursor-pointer h-4 w-4"
                />
                PK (Primary)
              </label>
              <label className="flex items-center gap-1.5 text-zinc-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={editColIsFK}
                  onChange={(e) => {
                    setEditColIsFK(e.target.checked);
                    if (e.target.checked) setEditColIsPK(false);
                  }}
                  className="rounded border-white/[0.1] bg-white/[0.02] text-cyan-500 focus:ring-0 cursor-pointer h-4 w-4"
                />
                FK (Foreign)
              </label>
              <label className="flex items-center gap-1.5 text-zinc-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={editColIsNullable}
                  disabled={editColIsPK}
                  onChange={(e) => setEditColIsNullable(e.target.checked)}
                  className="rounded border-white/[0.1] bg-white/[0.02] text-amber-500 focus:ring-0 cursor-pointer h-4 w-4 disabled:opacity-30"
                />
                Nullable
              </label>
            </div>

            {/* Save */}
            <button
              type="submit"
              className="w-full py-2 px-3 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#09090b] text-emerald-400 text-xs font-black uppercase tracking-wider font-mono rounded-lg transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/10"
            >
              Save Column Settings
            </button>
          </form>
        </div>
      )}

      {/* 📥 SQL DDL Reverse Engineering pasted modal */}
      {isReversingSQL && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleReverseSQLSubmit}
            className="w-[600px] rounded-2xl border border-white/[0.08] bg-[#09090c]/95 p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 space-y-4"
          >
            <div className="border-b border-white/[0.06] pb-3 mb-2 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <Import className="h-4 w-4 text-emerald-400 shrink-0" />
                  Reverse Engineer SQL Schema (DDL)
                </span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                  Paste DDL CREATE TABLE & ALTER TABLE scripts below
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsReversingSQL(false);
                  setPastedSQL('');
                }}
                className="text-zinc-500 hover:text-white text-xs font-mono font-bold border border-white/[0.04] bg-white/[0.01] px-2 py-0.5 rounded cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Textarea */}
            <div className="space-y-1.5">
              <textarea
                value={pastedSQL}
                onChange={(e) => setPastedSQL(e.target.value)}
                required
                rows={10}
                placeholder="CREATE TABLE customers (&#13;&#10;  id SERIAL PRIMARY KEY,&#13;&#10;  name VARCHAR(100) NOT NULL,&#13;&#10;  email VARCHAR(255) UNIQUE&#13;&#10;);&#13;&#10;&#13;&#10;CREATE TABLE orders (&#13;&#10;  id INT PRIMARY KEY,&#13;&#10;  customer_id INT&#13;&#10;);&#13;&#10;&#13;&#10;ALTER TABLE orders ADD FOREIGN KEY (customer_id) REFERENCES customers(id);"
                className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 text-[11px] font-mono text-zinc-300 placeholder-zinc-600 focus:border-emerald-500/30 focus:outline-none transition-colors scrollbar-thin leading-relaxed"
                data-lenis-prevent="true"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 px-3 border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#09090b] text-emerald-400 text-xs font-black uppercase tracking-wider font-mono rounded-lg transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/15"
            >
              Parse and Render Schema
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

// Master Wrap to support the useReactFlow hook
export default function ERBuilder() {
  return (
    <ReactFlowProvider>
      <ERBuilderContent />
    </ReactFlowProvider>
  );
}
