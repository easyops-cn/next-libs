import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useMemo,
  useCallback,
} from "react";
import AceEditor, { IEditorProps } from "react-ace";
import { isEqual, isEmpty, uniqWith, isString, map, some } from "lodash";
import Ajv from "ajv";
import { Annotation } from "brace";
import {
  ExpandAltOutlined,
  ExportOutlined,
  ShrinkOutlined,
} from "@ant-design/icons";
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
import { CodeEditorProps, ExtendedMarker } from "../interfaces";
import { loadPluginsForCodeEditor } from "../brace";
import { getCommonExpressionLanguageYamlMode } from "../custom-mode/CommonExpressionLanguageYamlMode";
import { getCommonExpressionLanguageMode } from "../custom-mode/CommonExpressionLanguageMode";
import { CommonExpressionLanguageCompleter } from "../custom-mode/CommonExpressionLanguageRules";
import { getHighlightMarkers } from "./getHighlightMarkers";
import { getClickableMarker } from "./getClickableMarker";
import ResizeObserver from "resize-observer-polyfill";
import style from "./CodeEditor.module.css";
import shareStyle from "../share.module.css";
import { addResourceBundle } from "../i18n";
addResourceBundle();

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
  const containerRef = useRef<HTMLDivElement>();
  const [tempOverrideMode, setTempOverrideMode] = useState<string>();
  const value = props.value ?? "";

  useEffect(() => {
    let schemaValue = props.jsonSchema;
    if (
      ["brick_next", "brick_next_yaml"].includes(props.mode) &&
      !props.jsonSchema
    ) {
      schemaValue = storyboardJsonSchema;
    }
    if (!isEqual(schemaValue, jsonSchema)) {
      setJsonSchema(schemaValue);
    }
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
              type: props.validateJsonSchemaMode,
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
    if (value) {
      try {
        if (!props.enableUseMultipleYamlFiles) {
          const data = yaml.safeLoad(value, {
            schema: yaml.JSON_SCHEMA,
            json: true,
          });
          if (jsonSchema) {
            schemaAnnotations = schemaLint(data);
          }
        } else {
          yaml.safeLoadAll(
            value,
            function (doc) {
              if (jsonSchema) {
                schemaAnnotations.push(...schemaLint(doc));
              }
            },
            {
              schema: yaml.JSON_SCHEMA,
              json: true,
            }
          );
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

  const localCompleter = useMemo(
    () => ({
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
    }),
    [props.customCompleters]
  );

  useEffect(() => {
    if (editor && editor.completers && props.customCompleters?.length) {
      editor.completers.push(localCompleter);
    }

    return () => {
      if (editor && editor.completers) {
        const index = editor.completers.indexOf(localCompleter);
        if (index !== -1) {
          editor.completers.splice(index, 1);
        }
      }
    };
  }, [editor, localCompleter, props.customCompleters]);

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
  }, [value, props.mode]);

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

  useEffect(() => {
    // temporarily override mode to trigger onValidate, when jsonSchema updated
    if (editor && props.mode === "json") {
      setTempOverrideMode("text");
    }
  }, [jsonSchema]);

  useEffect(() => {
    if (tempOverrideMode) {
      setTempOverrideMode(undefined);
    }
  }, [tempOverrideMode]);

  const handleOnBlur = (): void => {
    props.onBlur && props.onBlur();
  };

  const onButtonCopy = (text: string, success: boolean): void => {
    if (success) {
      message.success(i18n.t(`${NS_CODE_EDITOR_COMPONENTS}:${K.COPY_SUCCESS}`));
    } else {
      message.error(i18n.t(`${NS_CODE_EDITOR_COMPONENTS}:${K.COPY_ERROR}`));
    }
  };

  const handleExport = () => {
    FileSaver.saveAs(new Blob([value]), props.exportFileName);
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
        if (
          !editor.completers?.includes(CommonExpressionLanguageCompleter[0])
        ) {
          editor.completers?.push(...CommonExpressionLanguageCompleter);
        }
      } else if (props.mode === "cel") {
        const customMode = new (getCommonExpressionLanguageMode())();
        editor.getSession()?.setMode(customMode);
        if (
          !editor.completers?.includes(CommonExpressionLanguageCompleter[0])
        ) {
          editor.completers?.push(...CommonExpressionLanguageCompleter);
        }
      }
    }
  }, [editor, props.mode]);

  const onLoad = (editorInstance: IEditorProps) => {
    setEditor(editorInstance);
  };

  const onValidate = (err: Annotation[]) => {
    let newAnnotations = err;
    if (
      ajv &&
      ["brick_next", "json"].includes(tempOverrideMode || props.mode) &&
      jsonSchema
    ) {
      let schemaAnnotations: Annotation[] = [];
      let data = value;
      try {
        data = JSON.parse(value);
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

  const [markers, setMarkers] = useState<ExtendedMarker[]>();

  const findHighlightTokens = useCallback(() => {
    setMarkers(
      getHighlightMarkers({
        editor,
        markerClassMap: {
          default: style.aceMarkerOfHighlight,
          warn: style.aceMarkerOfWarn,
          error: style.aceMarkerOfError,
        },
        highlightTokens: props.highlightTokens,
      })
    );
  }, [editor, props.highlightTokens]);

  const handleChange = useCallback(
    (value: string) => {
      props.onChange?.(value);
      findHighlightTokens();
    },
    [props.onChange, findHighlightTokens]
  );

  useEffect(() => {
    findHighlightTokens();
  }, [value, findHighlightTokens]);

  const markersRef = useRef<ExtendedMarker[]>();
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    const clickableTypes = props.highlightTokens
      ?.filter((item) => item.clickable)
      .map((item) => item.type);
    if (!editor || !clickableTypes?.length) {
      return;
    }
    const onMouseMove = (e: any): void => {
      editor.renderer.setCursorStyle(
        getClickableMarker(e, clickableTypes, markersRef.current)
          ? "pointer"
          : ""
      );
    };
    const onMouseOut = (): void => {
      editor.renderer.setCursorStyle("");
    };
    const onClick = (e: any): void => {
      const marker = getClickableMarker(e, clickableTypes, markersRef.current);
      if (marker) {
        // Prevent the default behavior of multi-selection.
        editor.session.selection.toSingleRange();
        props.onClickHighlightToken?.({
          type: marker.highlightType,
          value: marker.identifier,
        });
      }
    };
    editor.on("mousemove", onMouseMove);
    editor.on("mouseout", onMouseOut);
    editor.on("click", onClick);
    return () => {
      editor.off("mousemove", onMouseMove);
      editor.off("mouseout", onMouseOut);
      editor.off("click", onClick);
    };
  }, [editor, props.highlightTokens, props.onClickHighlightToken]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      editor?.resize();
    });
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [editor]);

  const [expanded, setExpanded] = useState(false);
  const [expandedLines, setExpandedLines] = useState(0);

  const handleExpand = useCallback(() => {
    setExpanded(true);
    setExpandedLines(Math.floor((window.innerHeight - 40) / 16));
  }, []);

  const handleCollapse = useCallback(() => {
    setExpanded(false);
  }, []);

  useEffect(() => {
    if (expanded) {
      const fn = (e: KeyboardEvent): void => {
        if (e.key === "Escape" || e.key === "Esc") {
          window.removeEventListener("keydown", fn);
          setExpanded(false);
        }
      };
      window.addEventListener("keydown", fn);
      return () => {
        window.removeEventListener("keydown", fn);
      };
    }
  }, [expanded]);

  const tooltipPlacement = expanded ? "bottom" : "top";

  return (
    <div
      className={classNames(style.wrapper, {
        [style.expanded]: expanded,
      })}
      ref={containerRef}
    >
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
          (tempOverrideMode ||
            (props.mode === "brick_next" ||
            props.mode === "brick_next_yaml" ||
            props.mode === "cel_yaml" ||
            props.mode === "cel" ||
            props.mode === "terraform"
              ? "text"
              : props.mode === "disable_lint_yaml"
              ? "yaml"
              : props.mode)) ??
          "text"
        }
        value={value}
        setOptions={{
          readOnly: props.readOnly,
          showLineNumbers: props.showLineNumbers,
          tabSize: props.tabSize,
          printMargin: props.printMargin,
          highlightActiveLine: props.highlightActiveLine,
          enableLiveAutocompletion: props.enableLiveAutocompletion,
          showGutter: props.showGutter,
          wrap: props.wrap,
          ...(expanded
            ? {
                maxLines: expandedLines,
                minLines: expandedLines,
              }
            : {
                maxLines: Number(props.maxLines),
                minLines: props.minLines,
              }),
        }}
        onChange={handleChange}
        onValidate={onValidate}
        onBlur={handleOnBlur}
        // Tips: Automatically scrolling cursor into view after selection change this will be disabled in the next version set editor.$blockScrolling = Infinity to disable this message
        editorProps={{
          $blockScrolling: Infinity,
        }}
        showPrintMargin={props.showPrintMargin}
        className={style.aceContainer}
        markers={markers}
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
            placement={tooltipPlacement}
          >
            <span className={shareStyle.copyIcon}>
              <Clipboard
                text={value}
                onCopy={onButtonCopy}
                icon={{ theme: "outlined" }}
              />
            </span>
          </Tooltip>
        )}
        {props.showExportButton && (
          <Tooltip
            title={i18n.t(`${NS_CODE_EDITOR_COMPONENTS}:${K.EXPORT_TOOLTIP}`)}
            placement={tooltipPlacement}
          >
            <span className={shareStyle.exportIcon}>
              <ExportOutlined onClick={handleExport} />
            </span>
          </Tooltip>
        )}
        {props.showExpandButton && (
          <Tooltip
            title={i18n.t(
              `${NS_CODE_EDITOR_COMPONENTS}:${expanded ? K.COLLAPSE : K.EXPAND}`
            )}
            placement={tooltipPlacement}
          >
            <span className={shareStyle.expandIcon}>
              {expanded ? (
                <ShrinkOutlined onClick={handleCollapse} />
              ) : (
                <ExpandAltOutlined onClick={handleExpand} />
              )}
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

  const validatorFn = (
    rule: any,
    value: string,
    callback: (message?: string) => void
  ): void => {
    if (!hasError) {
      callback();
    } else {
      callback(
        hasJsonSchemaError
          ? i18n.t(
              `${NS_CODE_EDITOR_COMPONENTS}:${K.PLEASE_FILL_IN_THE_CORRECT_DATA_STRUCTURE}`
            )
          : i18n.t(
              `${NS_CODE_EDITOR_COMPONENTS}:${K.PLEASE_FILL_IN_THE_CORRECT_GRAMMAR}`,
              {
                mode:
                  props.mode === "brick_next"
                    ? "json"
                    : props.mode === "brick_next_yaml" ||
                      props.mode === "cel_yaml"
                    ? "yaml"
                    : props.mode,
              }
            )
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
  }, [hasError, hasJsonSchemaError]);

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
      <CodeEditorItemWrapper
        {...props}
        onValidate={props.onValidate ? props.onValidate : onValidate}
      />
    </FormItemWrapper>
  );
}
