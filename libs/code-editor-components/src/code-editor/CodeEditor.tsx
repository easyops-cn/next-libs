import React, { useState, useEffect, useRef, forwardRef } from "react";
import AceEditor, { IEditorProps } from "react-ace";
import {
  isEqual,
  isEmpty,
  uniqWith,
  isArray,
  isString,
  map,
  isNil,
  some,
} from "lodash";
import Ajv from "ajv";
import { Annotation } from "brace";
import { ExportOutlined } from "@ant-design/icons";
import { ValidationRule } from "@ant-design/compatible/lib/form";
import { message, Tooltip } from "antd";
import classNames from "classnames";
import yaml from "js-yaml";
import FileSaver from "file-saver";
import i18n from "i18next";
import storyboardJsonSchema from "@next-core/brick-types/.schema/storyboard.json";
import { Clipboard } from "@next-libs/clipboard";
import { FormItemWrapper } from "@next-libs/forms";
import { NS_CODE_EDITOR_COMPONENTS, K } from "../i18n/constants";
import { getBrickNextMode } from "../custom-mode/BrickNextMode";
import { getBrickNextYamlMode } from "../custom-mode/BrickNextYamlMode";
import { getTerraformMode } from "../custom-mode/TerraformMode";
import { brickNextCompleters } from "../custom-mode/brickNextUtil";
import { CodeEditorProps } from "../interfaces";
import { loadPluginsForCodeEditor } from "../brace";
import { getCommonExpressionLanguageYamlMode } from "../custom-mode/CommonExpressionLanguageYamlMode";
import { getCommonExpressionLanguageMode } from "../custom-mode/CommonExpressionLanguageMode";

import style from "./CodeEditor.module.css";
import shareStyle from "../share.module.css";

export function CodeEditorItem(
  props: CodeEditorProps,
  ref: any
): React.ReactElement {
  loadPluginsForCodeEditor();

  const [editor, setEditor] = useState<IEditorProps>();
  const [ajv, setAjv] = useState<any>();
  const [jsonSchema, setJsonSchema] = useState(props.jsonSchema);
  const brickNextError = useRef(null);
  const compileSchema = useRef(false);
  const customCompletersIndex = useRef(null);

  useEffect(() => {
    let schemaValue = props.jsonSchema;
    if (
      ["brick_next", "brick_next_yaml"].includes(props.mode) &&
      !props.jsonSchema
    ) {
      schemaValue = storyboardJsonSchema;
    }
    setJsonSchema(schemaValue);
  }, [props.jsonSchema, props.mode]);

  const schemaLint = (data: any): Annotation[] => {
    let newAnnotations: Annotation[] = [];
    try {
      if (!compileSchema?.current) {
        ajv.compile(jsonSchema);
        compileSchema.current = true;
      }
      const valid = ajv.validate(props.schemaRef ?? jsonSchema, data);
      if (!valid) {
        if (!isEqual(brickNextError.current?.[0]?.raw, ajv.errors)) {
          const position = editor.getCursorPosition();
          const errorMessage = uniqWith(
            ajv.errors,
            (o, v: any) => v.dataPtah === o.dataPtah && v.message === o.message
          )
            ?.map((e) => {
              const field =
                e.dataPath[0] === "." ? e.dataPath.slice(1) : e.dataPath;
              return `${field ? field + ": " : ""}${e.message}`;
            })
            .join("\n");
          newAnnotations = [
            {
              row: position.row,
              column: position.column,
              type: "warning",
              text: errorMessage,
              raw: ajv.errors,
            } as Annotation,
          ];
          brickNextError.current = newAnnotations;
        } else {
          newAnnotations = brickNextError.current ?? [];
        }
      } else {
        brickNextError.current = null;
      }
    } catch (e) {
      // do nothing
    }
    return newAnnotations;
  };

  const yamlLint = (): Annotation[] => {
    // ace 官方库缺少 yaml 语法校验，这里主动校验。等 https://github.com/ajaxorg/ace/pull/3979 合并后可去掉
    let yamlLintAnnotations: Annotation[] = [];
    let schemaAnnotations: Annotation[] = [];
    if (props.value) {
      try {
        const data = yaml.safeLoad(props.value, {
          schema: yaml.JSON_SCHEMA,
          json: true,
        });
        if (jsonSchema) {
          schemaAnnotations = schemaLint(data);
        }
      } catch (e) {
        const lastRow = editor.getLastVisibleRow();
        yamlLintAnnotations = [
          {
            row: e.mark?.line > lastRow ? lastRow : e.mark?.line,
            column: e.mark?.column,
            type: "error",
            text: e.reason,
            raw: e,
          } as Annotation,
        ];
      }
    }
    return [...yamlLintAnnotations, ...schemaAnnotations];
  };

  useEffect(() => {
    if (editor) {
      if (isArray(props.customCompleters) && !isEmpty(props.customCompleters)) {
        if (isNil(customCompletersIndex.current)) {
          customCompletersIndex.current = editor.completers.length;
        }
        editor.completers.splice(customCompletersIndex.current, 1, {
          getCompletions(
            editor: IEditorProps,
            session: any,
            pos: any,
            prefix: string,
            callback: any
          ) {
            callback(
              null,
              map(props.customCompleters, (v) => {
                if (isString(v)) {
                  return {
                    caption: v,
                    value: v,
                  };
                } else {
                  return v;
                }
              })
            );
          },
        });
      } else {
        if (!isNil(customCompletersIndex.current)) {
          editor.completers.splice(customCompletersIndex.current, 1);
        }
      }
    }
  }, [editor, props.customCompleters]);

  useEffect(() => {
    if (
      (props.mode === "yaml" ||
        props.mode === "brick_next_yaml" ||
        props.mode === "cel_yaml") &&
      editor
    ) {
      const newAnnotations = yamlLint();
      const oldAnnotations = editor?.getSession()?.getAnnotations();
      if (!isEqual(oldAnnotations, newAnnotations)) {
        editor.getSession()?.setAnnotations(newAnnotations);
      }
    }
  }, [props.value, props.mode]);

  useEffect(() => {
    if (
      props.mode &&
      ["brick_next", "brick_next_yaml", "cel_yaml", "json", "yaml"].includes(
        props.mode
      ) &&
      jsonSchema
    ) {
      const ajv = new Ajv({
        schemaId: "auto",
        $data: true,
      });
      setAjv(ajv);
    }
  }, [props.mode, jsonSchema]);

  const handleOnBlur = (): void => {
    props.onBlur && props.onBlur();
  };

  const onButtonCopy = (text: string, success: boolean): void => {
    if (success) {
      message.success("复制成功");
    } else {
      message.error("复制失败");
    }
  };

  const handleExport = () => {
    FileSaver.saveAs(new Blob([props.value]), props.exportFileName);
  };

  useEffect(() => {
    if (editor) {
      // Shallow Copy.When there are multiple editor instances on one page,react-ace will provide the same completers reference for different editor instances.
      if (editor.completers) {
        editor.completers = [...editor.completers];
      }
      if (props.mode === "brick_next_yaml") {
        const customMode = new (getBrickNextYamlMode())();
        editor.getSession()?.setMode(customMode);
        if (!editor.completers?.includes(brickNextCompleters[0])) {
          editor.completers?.push(...brickNextCompleters);
        }
      } else if (props.mode === "brick_next") {
        const customMode = new (getBrickNextMode())();
        editor.getSession()?.setMode(customMode);
        if (!editor.completers?.includes(brickNextCompleters[0])) {
          editor.completers?.push(...brickNextCompleters);
        }
      } else if (props.mode === "terraform") {
        const customMode = new (getTerraformMode())();
        editor.getSession()?.setMode(customMode);
      } else if (props.mode === "cel_yaml") {
        const customMode = new (getCommonExpressionLanguageYamlMode())();
        editor.getSession()?.setMode(customMode);
      } else if (props.mode === "cel") {
        const customMode = new (getCommonExpressionLanguageMode())();
        editor.getSession()?.setMode(customMode);
      }
    }
  }, [editor, props.mode]);

  const onLoad = (editorInstance: IEditorProps) => {
    setEditor(editorInstance);
  };

  const onValidate = (err: Annotation[]) => {
    let newAnnotations = err;
    if (ajv && ["brick_next", "json"].includes(props.mode) && jsonSchema) {
      let schemaAnnotations: Annotation[] = [];
      let data = props.value;
      try {
        data = JSON.parse(props.value);
        schemaAnnotations = schemaLint(data);
      } catch (e) {
        // do nothing
      }
      if (!isEmpty(schemaAnnotations) && !err?.includes(schemaAnnotations[0])) {
        newAnnotations = [...err, ...schemaAnnotations];
        editor.getSession()?.setAnnotations(newAnnotations);
      }
    }
    props.onValidate?.(newAnnotations);
  };

  return (
    <div className={style.wrapper}>
      <AceEditor
        ref={ref}
        onLoad={onLoad}
        name={props.name ?? "commands-editor"}
        placeholder={props.placeholder}
        style={{
          width: "100%",
        }}
        theme={props.theme || "monokai"}
        mode={
          (props.mode === "brick_next" ||
          props.mode === "brick_next_yaml" ||
          props.mode === "cel_yaml" ||
          props.mode === "cel" ||
          props.mode === "terraform"
            ? "text"
            : props.mode) ?? "text"
        }
        value={props.value}
        setOptions={{
          readOnly: props.readOnly,
          showLineNumbers: props.showLineNumbers,
          maxLines: Number(props.maxLines),
          minLines: props.minLines,
          tabSize: props.tabSize,
          printMargin: props.printMargin,
          highlightActiveLine: props.highlightActiveLine,
          enableLiveAutocompletion: props.enableLiveAutocompletion,
        }}
        onChange={props.onChange}
        onValidate={onValidate}
        onBlur={handleOnBlur}
        // Tips: Automatically scrolling cursor into view after selection change this will be disabled in the next version set editor.$blockScrolling = Infinity to disable this message
        editorProps={{
          $blockScrolling: Infinity,
        }}
        showPrintMargin={props.showPrintMargin}
        className={style.aceContainer}
      />
      <div
        className={classNames(style.aceToolbar, shareStyle.toolbarContainer, {
          [style.themeTomorrow]: props.theme === "tomorrow",
          [style.themeGithub]: props.theme === "github",
        })}
      >
        {props.showCopyButton && (
          <Tooltip
            title={i18n.t(`${NS_CODE_EDITOR_COMPONENTS}:${K.COPY_TOOLTIP}`)}
          >
            <span className={shareStyle.copyIcon}>
              <Clipboard
                text={props.value}
                onCopy={onButtonCopy}
                icon={{ theme: "outlined" }}
              />
            </span>
          </Tooltip>
        )}
        {props.showExportButton && (
          <Tooltip
            title={i18n.t(`${NS_CODE_EDITOR_COMPONENTS}:${K.EXPORT_TOOLTIP}`)}
          >
            <span className={shareStyle.exportIcon}>
              <ExportOutlined onClick={handleExport} />
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export const CodeEditorItemWrapper = forwardRef(CodeEditorItem);

export function CodeEditor(props: CodeEditorProps): React.ReactElement {
  const [, setForceUpdate] = useState();
  const [hasError, setHasError] = useState(false);
  const [hasJsonSchemaError, setHasJsonSchemaError] = useState(false);

  const validatorFn = async (
    rule: any,
    value: string,
    callback: (message?: string) => void
  ) => {
    if (!hasError) {
      callback();
    } else {
      callback(
        hasJsonSchemaError
          ? "请填写正确的数据结构"
          : `请填写正确的 ${
              props.mode === "brick_next"
                ? "json"
                : props.mode === "brick_next_yaml" || props.mode === "cel_yaml"
                ? "yaml"
                : props.mode
            } 语法`
      );
    }
  };

  const builtInValidator: Pick<ValidationRule, "validator" | "message">[] = [
    { validator: validatorFn },
  ];

  useEffect(() => {
    if (props.formElement?.formUtils?.isFieldTouched(props.name)) {
      props.formElement?.formUtils?.validateFields([props.name], {
        force: true,
      });
      // only used for trigger children component re-render to update validate states
      setForceUpdate({} as any);
    }
  }, [hasError]);

  const onValidate = (err: Annotation[]): void => {
    const error = some(err, ["type", "error"]);
    const jsonSchemaError =
      props.validateJsonSchemaMode === "error" &&
      some(err, (v: any) => v.type === "error" && v.raw?.length > 0);
    setHasError(error);
    setHasJsonSchemaError(jsonSchemaError);
    props.onErrorChange && props.onErrorChange({ err, hasError: error });
  };

  return (
    <FormItemWrapper
      {...props}
      validator={
        props.validator
          ? builtInValidator.concat(props.validator as any)
          : builtInValidator
      }
      asyncForceRerender={true}
    >
      <CodeEditorItemWrapper {...props} onValidate={onValidate} />
    </FormItemWrapper>
  );
}
