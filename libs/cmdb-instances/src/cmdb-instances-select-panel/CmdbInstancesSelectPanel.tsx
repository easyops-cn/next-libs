import React, { useState, useEffect } from "react";
import classnames from "classnames";

import { CmdbModels, InstanceApi } from "@sdk/cmdb-sdk";
import { InstanceListTable } from "../instance-list-table";
import { InstanceListModal } from "../instance-list-modal/InstanceListModal";

import style from "./style.module.css";

export interface CmdbInstancesSelectPanelProps {
  objectMap: { [key: string]: Partial<CmdbModels.ModelCmdbObject> };
  objectId: string;
  value?: string[];
  onChange?: (instanceIdList: string[]) => void;
  instanceQuery?: any;
  fields?: string[];
  singleSelect?: boolean;
  addTitle?: React.ReactNode | string;
  modalTitle?: React.ReactNode | string;
  previewMaxNumber?: number;
}

export function CmdbInstancesSelectPanel(
  props: CmdbInstancesSelectPanelProps,
  ref: any
): React.ReactElement {
  const modelData = props.objectMap[props.objectId];

  const displayedSelectedInstancesMaxNumber = props.previewMaxNumber ?? 5;

  const [selectedInstanceIds, setSelectedInstanceIds] = useState([]);
  const [partialSelectedInstances, setPartialSelectedInstances] = useState([]);
  const [addInstancesModal, setAddInstancesModal] = useState({
    visible: false,
  });
  const [allSelectedInstancesModal, setAllSelectedInstancesModal] = useState({
    visible: false,
  });

  useEffect(() => {
    const fetchInstances = async () => {
      let instances: any[] = [];
      if (props.value?.length) {
        instances = (
          await InstanceApi.postSearch(props.objectId, {
            query: {
              instanceId: {
                $in: props.value,
              },
            },
            page: 1,
            page_size: props.value.length,
            // todo(ice): selected confirm with instances
            fields: { "*": true },
          })
        ).list;
      }

      setSelectedInstanceIds(instances.map((i) => i.instanceId));
      setPartialSelectedInstances(
        instances.slice(0, displayedSelectedInstancesMaxNumber)
      );
    };

    fetchInstances();
  }, [props.objectId, props.value]);

  const openAddInstancesModal = () => {
    setAddInstancesModal({ visible: true });
  };

  const closeAddInstancesModal = () => {
    setAddInstancesModal({ visible: false });
  };

  const openAllSelectedInstancesModal = () => {
    setAllSelectedInstancesModal({ visible: true });
  };

  const closeAllSelectedInstancesModal = () => {
    setAllSelectedInstancesModal({ visible: false });
  };

  const handleInstancesSelected = (selectedKeys: string[]) => {
    closeAddInstancesModal();

    setSelectedInstanceIds(selectedKeys);
    props.onChange?.(selectedKeys);
  };

  const fieldIds = modelData.attrList.map((attr) => attr.id);

  const showPreview =
    selectedInstanceIds.length > displayedSelectedInstancesMaxNumber;
  const cs = classnames({
    [style.selectedInstancesTableWrapper]: true,
    [style.withPreview]: showPreview,
  });

  return (
    <div className={style.wrapper} ref={ref}>
      <InstanceListModal
        objectMap={props.objectMap}
        objectId={props.objectId}
        visible={addInstancesModal.visible}
        title={props.modalTitle ?? `从 CMDB 中筛选${modelData.name}`}
        selectedRowKeys={selectedInstanceIds}
        onSelected={handleInstancesSelected}
        onCancel={closeAddInstancesModal}
        singleSelect={props.singleSelect}
        presetConfigs={{
          query: props.instanceQuery,
          fieldIds: props.fields,
        }}
      />
      <InstanceListModal
        objectMap={props.objectMap}
        objectId={props.objectId}
        visible={allSelectedInstancesModal.visible}
        title="查看所有选择实例"
        presetConfigs={{
          query: {
            instanceId: {
              $in: selectedInstanceIds,
            },
          },
        }}
        selectDisabled={true}
        onCancel={closeAllSelectedInstancesModal}
      />
      <a className={style.addButton} onClick={openAddInstancesModal}>
        {props.addTitle ?? "选择实例"}
      </a>
      <div className={cs}>
        <InstanceListTable
          idObjectMap={props.objectMap}
          modelData={modelData}
          instanceListData={{
            list: partialSelectedInstances,
          }}
          fieldIds={props.fields || fieldIds}
          selectDisabled={true}
          sortDisabled={true}
          configProps={{
            bodyStyle: { borderRadius: 6, backgroundColor: "white" },
            pagination: false,
          }}
        ></InstanceListTable>
        {showPreview && (
          <div
            className={style.showAllSelectedInstancesButton}
            onClick={openAllSelectedInstancesModal}
          >
            <a>查看全部 {selectedInstanceIds.length} 条数据</a>
          </div>
        )}
      </div>
    </div>
  );
}
