import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onRun: () => void;
}

export function SqlEditor({ value, onChange, onRun }: Props) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <CodeMirror
        value={value}
        height="120px"
        theme="dark"
        extensions={[sql()]}
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
        }}
      />
    </div>
  );
}
