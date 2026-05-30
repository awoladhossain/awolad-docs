import { Table, Relation } from './types';

export const generateSQL = (tables: Table[], relations: Relation[]): string => {
  if (tables.length === 0) {
    return '-- =========================================================================\n-- 📈 CORE KERNEL RELATIONAL ENGINE\n-- =========================================================================\n-- No tables defined in schema. Add tables in the sidebar to generate DDL script.';
  }

  let sql = `-- =========================================================================\n`;
  sql += `-- 📈 AUTO-GENERATED DATABASE SCHEMA (CORE KERNEL RELATIONAL ENGINE)\n`;
  sql += `-- Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
  sql += `-- Target: Standard SQL / PostgreSQL Compliant DDL\n`;
  sql += `-- =========================================================================\n\n`;

  // 1. Generate CREATE TABLE blocks
  tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;
    
    const colLines: string[] = [];
    const pkCols = table.columns.filter((c) => c.isPK);
    
    table.columns.forEach((col) => {
      let line = `  ${col.name} ${col.type}`;
      
      // If it is single PK, declare it, but do not append NOT NULL since PK implies it
      if (col.isPK && pkCols.length === 1) {
        line += ` PRIMARY KEY`;
      } else {
        if (!col.isNullable) {
          line += ` NOT NULL`;
        }
      }
      
      colLines.push(line);
    });
    
    // Composite Primary Key constraints if multiple
    if (pkCols.length > 1) {
      const pkNames = pkCols.map((c) => c.name).join(', ');
      colLines.push(`  CONSTRAINT pk_${table.name} PRIMARY KEY (${pkNames})`);
    }
    
    sql += colLines.join(',\n') + '\n';
    sql += `);\n\n`;
  });

  // 2. Generate Foreign Key Constraints using ALTER TABLE statements
  if (relations.length > 0) {
    sql += `-- =========================================================================\n`;
    sql += `-- 🔗 REFERENTIAL INTEGRITY CONSTRAINTS (FOREIGN KEYS)\n`;
    sql += `-- =========================================================================\n\n`;

    relations.forEach((rel) => {
      // Find source and target table names from ids
      const sourceTable = tables.find((t) => t.id === rel.sourceTable);
      const targetTable = tables.find((t) => t.id === rel.targetTable);

      if (sourceTable && targetTable) {
        const constraintName = `fk_${sourceTable.name}_${rel.sourceColumn}`;
        sql += `ALTER TABLE ${sourceTable.name}\n`;
        sql += `  ADD CONSTRAINT ${constraintName}\n`;
        sql += `  FOREIGN KEY (${rel.sourceColumn}) REFERENCES ${targetTable.name}(${rel.targetColumn})\n`;
        sql += `  ON UPDATE CASCADE ON DELETE CASCADE;\n\n`;
      }
    });
  }

  return sql;
};
