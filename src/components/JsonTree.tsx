import { useState, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonTreeProps {
  data: unknown;
  defaultExpanded?: number;
}

export function JsonTree({ data, defaultExpanded = 3 }: JsonTreeProps) {
  return (
    <div className="font-mono text-sm leading-relaxed">
      <JsonNode
        value={data}
        depth={0}
        defaultExpanded={defaultExpanded}
        isLast
      />
    </div>
  );
}

interface JsonNodeProps {
  keyName?: string;
  value: unknown;
  depth: number;
  defaultExpanded: number;
  isLast: boolean;
}

function JsonNode({ keyName, value, depth, defaultExpanded, isLast }: JsonNodeProps) {
  const isExpandable = value !== null && typeof value === 'object';
  const [expanded, setExpanded] = useState(depth < defaultExpanded);

  const toggle = useCallback(() => setExpanded((e) => !e), []);

  if (!isExpandable) {
    return (
      <div className="flex" style={{ paddingLeft: depth * 16 }}>
        <KeyLabel keyName={keyName} />
        <LeafValue value={value} />
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';
  const count = entries.length;

  return (
    <div>
      <button
        onClick={toggle}
        className="flex w-full items-center rounded-sm text-left transition-colors hover:bg-accent/30"
        style={{ paddingLeft: depth * 16 }}
      >
        <ChevronRight
          className={cn(
            'mr-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150',
            expanded && 'rotate-90',
          )}
        />
        <KeyLabel keyName={keyName} />
        <span className="text-muted-foreground">
          {openBracket}
          {!expanded && (
            <span className="text-muted-foreground/60">
              {` ${count} ${count === 1 ? 'item' : 'items'} `}
            </span>
          )}
          {!expanded && closeBracket}
        </span>
        {!expanded && !isLast && <span className="text-muted-foreground">,</span>}
      </button>

      {expanded && (
        <>
          {entries.map(([k, v], i) => (
            <JsonNode
              key={k}
              keyName={isArray ? undefined : k}
              value={v}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
              isLast={i === entries.length - 1}
            />
          ))}
          <div className="flex" style={{ paddingLeft: depth * 16 }}>
            <span className="ml-[18px] text-muted-foreground">{closeBracket}</span>
            {!isLast && <span className="text-muted-foreground">,</span>}
          </div>
        </>
      )}
    </div>
  );
}

function KeyLabel({ keyName }: { keyName?: string }) {
  if (keyName === undefined) return null;
  return (
    <>
      <span className="text-blue-400">&quot;{keyName}&quot;</span>
      <span className="text-muted-foreground">:&nbsp;</span>
    </>
  );
}

function LeafValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="italic text-muted-foreground">null</span>;
  }
  if (typeof value === 'string') {
    return <span className="text-green-400">&quot;{value}&quot;</span>;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return <span className="text-amber-400">{String(value)}</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-purple-400">{String(value)}</span>;
  }
  return <span className="text-foreground">{String(value)}</span>;
}
