export type ComplexTypeKind = 'struct' | 'list' | 'map';

export function isComplexType(duckdbType: string): boolean {
  const t = duckdbType.toUpperCase();
  return t.includes('STRUCT') || t.includes('LIST') || t.includes('MAP') || t === 'JSON';
}

export function getComplexTypeKind(duckdbType: string): ComplexTypeKind | null {
  const t = duckdbType.toUpperCase();
  if (t.includes('STRUCT')) return 'struct';
  if (t.includes('MAP')) return 'map';
  if (t.includes('LIST')) return 'list';
  return null;
}

export function typeBadgeLabel(kind: ComplexTypeKind | null): string {
  switch (kind) {
    case 'struct': return '{ }';
    case 'map': return '{k:v}';
    case 'list': return '[ ]';
    default: return '';
  }
}

/**
 * Try to resolve a cell value into a parsed JS object/array.
 * DuckDB-WASM often returns complex types as JSON strings via Arrow serialization.
 */
export function parseComplexValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return value;
      }
    }
  }
  return value;
}

const bigIntReplacer = (_key: string, val: unknown) =>
  typeof val === 'bigint' ? Number(val) : val;

export function serializeValue(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  const resolved = parseComplexValue(value);
  try {
    return JSON.stringify(resolved, bigIntReplacer, 2);
  } catch {
    return String(value);
  }
}

export function truncatedPreview(value: unknown, maxLen = 60): string {
  if (value === null || value === undefined) return 'null';
  const resolved = parseComplexValue(value);
  try {
    const json = JSON.stringify(resolved, bigIntReplacer);
    if (json.length <= maxLen) return json;
    return json.slice(0, maxLen) + '\u2026';
  } catch {
    return String(value);
  }
}
