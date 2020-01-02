import React from "react";
import AceEditor, { IAceOptions } from "react-ace";

import "brace/mode/json";
import "brace/mode/yaml";
import "brace/theme/monokai";

interface JsonEditorProps {
  value: string;
  useYaml?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export function GeneralEditor(props: JsonEditorProps): React.ReactElement {
  const aceOptions: IAceOptions = {
    readOnly: props.readOnly,
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
      mode={props.useYaml ? "yaml" : "json"}
      showGutter={true}
      width="100%"
      editorProps={{ $blockScrolling: Infinity }}
      setOptions={aceOptions}
      value={props.value}
      onChange={props.onChange}
    />
  );
}
