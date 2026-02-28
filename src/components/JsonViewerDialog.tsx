import { useCallback } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonTree } from '@/components/JsonTree';
import { serializeValue, getComplexTypeKind, typeBadgeLabel } from '@/utils/complexTypes';

export interface JsonViewerState {
  columnName: string;
  columnType: string;
  value: unknown;
}

interface JsonViewerDialogProps {
  state: JsonViewerState | null;
  onClose: () => void;
}

export function JsonViewerDialog({ state, onClose }: JsonViewerDialogProps) {
  const open = state !== null;

  const handleCopy = useCallback(() => {
    if (!state) return;
    const text = serializeValue(state.value);
    navigator.clipboard.writeText(text).then(() => {
      toast.success('JSON copied to clipboard', { duration: 2000 });
    });
  }, [state]);

  const kind = state ? getComplexTypeKind(state.columnType) : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            <DialogTitle>{state?.columnName ?? 'Value'}</DialogTitle>
            {kind && (
              <Badge
                variant="secondary"
                className="rounded px-1.5 py-0 font-mono text-xs"
              >
                {typeBadgeLabel(kind)}
              </Badge>
            )}
          </div>
          <DialogDescription>{state?.columnType ?? ''}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
          {state && <JsonTree data={state.value} defaultExpanded={3} />}
        </div>

        <div className="flex shrink-0 items-center justify-end border-t border-border px-6 py-3">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy JSON
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
