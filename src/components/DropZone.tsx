import { useCallback, useState, useRef, type DragEvent } from 'react';
import { useParquetFile } from '@/hooks/useParquetFile';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';

export function DropZone() {
  const [dragging, setDragging] = useState(false);
  const { loadFile } = useParquetFile();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.parquet')) {
        loadFile(file);
      }
    },
    [loadFile],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleClick = () => inputRef.current?.click();

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  return (
    <Card
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`flex h-full cursor-pointer flex-col items-center justify-center border-2 border-dashed transition-colors ${
        dragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".parquet"
        onChange={handleFileInput}
        className="hidden"
      />
      <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="mb-1 text-lg font-medium text-foreground">
        Drop a .parquet file here
      </h2>
      <p className="text-sm text-muted-foreground">
        or click to browse
      </p>
    </Card>
  );
}
