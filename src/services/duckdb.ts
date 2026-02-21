import * as duckdb from '@duckdb/duckdb-wasm';

let db: duckdb.AsyncDuckDB | null = null;
let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;

export async function initDuckDB(): Promise<duckdb.AsyncDuckDB> {
  if (db) return db;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const bundles = duckdb.getJsDelivrBundles();
    const selected = await duckdb.selectBundle(bundles);

    const worker = await duckdb.createWorker(selected.mainWorker!);
    const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);

    const instance = new duckdb.AsyncDuckDB(logger, worker);
    await instance.instantiate(selected.mainModule, selected.pthreadWorker);

    db = instance;
    return instance;
  })();

  return dbPromise;
}

export async function getConnection(): Promise<duckdb.AsyncDuckDBConnection> {
  if (!db) throw new Error('DuckDB not initialized');
  if (!conn) {
    conn = await db.connect();
  }
  return conn;
}

export async function registerFile(file: File): Promise<void> {
  if (!db) throw new Error('DuckDB not initialized');

  await db.registerFileHandle(
    'data.parquet',
    file,
    duckdb.DuckDBDataProtocol.BROWSER_FILEREADER,
    false,
  );

  const c = await getConnection();
  await c.query(`CREATE OR REPLACE VIEW data AS SELECT * FROM 'data.parquet'`);
}

/** The Arrow Table type returned by DuckDB's query method. */
type ArrowTable = Awaited<ReturnType<duckdb.AsyncDuckDBConnection['query']>>;

/** Convert an Arrow Table into plain JS objects, coercing BigInt → Number. */
function arrowToObjects(result: ArrowTable): Record<string, unknown>[] {
  const fields = result.schema.fields;
  return result.toArray().map((row: Record<string, unknown>) => {
    const obj: Record<string, unknown> = {};
    for (const field of fields) {
      const val = row[field.name];
      obj[field.name] = typeof val === 'bigint' ? Number(val) : val;
    }
    return obj;
  });
}

export async function queryRows(
  sql: string,
): Promise<Record<string, unknown>[]> {
  const c = await getConnection();
  const result = await c.query(sql);
  return arrowToObjects(result);
}

export async function queryCount(sql: string): Promise<number> {
  const c = await getConnection();
  const result = await c.query(sql);
  const row = result.toArray()[0];
  if (!row) return 0;
  // Always grab the first column value — the caller controls the alias
  const val = Object.values(row)[0];
  return typeof val === 'bigint' ? Number(val) : Number(val);
}

export async function executeSQL(
  sql: string,
): Promise<{
  columns: { name: string; type: string }[];
  rows: Record<string, unknown>[];
  rowCount: number;
  elapsed: number;
}> {
  const c = await getConnection();
  const start = performance.now();
  const result = await c.query(sql);
  const elapsed = Math.round(performance.now() - start);

  const columns = result.schema.fields.map((f) => ({
    name: f.name,
    type: f.type.toString(),
  }));

  const rows = arrowToObjects(result);

  return { columns, rows, rowCount: rows.length, elapsed };
}

export async function getTableColumns(): Promise<
  { name: string; type: string }[]
> {
  const c = await getConnection();
  const result = await c.query(`DESCRIBE data`);
  return result.toArray().map((row) => ({
    name: String(row['column_name']),
    type: String(row['column_type']),
  }));
}

export async function resetConnection(): Promise<void> {
  if (conn) {
    try {
      await conn.query('DROP VIEW IF EXISTS data');
    } catch {
      // View may not exist — safe to ignore
    }
    await conn.close();
    conn = null;
  }
}
