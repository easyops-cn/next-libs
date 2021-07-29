import { Annotation } from "brace";
import { FormItemWrapperProps } from "@next-libs/forms";

export interface Error {
  err: Annotation[];
  hasError: boolean;
}

export interface CodeEditorProps extends FormItemWrapperProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onErrorChange?: (error: Error) => void;
  disabled?: boolean;
  theme?: string;
  mode: string;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  maxLines?: number | "Infinity";
  minLines?: number;
  tabSize?: number;
  printMargin?: boolean;
  highlightActiveLine?: boolean;
  onValidate?: (error: Annotation[]) => void;
  showExportButton?: boolean;
  showCopyButton?: boolean;
  exportFileName?: string;
  jsonSchema?: Record<string, any>;
  validateJsonSchemaMode?: "warning" | "error";
  schemaRef?: string;
  enableLiveAutocompletion?: boolean;
  customCompleters?:
    | string[]
    | {
        caption?: string;
        value: string;
        meta?: string;
        score?: number;
      }[];
  loadYamlInJsonMode?: boolean;
  showPrintMargin?: boolean;
}