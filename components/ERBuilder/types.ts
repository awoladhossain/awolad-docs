export interface Column {
  name: string;
  type: string;
  isPK?: boolean;
  isFK?: boolean;
  isNullable?: boolean;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  x: number;
  y: number;
}

export interface Relation {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  type: '1:1' | '1:N' | 'N:M';
}

export interface DiagramData {
  id: string;
  name: string;
  updatedAt: string;
  tables: Table[];
  relations: Relation[];
}
