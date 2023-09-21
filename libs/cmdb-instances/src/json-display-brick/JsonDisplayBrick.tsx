import React, { useMemo, useState } from "react";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { CodeEditorItem } from "@next-libs/code-editor-components";
import { Modal, Tooltip } from "antd";
import { FileSearchOutlined } from "@ant-design/icons";
import classnames from "classnames";
import styles from "./JsonDisplayBrick.module.css";

interface JsonDisplayBrickProps {
  value: string | Record<string, any>;
  name: string;
  isNumControlEllipsis?: boolean;
  num?: number;
}

export function JsonDisplayBrick(
  props: JsonDisplayBrickProps
): React.ReactElement {
  const { name, value, isNumControlEllipsis, num = 50 } = props;
  const [visible, setVisible] = useState(false);

  const displayValue = useMemo(() => {
    const _value = JSON.stringify(value, null, 0);
    return isNumControlEllipsis && _value.length > num
      ? _value.slice(0, num) + "..."
      : _value;
  }, [value, isNumControlEllipsis, num]);
  return value ? (
    <div>
      <div
        className={classnames({
          [styles.jsonWrapper]: !isNumControlEllipsis,
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
        title={name}
        visible={visible}
        zIndex={1000}
        mask={true}
        footer={null}
        onCancel={() => setVisible(false)}
      >
        <CodeEditorItem
          mode="json"
          value={JSON.stringify(value, null, 2)}
          maxLines={30}
          min={10}
          showCopyButton={true}
          readOnly={true}
        />
      </Modal>
    </div>
  ) : null;
}
