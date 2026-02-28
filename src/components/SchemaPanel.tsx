import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatNumber } from '@/utils/formatNumber';

type Tab = 'schema' | 'details';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function SchemaTab() {
  const { metadata } = useAppState();

  if (!metadata) return null;

  return (
    <>
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="px-4 py-2">
          {metadata.schema.map((col) => (
            <div key={col.name} className="py-1.5">
              <div className="text-sm font-medium text-foreground">{col.name}</div>
              <div className="text-xs text-muted-foreground">{col.type}</div>
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
    </>
  );
}

function DetailsTab() {
  const { metadata } = useAppState();

  if (!metadata) return null;

  const ratio =
    metadata.totalUncompressedSize > 0
      ? (metadata.totalCompressedSize / metadata.totalUncompressedSize * 100).toFixed(1)
      : null;

  const uniqueCodecs = new Set<string>();
  for (const rg of metadata.rowGroupDetails) {
    for (const col of rg.columns) {
      uniqueCodecs.add(col.codec);
    }
  }

  return (
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="space-y-4 px-4 py-3">
        {/* General */}
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            General
          </h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
            <dt className="text-muted-foreground">Version</dt>
            <dd className="text-foreground">{metadata.version}</dd>
            {metadata.createdBy && (
              <>
                <dt className="text-muted-foreground">Created by</dt>
                <dd className="break-all text-foreground">{metadata.createdBy}</dd>
              </>
            )}
            <dt className="text-muted-foreground">Rows</dt>
            <dd className="text-foreground">{formatNumber(metadata.rowCount)}</dd>
            <dt className="text-muted-foreground">Columns</dt>
            <dd className="text-foreground">{metadata.schema.length}</dd>
            <dt className="text-muted-foreground">Row groups</dt>
            <dd className="text-foreground">{metadata.numRowGroups}</dd>
          </dl>
        </section>

        {/* Storage */}
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Storage
          </h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
            <dt className="text-muted-foreground">Compressed</dt>
            <dd className="text-foreground">{formatBytes(metadata.totalCompressedSize)}</dd>
            <dt className="text-muted-foreground">Uncompressed</dt>
            <dd className="text-foreground">{formatBytes(metadata.totalUncompressedSize)}</dd>
            {ratio && (
              <>
                <dt className="text-muted-foreground">Ratio</dt>
                <dd className="text-foreground">{ratio}%</dd>
              </>
            )}
            <dt className="text-muted-foreground">Compression</dt>
            <dd className="text-foreground">{[...uniqueCodecs].join(', ') || 'N/A'}</dd>
          </dl>
        </section>

        {/* Key-Value Metadata */}
        {metadata.keyValueMetadata.length > 0 && (
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Key-Value Metadata
            </h3>
            <div className="space-y-2 text-xs">
              {metadata.keyValueMetadata.map((kv, i) => (
                <div key={i}>
                  <div className="font-medium text-foreground">{kv.key}</div>
                  <div className="max-h-24 overflow-auto whitespace-pre-wrap break-all text-muted-foreground">
                    {kv.value}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </ScrollArea>
  );
}

export function SchemaPanel() {
  const { metadata } = useAppState();
  const [tab, setTab] = useState<Tab>('schema');

  if (!metadata) return null;

  return (
    <div className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab('schema')}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
            tab === 'schema'
              ? 'border-b-2 border-foreground text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Schema
        </button>
        <button
          onClick={() => setTab('details')}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
            tab === 'details'
              ? 'border-b-2 border-foreground text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Details
        </button>
      </div>
      {tab === 'schema' ? <SchemaTab /> : <DetailsTab />}
    </div>
  );
}
