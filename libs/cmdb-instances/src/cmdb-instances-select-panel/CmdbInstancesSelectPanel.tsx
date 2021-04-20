import React, { useState, useEffect } from "react";
import classnames from "classnames";

import { CmdbModels, InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";
import { InstanceListTable } from "../instance-list-table";
import { InstanceListModal } from "../instance-list-modal/InstanceListModal";

import style from "./style.module.css";

export interface CmdbInstancesSelectPanelProps {
  objectMap: { [key: string]: Partial<CmdbModels.ModelCmdbObject> };
  objectId: string;
  value?: string[];
  onChange?: (instanceList: any[]) => void;
  instanceQuery?: any;
  fields?: string[];
  singleSelect?: boolean;
  addTitle?: React.ReactNode | string;
  modalTitle?: React.ReactNode | string;
  previewMaxNumber?: number;
  addInstancesModalPageSize?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
}

export function CmdbInstancesSelectPanel(
  props: CmdbInstancesSelectPanelProps,
  ref: any
): React.ReactElement {
  const modelData = props.objectMap[props.objectId];

  const displayedSelectedInstancesMaxNumber = props.previewMaxNumber ?? 5;

  const [selectedInstanceList, setSelectedInstanceList] = useState([]);
  const [partialSelectedInstances, setPartialSelectedInstances] = useState([]);
  const [addInstancesModal, setAddInstancesModal] = useState({
    visible: false,
  });
  const [allSelectedInstancesModal, setAllSelectedInstancesModal] = useState({
    visible: false,
  });

  const fetchInstances = async (instanceIdList: string[]): Promise<any[]> => {
    let instances: any[] = [];
    if (instanceIdList?.length) {
      instances = (
        await InstanceApi_postSearch(props.objectId, {
          query: {
            instanceId: {
              $in: instanceIdList,
            },
          },
          page: 1,
          page_size: instanceIdList.length,
          // todo(ice): selected confirm with instances
          fields: { "*": true },
        })
      ).list;
    }

    return instances;
  };

  useEffect(() => {
    const initInstances = async (): Promise<void> => {
      const instances = await fetchInstances(props.value);

      setSelectedInstanceList(instances);
      setPartialSelectedInstances(
        instances.slice(0, displayedSelectedInstancesMaxNumber)
      );
    };

    initInstances();
  }, [props.objectId]);

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

  const handleInstancesSelected = async (selectedKeys: string[]) => {
    closeAddInstancesModal();

    const instances = await fetchInstances(selectedKeys);
    setSelectedInstanceList(instances);
    setPartialSelectedInstances(
      instances.slice(0, displayedSelectedInstancesMaxNumber)
    );

    props.onChange?.(instances);
  };

  const fieldIds = modelData.attrList.map((attr) => attr.id);

  const showPreview =
    selectedInstanceList.length > displayedSelectedInstancesMaxNumber;
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
        selectedRowKeys={selectedInstanceList.map(
          (instance) => instance.instanceId
        )}
        onSelected={handleInstancesSelected}
        onCancel={closeAddInstancesModal}
        singleSelect={props.singleSelect}
        presetConfigs={{
          query: props.instanceQuery,
          fieldIds: props.fields,
        }}
        pageSize={props.addInstancesModalPageSize}
        showSizeChanger={props.showSizeChanger}
        pageSizeOptions={props.pageSizeOptions}
      />
      <InstanceListModal
        objectMap={props.objectMap}
        objectId={props.objectId}
        visible={allSelectedInstancesModal.visible}
        title="查看所有选择实例"
        presetConfigs={{
          query: {
            instanceId: {
              $in: selectedInstanceList.map((instance) => instance.instanceId),
            },
          },
        }}
        selectDisabled={true}
        onCancel={closeAllSelectedInstancesModal}
      />
      <a
        className={style.addButton}
        onClick={openAddInstancesModal}
        style={{ marginBottom: "12px" }}
      >
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
            pagination: false,
          }}
        ></InstanceListTable>
        {showPreview && (
          <div
            className={style.showAllSelectedInstancesButton}
            onClick={openAllSelectedInstancesModal}
          >
            <a>查看全部 {selectedInstanceList.length} 条数据</a>
          </div>
        )}
      </div>
    </div>
  );
}
