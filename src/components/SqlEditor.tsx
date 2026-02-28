import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onRun: () => void;
  schema?: Record<string, string[]>;
}

export function SqlEditor({ value, onChange, onRun, schema }: Props) {
  const extensions = useMemo(
    () => [sql({ schema: schema ?? {} })],
    [schema],
  );

  return (
    <div className="resize-y overflow-hidden rounded-md border border-border" style={{ minHeight: 80, maxHeight: 300, height: 120 }}>
      <CodeMirror
        value={value}
        height="100%"
        theme="dark"
        extensions={extensions}
        onChange={onChange}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRun();
          }
        }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
          autocompletion: true,
        }}
      />
    </div>
  );
}
