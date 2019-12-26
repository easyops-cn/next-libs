import React from "react";
import AceEditor, { IAceOptions } from "react-ace";

import "brace/mode/json";
import "brace/theme/monokai";

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
}

export function JsonEditor(props: JsonEditorProps): React.ReactElement {
  const aceOptions: IAceOptions = {
    showLineNumbers: true,
    maxLines: Infinity,
    minLines: 8,
    tabSize: 2,
    printMargin: false,
    highlightActiveLine: false,
    highlightGutterLine: false
  };

  return (
    <AceEditor
      theme="monokai"
      mode="json"
      showGutter={true}
      width="100%"
      editorProps={{ $blockScrolling: Infinity }}
      setOptions={aceOptions}
      value={props.value}
      onChange={props.onChange}
    />
  );
}
