import { parquetMetadataAsync, parquetSchema } from 'hyparquet';
import type { ParquetMetadata, RowGroupDetail } from '../types';

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

  let totalCompressedSize = 0;
  let totalUncompressedSize = 0;

  const rowGroupDetails: RowGroupDetail[] = (metadata.row_groups ?? []).map((rg) => {
    const compressed = Number(rg.total_compressed_size ?? 0);
    const uncompressed = Number(rg.total_byte_size ?? 0);
    totalCompressedSize += compressed;
    totalUncompressedSize += uncompressed;

    return {
      numRows: Number(rg.num_rows),
      compressedSize: compressed,
      uncompressedSize: uncompressed,
      columns: (rg.columns ?? []).map((col) => ({
        path: col.meta_data?.path_in_schema?.join('.') ?? '',
        codec: col.meta_data?.codec ?? 'UNKNOWN',
        compressedSize: Number(col.meta_data?.total_compressed_size ?? 0),
        uncompressedSize: Number(col.meta_data?.total_uncompressed_size ?? 0),
      })),
    };
  });

  return {
    schema,
    rowCount: Number(metadata.num_rows),
    version: metadata.version,
    createdBy: metadata.created_by ?? null,
    numRowGroups: metadata.row_groups?.length ?? 0,
    rowGroupDetails,
    keyValueMetadata: (metadata.key_value_metadata ?? []).map((kv) => ({
      key: kv.key,
      value: kv.value ?? '',
    })),
    totalCompressedSize,
    totalUncompressedSize,
  };
}
