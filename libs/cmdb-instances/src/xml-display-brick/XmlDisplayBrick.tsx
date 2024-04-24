import React, { useMemo, useState } from "react";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { Modal, Tooltip } from "antd";
import { FileSearchOutlined } from "@ant-design/icons";
import classnames from "classnames";
import styles from "./XmlDisplayBrick.module.css";
import { CodeDisplay } from "@next-libs/code-display-components";

interface XmlDisplayBrickProps {
  value: string;
  isNumControlEllipsis?: boolean;
  num?: number;
}

export function XmlDisplayBrick(
  props: XmlDisplayBrickProps
): React.ReactElement {
  const { value, isNumControlEllipsis, num = 50 } = props;
  const [visible, setVisible] = useState(false);

  const displayValue = useMemo(() => {
    return isNumControlEllipsis && value?.length > num
      ? value.slice(0, num) + "..."
      : value;
  }, [value, isNumControlEllipsis, num]);

  return value ? (
    <div>
      <div
        className={classnames({
          [styles.xmlWrapper]: !isNumControlEllipsis,
        })}
      >
        <span
          className={classnames({
            [styles.text]: !isNumControlEllipsis,
          })}
        >
          {displayValue}
        </span>
        <a onClick={() => setVisible(true)}>
          <Tooltip
            placement="top"
            title={i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.VIEW}`)}
          >
            <FileSearchOutlined style={{ marginLeft: 6 }} />
          </Tooltip>
        </a>
      </div>
      <Modal
        width="860px"
        title="XML"
        visible={visible}
        zIndex={1000}
        mask={true}
        footer={null}
        onCancel={() => setVisible(false)}
      >
        <CodeDisplay
          language="xml"
          value={value}
          maxLines={20}
          minLines={5}
          showLineNumber={true}
          showExportButton={false}
          showCopyButton={true}
        />
      </Modal>
    </div>
  ) : null;
}
