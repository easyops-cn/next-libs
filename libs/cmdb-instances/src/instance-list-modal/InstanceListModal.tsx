import React, { useState } from "react";
import { WarningOutlined } from "@ant-design/icons";
import { Modal, Button } from "antd";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { CmdbModels, InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";
import { InstanceList } from "../instance-list/InstanceList";
import { InstanceListPresetConfigs } from "../instance-list-table/interfaces";
import { Query } from "../instance-list-table";
import { addResourceBundle } from "../i18n";
addResourceBundle();
export interface InstanceListModalProps {
  objectMap: { [key: string]: Partial<CmdbModels.ModelCmdbObject> };
  objectId: string;
  visible: boolean;
  title: React.ReactNode | string;
  query?: any;
  presetConfigs?: InstanceListPresetConfigs;
  permission?: string[];
  aq?: Query[];
  instanceSourceQuery?: string;
  searchDisabled?: boolean;
  advancedSearchDisabled?: boolean;
  aliveHostsDisabled?: boolean;
  relatedToMeDisabled?: boolean;
  moreButtonsDisabled?: boolean;
  filterInstanceSourceDisabled?: boolean;
  sortDisabled?: boolean;
  selectDisabled?: boolean;
  singleSelect?: boolean;
  selectedRowKeys?: string[];
  onCancel: () => void;
  onSelected?: (instanceIds: any[]) => void;
  onSelectedV2?: (instanceDataList: any[]) => void;
  modalZIndex?: number;
  pageSize?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  defaultQuery?: { [fieldId: string]: any }[];
  enableSearchByApp?: boolean;
}

export function InstanceListModal(
  props: InstanceListModalProps
): React.ReactElement {
  const [selectedInstanceListTemp, setSelectedInstanceListTemp] = useState([]);

  // istanbul ignore next
  const handleOk = async () => {
    if (
      selectedInstanceListTemp.length &&
      selectedInstanceListTemp.every((i) => typeof i === "string")
    ) {
      const resp = await InstanceApi_postSearch(props.objectId, {
        query: {
          instanceId: {
            $in: selectedInstanceListTemp,
          },
        },
        page_size: selectedInstanceListTemp.length,
      });
      props.onSelected?.(selectedInstanceListTemp);
      props.onSelectedV2?.(resp.list);
      return;
    }

    props.onSelected?.(
      selectedInstanceListTemp.map(
        (selectedInstance) => selectedInstance.instanceId
      )
    );
    props.onSelectedV2?.(selectedInstanceListTemp);
  };
  // istanbul ignore next
  const handleCancel = () => {
    // reset selected
    setSelectedInstanceListTemp(props.selectedRowKeys ?? []);
    props.onCancel();
  };
  // istanbul ignore next
  const handleSelectionChange = (event: {
    selectedKeys: string[];
    selectedItems: any[];
  }) => {
    if (event.selectedItems.length < event.selectedKeys.length) {
      setSelectedInstanceListTemp(event.selectedKeys);
    } else {
      setSelectedInstanceListTemp(event.selectedItems);
    }
  };

  const presetConfigs = props.presetConfigs ?? {
    query: props.query,
  };

  const fixAliveHosts = presetConfigs.query?._agentStatus === "正常";

  React.useEffect(() => {
    if (props.selectedRowKeys) {
      setSelectedInstanceListTemp(props.selectedRowKeys.filter(Boolean));
    }
  }, [props.selectedRowKeys]);

  const renderFooter = (): React.ReactElement => {
    return (
      <>
        {props.singleSelect && selectedInstanceListTemp.length > 1 && (
          <span style={{ color: "#ff0016", marginRight: "20px" }}>
            <WarningOutlined
              style={{ color: "#ff0016", marginRight: "10px" }}
            />
            {i18n.t(
              `${NS_LIBS_CMDB_INSTANCES}:${K.ONLY_ONE_INSTANCE_TO_ALLOWED}`
            )}
          </span>
        )}
        {props.selectDisabled && (
          <Button key="back" onClick={props.onCancel}>
            {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLOSE}`)}
          </Button>
        )}
        {!props.selectDisabled && (
          <>
            <Button key="back" onClick={handleCancel}>
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CANCEL}`)}
            </Button>
            <Button
              key="submit"
              type="primary"
              onClick={handleOk}
              disabled={
                props.singleSelect && selectedInstanceListTemp.length > 1
              }
            >
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CONFIRM}`)}
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
      zIndex={props.modalZIndex ?? 1000}
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
          instanceSourceQuery={props.instanceSourceQuery}
          searchDisabled={props.searchDisabled}
          filterInstanceSourceDisabled={props.filterInstanceSourceDisabled}
          advancedSearchDisabled={props.advancedSearchDisabled}
          aliveHostsDisabled={props.aliveHostsDisabled}
          relatedToMeDisabled={props.relatedToMeDisabled}
          moreButtonsDisabled={props.moreButtonsDisabled}
          sortDisabled={props.sortDisabled}
          selectDisabled={props.selectDisabled}
          selectedRowKeys={props.selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          showSizeChanger={props.showSizeChanger}
          pageSizeOptions={props.pageSizeOptions}
          pageSize={props.pageSize || 10}
          defaultQuery={props.defaultQuery}
          enableSearchByApp={props.enableSearchByApp}
        />
      </div>
    </Modal>
  );
}
