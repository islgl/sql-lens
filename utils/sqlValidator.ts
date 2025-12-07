import { MySQL, PostgreSQL, SparkSQL } from "dt-sql-parser";
import { SqlDialect } from "../components/sqlDialects";

export interface ValidationError {
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  message: string;
}

const parsers = {
  mysql: new MySQL(),
  postgresql: new PostgreSQL(),
  spark: new SparkSQL(),
  standard: new MySQL(), // Fallback to MySQL for standard SQL
};

export const validateSql = (
  sql: string,
  dialect: SqlDialect
): ValidationError[] => {
  if (!sql || !sql.trim()) return [];

  const parser = parsers[dialect] || parsers.standard;

  try {
    const result = parser.validate(sql);

    return result.map((error) => ({
      startLine: error.startLine,
      endLine: error.endLine,
      startColumn: error.startCol,
      endColumn: error.endCol,
      message: error.message,
    }));
  } catch (e) {
    console.error("Validation failed", e);
    return [];
  }
};
