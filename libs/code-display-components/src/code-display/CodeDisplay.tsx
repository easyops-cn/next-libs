import React, { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import classNames from "classnames";
import styles from "./CodeDisplay.module.css";
import { Clipboard } from "@next-libs/clipboard";
import { ExportOutlined } from "@ant-design/icons";
import { message, Tooltip } from "antd";
import { isNumber } from "lodash";
import shareStyle from "../share.module.css";
import FileSaver from "file-saver";
import ResizeObserver from "resize-observer-polyfill";
import i18n from "i18next";
import { NS_CODE_DISPLAY_COMPONENTS, K } from "../i18n/constants";
import { addResourceBundle } from "../i18n";

addResourceBundle();

interface CodeDisplayProps {
  language: string;
  showLineNumber: boolean;
  value: string;
  maxLines?: number;
  minLines?: number;
  showExportButton?: boolean;
  showCopyButton?: boolean;
  exportFileName?: string;
}

export function CodeDisplay(props: CodeDisplayProps): React.ReactElement {
  const codeElement = useRef<HTMLElement | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (codeElement.current) {
      Prism.highlightElement(codeElement.current);
    }
  }, [props.value, props.language, props.showLineNumber]);

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
    // 此处当该构件插入 Modal／Drawer／Tabs 等元素中可能一开始不可见，会导致 line numbers 插件不能正确渲染行号高度。
    // 需要在可见之后手动 dispatch resize 事件去触发 line numbers 插件的 resizeElements 方法。
    // Ref: https://github.com/PrismJS/prism/pull/2125
    // Ref: https://github.com/PrismJS/prism/blame/a5107d5c284126143ce9405025946e21bb0b956e/plugins/line-numbers/prism-line-numbers.js#L75
    const resizeObserver = new ResizeObserver(() => {
      Prism.plugins.lineNumbers.assumeViewportIndependence = false;
      window.dispatchEvent(new Event("resize"));
      Prism.plugins.lineNumbers.assumeViewportIndependence = true;
    });
    resizeObserver.observe(codeContainerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={styles.customCodeDisplay} ref={codeContainerRef}>
      <pre
        className={classNames({
          "line-numbers": props.showLineNumber && props.value,
        })}
        style={{
          whiteSpace: "pre-wrap",
          margin: 0,
          ...(isNumber(props.maxLines)
            ? {
                maxHeight: props.maxLines * 16,
              }
            : {}),
          ...(isNumber(props.minLines)
            ? {
                minHeight: props.minLines * 16,
              }
            : {}),
        }}
      >
        {props.showLineNumber && <div className={styles.counterBg}></div>}
        <code
          className={`language-${props.language}`}
          style={{ whiteSpace: "pre-wrap" }}
          ref={codeElement}
        >
          {props.value}
        </code>
      </pre>
      <div
        className={classNames(
          styles.displayToolbar,
          shareStyle.toolbarContainer
        )}
      >
        {props.showCopyButton && (
          <Tooltip
            title={i18n.t(`${NS_CODE_DISPLAY_COMPONENTS}:${K.COPY_TOOLTIP}`)}
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
            title={i18n.t(`${NS_CODE_DISPLAY_COMPONENTS}:${K.EXPORT_TOOLTIP}`)}
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
