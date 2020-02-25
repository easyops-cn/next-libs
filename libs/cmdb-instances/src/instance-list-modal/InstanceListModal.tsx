import React, { useState } from "react";
import { Modal, Button, Icon } from "antd";

import { CmdbModels } from "@sdk/cmdb-sdk";
import { InstanceList } from "../instance-list/InstanceList";
import { InstanceListPresetConfigs } from "../instance-list-table/interfaces";
import { Query } from "../instance-list-table";

export interface InstanceListModalProps {
  objectMap: { [key: string]: Partial<CmdbModels.ModelCmdbObject> };
  objectId: string;
  visible: boolean;
  title: React.ReactNode | string;
  query?: any;
  presetConfigs?: InstanceListPresetConfigs;
  permission?: string[];
  aq?: Query[];
  searchDisabled?: boolean;
  advancedSearchDisabled?: boolean;
  aliveHostsDisabled?: boolean;
  relatedToMeDisabled?: boolean;
  moreButtonsDisabled?: boolean;
  sortDisabled?: boolean;
  selectDisabled?: boolean;
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

  const handleCancel = () => {
    // reset selected
    setSelectedInstanceListTemp(props.selectedRowKeys ?? []);
    props.onCancel();
  };

  const handleSelectionChange = (event: {
    selectedKeys: string[];
    selectedItems: any[];
  }) => {
    setSelectedInstanceListTemp(event.selectedKeys);
  };

  const presetConfigs = props.presetConfigs ?? {
    query: props.query,
    fieldIds: modelData.attrList.map(attr => attr.id)
  };

  const fixAliveHosts = presetConfigs.query?._agentStatus === "正常";

  React.useEffect(() => {
    if (props.selectedRowKeys) {
      setSelectedInstanceListTemp(props.selectedRowKeys);
    }
  }, [props.selectedRowKeys]);

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
            <Button key="back" onClick={handleCancel}>
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
      onCancel={handleCancel}
      destroyOnClose={true}
      footer={renderFooter()}
    >
      <div style={{ maxHeight: 720, overflow: "auto" }}>
        <InstanceList
          aq={props.aq}
          objectId={props.objectId}
          objectList={Object.values(props.objectMap)}
          presetConfigs={presetConfigs}
          permission={props.permission}
          aliveHosts={fixAliveHosts}
          fixAliveHosts={fixAliveHosts}
          searchDisabled={props.searchDisabled}
          advancedSearchDisabled={props.advancedSearchDisabled}
          aliveHostsDisabled={props.aliveHostsDisabled}
          relatedToMeDisabled={props.relatedToMeDisabled}
          moreButtonsDisabled={props.moreButtonsDisabled}
          sortDisabled={props.sortDisabled}
          selectDisabled={props.selectDisabled}
          selectedRowKeys={props.selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          pageSize={10}
        />
      </div>
    </Modal>
  );
}
