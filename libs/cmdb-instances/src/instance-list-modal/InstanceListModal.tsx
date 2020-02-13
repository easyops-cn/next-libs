import React, { useState } from "react";
import { Modal, Button, Icon } from "antd";

import { InstanceList } from "../instance-list/InstanceList";
import { Query } from "../instance-list-table";
import { CmdbModels } from "@sdk/cmdb-sdk";

export interface InstanceListModalProps {
  objectMap: { [key: string]: Partial<CmdbModels.ModelCmdbObject> };
  objectId: string;
  visible: boolean;
  title: string;
  query?: any;
  aq?: Query[];
  selectDisabled?: boolean;
  sortDisabled?: boolean;
  singleSelect?: boolean;
  selectedRowKeys?: string[];
  onCancel: () => void;
  onSelected?: (instanceList: any[]) => void;
}

export function InstanceListModal(
  props: InstanceListModalProps
): React.ReactElement {
  const modelData = props.objectMap[props.objectId];

  const [selectedInstanceListTemp, setSelectedInstanceListTemp] = useState([]);

  const handleOk = () => {
    props.onSelected?.(selectedInstanceListTemp);
  };

  const handleSelectionChange = (event: {
    selectedKeys: string[];
    selectedItems: any[];
  }) => {
    setSelectedInstanceListTemp(event.selectedKeys);
  };

  const presetConfigs = {
    query: props.query,
    fieldIds: modelData.attrList.map(attr => attr.id)
  };

  const renderFooter = (): React.ReactElement => {
    return (
      <>
        {props.singleSelect && selectedInstanceListTemp.length > 1 && (
          <span style={{ color: "#ff0016", marginRight: "20px" }}>
            <Icon
              type="warning"
              style={{ color: "#ff0016", marginRight: "10px" }}
            />
            只允许选择一个实例
          </span>
        )}
        {props.selectDisabled && (
          <Button key="back" onClick={props.onCancel}>
            关闭
          </Button>
        )}
        {!props.selectDisabled && (
          <>
            <Button key="back" onClick={props.onCancel}>
              取消
            </Button>
            <Button
              key="submit"
              type="primary"
              onClick={handleOk}
              disabled={
                props.singleSelect && selectedInstanceListTemp.length > 1
              }
            >
              确认
            </Button>
          </>
        )}
      </>
    );
  };

  return (
    <Modal
      title={props.title}
      visible={props.visible}
      width={900}
      onOk={handleOk}
      onCancel={props.onCancel}
      destroyOnClose={true}
      footer={renderFooter()}
    >
      <div style={{ maxHeight: 700, overflow: "auto" }}>
        <InstanceList
          aq={props.aq}
          objectId={props.objectId}
          objectList={Object.values(props.objectMap)}
          presetConfigs={presetConfigs}
          selectDisabled={props.selectDisabled}
          selectedRowKeys={props.selectedRowKeys}
          sortDisabled={props.sortDisabled}
          onSelectionChange={handleSelectionChange}
          pageSize={10}
        />
      </div>
    </Modal>
  );
}
