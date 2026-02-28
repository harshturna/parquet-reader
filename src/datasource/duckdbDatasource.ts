import type { IDatasource, IGetRowsParams } from 'ag-grid-community';
import { queryRows, queryCount } from '../services/duckdb';
import { filterModelToSQL, globalFilterToSQL } from '../utils/filterTranslator';
import { sortModelToSQL } from '../utils/sortTranslator';

export function createDuckDBDatasource(
  baseTable: string,
  columnNames: string[],
  getGlobalFilter: () => string,
  onTotalCount: (count: number) => void,
  onFirstBlock?: (rows: Record<string, unknown>[]) => void,
): IDatasource {
  let firstBlockFired = false;

  return {
    rowCount: undefined,

    getRows(params: IGetRowsParams) {
      const { startRow, endRow, filterModel, sortModel, successCallback, failCallback } = params;

      const limit = endRow - startRow;
      const offset = startRow;

      const filterWhere = filterModelToSQL(filterModel);
      const globalWhere = globalFilterToSQL(columnNames, getGlobalFilter());
      const whereParts: string[] = [];
      if (filterWhere) whereParts.push(filterWhere);
      if (globalWhere) whereParts.push(globalWhere);
      const where = whereParts.length ? ` WHERE ${whereParts.join(' AND ')}` : '';

      const orderBy = sortModelToSQL(sortModel);
      const orderClause = orderBy ? ` ORDER BY ${orderBy}` : '';

      const dataSQL = `SELECT * FROM ${baseTable}${where}${orderClause} LIMIT ${limit} OFFSET ${offset}`;
      const countSQL = `SELECT COUNT(*) AS cnt FROM ${baseTable}${where}`;

      Promise.all([queryRows(dataSQL), queryCount(countSQL)])
        .then(([rows, total]) => {
          onTotalCount(total);
          if (!firstBlockFired && startRow === 0 && onFirstBlock) {
            firstBlockFired = true;
            onFirstBlock(rows);
          }
          const lastRow = startRow + rows.length < total ? -1 : total;
          successCallback(rows, lastRow);
        })
        .catch((err) => {
          console.error('DuckDB query error:', err);
          failCallback();
        });
    },
  };
}
