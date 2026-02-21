import { parquetMetadataAsync, parquetSchema } from 'hyparquet';
import type { ParquetMetadata } from '../types';

function fileToAsyncBuffer(file: File) {
  return {
    byteLength: file.size,
    slice(start: number, end?: number) {
      return file.slice(start, end).arrayBuffer();
    },
  };
}

function formatType(element: {
  type?: string;
  converted_type?: string;
  logical_type?: { type: string };
}): string {
  if (element.logical_type?.type) {
    return element.logical_type.type;
  }
  if (element.converted_type) {
    return element.converted_type;
  }
  return element.type ?? 'UNKNOWN';
}

export async function extractMetadata(file: File): Promise<ParquetMetadata> {
  const asyncBuffer = fileToAsyncBuffer(file);
  const metadata = await parquetMetadataAsync(asyncBuffer);
  const tree = parquetSchema(metadata);

  const schema = tree.children.map((child) => ({
    name: child.element.name,
    type: formatType(child.element),
  }));

  return {
    schema,
    rowCount: Number(metadata.num_rows),
  };
}
