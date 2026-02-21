import { useAppState } from '@/context/AppContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatNumber } from '@/utils/formatNumber';

export function SchemaPanel() {
  const { metadata } = useAppState();

  if (!metadata) return null;

  return (
    <div className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Schema
        </h2>
      </div>
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="px-4 py-2">
          {metadata.schema.map((col) => (
            <div key={col.name} className="py-1.5">
              <div className="text-sm font-medium text-foreground">
                {col.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {col.type}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-border px-4 py-3">
        <div className="flex justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Rows</div>
            <div className="text-sm font-semibold text-foreground">
              {formatNumber(metadata.rowCount)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Columns</div>
            <div className="text-sm font-semibold text-foreground">
              {formatNumber(metadata.schema.length)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
