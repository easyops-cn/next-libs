import React, { useState, useEffect } from "react";
import { Modal, Spin } from "antd";

import { InstanceListTable } from "../instance-list-table/InstanceListTable";
import { CmdbModels, InstanceApi } from "@sdk/cmdb-sdk";

export interface InstanceListModalProps {
  objectMap: { [key: string]: Partial<CmdbModels.ModelCmdbObject> };
  objectId: string;
  visible: boolean;
  title: string;
  query?: any;
  selectDisabled?: boolean;
  onCancel: () => void;
  onSelected?: (instanceList: any[]) => void;
}

export function InstanceListModal(
  props: InstanceListModalProps
): React.ReactElement {
  const modelData = props.objectMap[props.objectId];

  const [instanceListData, setInstanceListData] = useState();
  const [fetching, setFetching] = useState(false);

  let selectedInstanceListTemp: any[] = [];

  const computeFields = () => {
    return { "*": true };
  };

  useEffect(() => {
    const fetchInstanceListData = async () => {
      setFetching(true);
      const instanceListData = await InstanceApi.postSearch(
        modelData.objectId,
        {
          query: props.query || {},
          fields: computeFields(),
          page: 1,
          page_size: 10
        }
      );

      setInstanceListData(instanceListData);
      setFetching(false);
    };

    if (props.visible) {
      fetchInstanceListData();
    }
  }, [props.visible, props.objectId]);

  const handleOk = () => {
    if (props.onSelected) {
      props.onSelected(selectedInstanceListTemp);
    }
  };

  const handleSelectionChange = (event: { selectedItems: any[] }) => {
    selectedInstanceListTemp = event.selectedItems;
  };

  const handlePaginationChange = async (event: {
    page: number;
    pageSize: number;
  }) => {
    const instanceListData = await InstanceApi.postSearch(props.objectId, {
      query: props.query || {},
      fields: computeFields(),
      page: event.page,
      page_size: event.pageSize
    });
    setInstanceListData(instanceListData);
  };

  const presetConfigs = {
    fieldIds: modelData.attrList.map(attr => attr.id)
  };

  return (
    <Modal
      title={props.title}
      visible={props.visible}
      width={900}
      onOk={handleOk}
      onCancel={props.onCancel}
      destroyOnClose={true}
    >
      {fetching ? (
        <Spin />
      ) : (
        <InstanceListTable
          idObjectMap={props.objectMap}
          modelData={modelData}
          instanceListData={instanceListData || { list: [] }}
          presetConfigs={presetConfigs}
          selectDisabled={props.selectDisabled}
          onSelectionChange={handleSelectionChange}
          onPaginationChange={handlePaginationChange}
        ></InstanceListTable>
      )}
    </Modal>
  );
}
