import React, { useState } from "react";
import { Modal, Table } from "antd";
import { ColumnProps } from "antd/lib/table";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import {
  CmdbModels,
  InstanceApi_PostSearchResponseBody,
  InstanceApi_postSearch,
} from "@next-sdk/cmdb-sdk";
import { InstanceListTable } from "../instance-list-table/InstanceListTable";

import styles from "./model-relation-form.module.css";

import { ModifiedModelObjectRelation } from "@next-libs/cmdb-utils";

export interface ModelRelationFormProps {
  modelMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>;
  relation: Partial<ModifiedModelObjectRelation>;
  instanceListData: any[];
  value?: string[];
  onChange?: (event: any) => void;
}

export function ModelRelationForm(
  props: ModelRelationFormProps
): React.ReactElement {
  // eslint-disable-next-line no-console
  console.warn(
    "deprecated component `ModelRelationForm`, please use `CmdbInstancesSelectPanel` instead"
  );

  const oppositeModelData = props.modelMap[props.relation.right_object_id];

  const [visible, setVisible] = useState(false);
  const [
    modalInstanceListData,
    setModalInstanceListData,
  ] = useState<InstanceApi_PostSearchResponseBody>();

  let selectedInstanceListTemp: any[] = [];
  const [selectedInstanceList, setSelectedInstanceList] = useState(
    props.instanceListData || []
  );

  const fieldIds = oppositeModelData.attrList.map((attr) => attr.id);

  const computeFields = () => {
    // TODO(Cyril): compute custom fields
    return {
      "*": true,
    };
  };

  const openSelectInstanceModel = async () => {
    const instanceListData = await InstanceApi_postSearch(
      oppositeModelData.objectId,
      {
        page: 1,
        page_size: 10,
        fields: computeFields(),
      }
    );
    setModalInstanceListData(instanceListData);
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
    setSelectedInstanceList(selectedInstanceListTemp);
    props.onChange(
      selectedInstanceListTemp.map((instanceData) => instanceData.instanceId)
    );
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handlePaginationChange = async (event: {
    page: number;
    pageSize: number;
  }) => {
    const instanceListData = await InstanceApi_postSearch(
      oppositeModelData.objectId,
      {
        page: event.page,
        page_size: event.pageSize,
        fields: computeFields(),
      }
    );
    setModalInstanceListData(instanceListData);
  };

  const handleSelectionChange = (event: { selectedItems: any[] }) => {
    selectedInstanceListTemp = event.selectedItems;
  };

  const renderTable = (selectedInstanceList: any[]) => {
    const columns: ColumnProps<any>[] = oppositeModelData.attrList
      .filter((attr) => !["struct", "structs"].includes(attr.value.type))
      .slice(0, 7)
      .map((attr) => ({
        title: attr.name,
        key: attr.id,
        dataIndex: attr.id,
      }));

    return (
      <Table
        dataSource={selectedInstanceList}
        columns={columns}
        pagination={false}
        scroll={{ x: "max-content" }}
      />
    );
  };

  return (
    <div className={styles.modelRelationFormWrapper}>
      <Modal
        title={i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ITEM_ADD_IN_BATCHES}`, {
          name: props.relation.right_description,
        })}
        visible={visible}
        width={900}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose={true}
      >
        <InstanceListTable
          idObjectMap={props.modelMap}
          modelData={oppositeModelData}
          fieldIds={fieldIds}
          instanceListData={modalInstanceListData}
          onSelectionChange={handleSelectionChange}
          onPaginationChange={handlePaginationChange}
        ></InstanceListTable>
      </Modal>
      <a onClick={openSelectInstanceModel}>
        {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ADD}`)}
      </a>
      {renderTable(selectedInstanceList)}
    </div>
  );
}
