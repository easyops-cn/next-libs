import React, { useState, useEffect } from "react";
import classnames from "classnames";

import {
  CmdbModels,
  InstanceApi_postSearch,
  CmdbObjectApi_getObjectRef,
} from "@next-sdk/cmdb-sdk";
import { InstanceListTable } from "../instance-list-table";
import { InstanceListModal } from "../instance-list-modal/InstanceListModal";
import {
  modifyModelData,
  ModifiedModelObjectRelation,
} from "@next-libs/cmdb-utils";
import style from "./style.module.css";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { keyBy, isEqual, isNil, isObject, isEmpty } from "lodash";
import { Spin } from "antd";

export interface BaseCmdbInstancesSelectPanelProps {
  objectId: string;
  value?: any[];
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
  isOperate?: boolean; //cmdb实例列表支持删除实例
  showDetailUrl?: boolean;
  isFilterView?: boolean; //是否过滤视图属性
  onFetchedInstances?: (instanceList: any[]) => void; // objectId改变后触发
  relation?: Partial<ModifiedModelObjectRelation>;
  searchDisabled?: boolean;
  advancedSearchDisabled?: boolean;
}

export interface CmdbInstancesSelectPanelPropsWithObjectMap
  extends BaseCmdbInstancesSelectPanelProps {
  objectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>;
  ipCopy?: boolean;
}

export interface CmdbInstancesSelectPanelPropsWithModelData
  extends BaseCmdbInstancesSelectPanelProps {
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  ipCopy?: boolean;
}

export type CmdbInstancesSelectPanelProps =
  | CmdbInstancesSelectPanelPropsWithObjectMap
  | CmdbInstancesSelectPanelPropsWithModelData;

export function isCmdbInstancesSelectPanelPropsWithObjectMap(
  props: CmdbInstancesSelectPanelProps
): props is CmdbInstancesSelectPanelPropsWithObjectMap {
  return !isNil(
    (props as CmdbInstancesSelectPanelPropsWithObjectMap).objectMap
  );
}

export function CmdbInstancesSelectPanel(
  props: CmdbInstancesSelectPanelProps,
  ref: any
): React.ReactElement {
  let modelData: Partial<CmdbModels.ModelCmdbObject>;
  if (isCmdbInstancesSelectPanelPropsWithObjectMap(props)) {
    modelData = props.objectMap[props.objectId];
  } else {
    modelData = props.modelData;
  }

  if (props.isFilterView) {
    //过滤掉视图不可见字段
    const hideModelData = modelData?.view?.hide_columns || [];
    modelData = {
      ...modelData,
      attrList: modelData.attrList.filter(
        (item: any) => !hideModelData.includes(item.id)
      ),
      relation_list: modelData.relation_list.filter(
        (item: any) =>
          !(
            (hideModelData.includes(item.left_id) &&
              item.left_object_id === props.objectId) ||
            (hideModelData.includes(item.right_id) &&
              item.right_object_id === props.objectId)
          )
      ),
    };
  }

  const displayedSelectedInstancesMaxNumber = props.previewMaxNumber ?? 5;

  const [selectedInstanceList, setSelectedInstanceList] = useState([]);
  const [partialSelectedInstances, setPartialSelectedInstances] = useState([]);
  const [addInstancesModal, setAddInstancesModal] = useState({
    visible: false,
  });
  const [allSelectedInstancesModal, setAllSelectedInstancesModal] = useState({
    visible: false,
  });
  const [modelMap, setModelMap] = useState({});

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
  const loadedInstanceIds =
    props.value?.map((i) => (isObject(i) ? (i as any).instanceId : i)) || [];

  useEffect(() => {
    const getModelMap = async (): Promise<void> => {
      let modelMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>;

      if (isCmdbInstancesSelectPanelPropsWithObjectMap(props)) {
        modelMap = props.objectMap;
      } else {
        const { data } = await CmdbObjectApi_getObjectRef({
          ref_object: props.objectId,
        });
        modelMap = keyBy(data, "objectId");
      }
      setModelMap(modelMap);
    };
    getModelMap();
  }, [props.objectId]);

  useEffect(() => {
    let instances = [];

    const initInstances = async (): Promise<void> => {
      instances = await fetchInstances(loadedInstanceIds);
      setSelectedInstanceList(instances);
      setPartialSelectedInstances(
        props?.isOperate
          ? instances
          : instances.slice(0, displayedSelectedInstancesMaxNumber)
      );
      props.onFetchedInstances?.(instances);
    };
    if (!isEmpty(loadedInstanceIds)) {
      initInstances();
    } else {
      setSelectedInstanceList([]);
      setPartialSelectedInstances([]);
    }
  }, [loadedInstanceIds.join()]);

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
      props?.isOperate
        ? instances
        : instances.slice(0, displayedSelectedInstancesMaxNumber)
    );

    props.onChange?.(instances);
  };

  const fieldIds = modifyModelData(modelData).attrList.map(
    (attr: any) => attr.id
  );
  const showPreview =
    selectedInstanceList.length > displayedSelectedInstancesMaxNumber;
  const cs = classnames({
    [style.selectedInstancesTableWrapper]: true,
    [style.withPreview]: showPreview,
  });
  const { relation } = props;
  let relationLimit;
  if (relation?.right_max === 1) {
    relationLimit = { [relation.right_id]: { $size: { $lt: 1 } } };
  }
  const query = props.instanceQuery ?? relationLimit;
  return (
    <div className={style.wrapper} ref={ref}>
      <InstanceListModal
        objectMap={modelMap}
        objectId={props.objectId}
        visible={addInstancesModal.visible}
        title={
          props.modalTitle ??
          i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.FILTER_FROM_CMDB}`, {
            name: modelData.name,
          })
        }
        selectedRowKeys={selectedInstanceList.map(
          (instance) => instance.instanceId
        )}
        onSelected={handleInstancesSelected}
        onCancel={closeAddInstancesModal}
        singleSelect={props.singleSelect}
        presetConfigs={{
          query,
          fieldIds: props.fields,
        }}
        pageSize={props.addInstancesModalPageSize}
        showSizeChanger={props.showSizeChanger}
        pageSizeOptions={props.pageSizeOptions}
        searchDisabled={props.searchDisabled}
        advancedSearchDisabled={props.advancedSearchDisabled}
        ipCopy={props.ipCopy}
      />
      <InstanceListModal
        objectMap={modelMap}
        objectId={props.objectId}
        visible={allSelectedInstancesModal.visible}
        title={i18n.t(
          `${NS_LIBS_CMDB_INSTANCES}:${K.VIEW_ALL_SELECTED_INSTANCES}`
        )}
        presetConfigs={{
          query: {
            instanceId: {
              $in: selectedInstanceList.map((instance) => instance.instanceId),
            },
          },
        }}
        selectDisabled={!props.ipCopy}
        ipCopy={props.ipCopy}
        onCancel={closeAllSelectedInstancesModal}
      />
      <Spin
        style={{ textAlign: "left", marginBottom: "12px" }}
        spinning={isEqual(modelMap, {})}
      >
        <a
          className={style.addButton}
          style={{
            marginBottom: "12px",
          }}
          onClick={openAddInstancesModal}
        >
          {props.addTitle ??
            i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CHOOSE_INSTANCE}`)}
        </a>
      </Spin>
      <div className={cs}>
        <InstanceListTable
          {...(props.showDetailUrl
            ? {
                detailUrlTemplates: {
                  [props.objectId]:
                    "/next-cmdb-instance-management/next/#{objectId}/instance/#{instanceId}",
                },
              }
            : {})}
          idObjectMap={modelMap}
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
          isOperate={props.isOperate}
          handleDeleteFunction={(v) => {
            setSelectedInstanceList(v);
            setPartialSelectedInstances(v);
            props.onChange?.(v);
          }}
          target={"_blank"}
        ></InstanceListTable>
        {!props?.isOperate && showPreview && (
          <div
            className={style.showAllSelectedInstancesButton}
            onClick={openAllSelectedInstancesModal}
          >
            <a>
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.VIEW_ALL_DATA}`, {
                count: selectedInstanceList.length,
              })}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
