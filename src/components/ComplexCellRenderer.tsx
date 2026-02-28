import type { ICellRendererParams } from 'ag-grid-community';
import { Badge } from '@/components/ui/badge';
import { truncatedPreview, typeBadgeLabel, parseComplexValue, type ComplexTypeKind } from '@/utils/complexTypes';

interface ComplexCellRendererParams extends ICellRendererParams {
  columnType: string;
  complexKind: ComplexTypeKind;
}

export function ComplexCellRenderer(params: ComplexCellRendererParams) {
  const { value, colDef, complexKind, context } = params;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  const resolved = parseComplexValue(value);
  const preview = truncatedPreview(resolved);
  const badgeText = typeBadgeLabel(complexKind);

  const handleClick = () => {
    context?.onViewComplexValue?.(
      colDef?.headerName ?? colDef?.field ?? 'Value',
      params.columnType,
      resolved,
    );
  };

  return (
    <button
      onClick={handleClick}
      className="group flex w-full items-center gap-1.5 text-left font-mono text-xs leading-snug text-muted-foreground transition-colors hover:text-foreground"
    >
      <Badge
        variant="outline"
        className="shrink-0 rounded px-1 py-0 font-mono text-[10px] leading-tight text-muted-foreground group-hover:border-foreground/30 group-hover:text-foreground"
      >
        {badgeText}
      </Badge>
      <span className="truncate">{preview}</span>
    </button>
  );
}
