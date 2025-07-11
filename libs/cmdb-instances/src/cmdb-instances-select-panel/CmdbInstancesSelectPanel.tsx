import React, { useState, useEffect, useMemo } from "react";
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
  Query,
} from "@next-libs/cmdb-utils";
import style from "./style.module.css";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { keyBy, isEqual, isNil, isObject, isEmpty, uniqBy } from "lodash";
import { Spin } from "antd";
import { useProvider } from "@next-core/brick-kit";

export interface BaseCmdbInstancesSelectPanelProps {
  objectId: string;
  value?: any[];
  onChange?: (instanceList: any[]) => void;
  instanceQuery?: any;
  fields?: string[];
  singleSelect?: boolean;
  showBindButton?: boolean;
  bindButtonDisabled?: boolean;
  bindButtonText?: string;
  bindEvent?: () => void;
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
  showPagination?: boolean;
  aq?: Query[];
  saveFieldsBackend?: boolean;
  useModelName?: boolean;
  useExternalCmdbApi?: boolean;
  externalSourceId?: string;
  filterInstanceSourceDisabled?: boolean;
  limitMaxQueryNumber?: boolean; //value超过了3000条数据时，是否限制只查询3000条数据
}

export interface CmdbInstancesSelectPanelPropsWithObjectMap
  extends BaseCmdbInstancesSelectPanelProps {
  objectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>;
  ipCopy?: boolean;
  showSizeChanger?: boolean;
  showCloseBtn?: boolean;
  pageSizeOptions?: string[];
  saveFieldsBackend?: boolean;
}

export interface CmdbInstancesSelectPanelPropsWithModelData
  extends BaseCmdbInstancesSelectPanelProps {
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  ipCopy?: boolean;
  showSizeChanger?: boolean;
  showCloseBtn?: boolean;
  pageSizeOptions?: string[];
  saveFieldsBackend?: boolean;
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
  // 当useExternalCmdbApi为true， 外部接口才调用
  const externalPostSearchV3 = useProvider(
    "easyops.api.cmdb.topo_center@ProxyPostSearchV3:1.0.1",
    { cache: false }
  );
  const externalGetObjectRef = useProvider(
    "easyops.api.cmdb.topo_center@ProxyGetObjectRef:1.0.0",
    { cache: false }
  );

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
  const { limitMaxQueryNumber = true } = props;
  const [selectedInstanceList, setSelectedInstanceList] = useState([]);
  const [partialSelectedInstances, setPartialSelectedInstances] = useState([]);
  // const [instanceTableData, setInstanceTableData] = useState({list: []})
  const [addInstancesModal, setAddInstancesModal] = useState({
    visible: false,
  });
  const [allSelectedInstancesModal, setAllSelectedInstancesModal] = useState({
    visible: false,
  });
  const [modelMap, setModelMap] = useState({});

  const externalRequestParams = useMemo(() => {
    return {
      objectId: props.objectId,
      sourceId: props.externalSourceId,
      ignore_missing_field_error: true,
      fields: props.fields?.length ? props.fields : ["*"],
    };
  }, [props.objectId, props.externalSourceId, props.fields]);

  const fetchInstances = async (instanceIdList: string[]): Promise<any[]> => {
    let instances: any[] = [];
    const instancesParams = {
      query: {
        instanceId: {
          $in: instanceIdList,
        },
      },
      page: 1,
      page_size: instanceIdList.length,
      // todo(ice): selected confirm with instances
      fields: props.fields?.length
        ? props.fields.reduce((prev, next) => ({ ...prev, [next]: true }), {})
        : { "*": true },
      ...(props.useExternalCmdbApi ? externalRequestParams : {}),
    };
    if (instanceIdList?.length) {
      // istanbul ignore if
      if (props.useExternalCmdbApi) {
        instances = (await externalPostSearchV3.query([instancesParams])).list;
      } else {
        const maxQueryNumber = 3000;
        const instanceIdListLen = limitMaxQueryNumber
          ? maxQueryNumber
          : instanceIdList.length;
        const queryInstances = (
          await Promise.all(
            Array(Math.ceil(instanceIdListLen / maxQueryNumber))
              .fill(0)
              .map(async (_, index) => {
                const pageSize =
                  instanceIdList.length < maxQueryNumber
                    ? instanceIdList.length
                    : instanceIdList.length - index * maxQueryNumber <
                      maxQueryNumber
                    ? instanceIdList.length - index * maxQueryNumber
                    : maxQueryNumber;
                const instanceIds = instanceIdList.slice(
                  index * maxQueryNumber,
                  index * maxQueryNumber + pageSize
                );
                return (
                  await InstanceApi_postSearch(props.objectId, {
                    ...instancesParams,
                    query: {
                      instanceId: {
                        $in: instanceIds,
                      },
                    },
                    page_size: pageSize,
                    page: 1,
                  })
                ).list;
              })
          )
        ).flat();
        instances =
          limitMaxQueryNumber && instanceIdList.length > maxQueryNumber
            ? uniqBy(
                [
                  ...queryInstances,
                  ...instanceIdList.map((i) => ({ instanceId: i })),
                ],
                "instanceId"
              )
            : queryInstances;
      }
    }

    return instances;
  };
  const toLoadInstanceIds =
    props.value?.map((i) => (isObject(i) ? (i as any).instanceId : i)) || [];

  useEffect(() => {
    const getModelMap = async (): Promise<void> => {
      let modelMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>;
      let objectRef;
      if (isCmdbInstancesSelectPanelPropsWithObjectMap(props)) {
        modelMap = props.objectMap;
      } else {
        if (props.useExternalCmdbApi) {
          objectRef = await externalGetObjectRef.query([
            {
              ref_object: props.objectId,
              ...externalRequestParams,
            },
          ]);
        } else {
          objectRef = (
            (await CmdbObjectApi_getObjectRef({
              ref_object: props.objectId,
            })) as any
          )?.data;
        }
        modelMap = keyBy(objectRef, "objectId");
      }
      setModelMap(modelMap);
    };
    getModelMap();
  }, [props.objectId, props.useExternalCmdbApi, props.externalSourceId]);

  useEffect(() => {
    let instances = [];

    const initInstances = async (): Promise<void> => {
      instances = await fetchInstances(toLoadInstanceIds);
      setSelectedInstanceList(instances);
      setPartialSelectedInstances(
        props?.isOperate
          ? instances
          : instances.slice(0, displayedSelectedInstancesMaxNumber)
      );
      props.onFetchedInstances?.(instances);
    };
    if (!isEmpty(toLoadInstanceIds)) {
      initInstances();
    } else {
      setSelectedInstanceList([]);
      setPartialSelectedInstances([]);
    }
  }, [toLoadInstanceIds.sort().join()]);
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
        showBindButton={props.showBindButton}
        bindButtonDisabled={props.bindButtonDisabled}
        bindButtonText={props.bindButtonText}
        bindEvent={props.bindEvent}
        pageSize={props.addInstancesModalPageSize}
        searchDisabled={props.searchDisabled}
        advancedSearchDisabled={props.advancedSearchDisabled}
        ipCopy={props.ipCopy}
        showCloseBtn={props.showCloseBtn}
        showSizeChanger={props.showSizeChanger}
        pageSizeOptions={props.pageSizeOptions}
        aq={props.aq}
        saveFieldsBackend={props.saveFieldsBackend}
        useExternalCmdbApi={props.useExternalCmdbApi}
        externalSourceId={props.externalSourceId}
        filterInstanceSourceDisabled={props.filterInstanceSourceDisabled}
      />
      <InstanceListModal
        objectMap={modelMap}
        objectId={props.objectId}
        visible={allSelectedInstancesModal.visible}
        showBindButton={props.showBindButton}
        bindButtonDisabled={props.bindButtonDisabled}
        bindButtonText={props.bindButtonText}
        bindEvent={props.bindEvent}
        title={i18n.t(
          `${NS_LIBS_CMDB_INSTANCES}:${K.VIEW_ALL_SELECTED_INSTANCES}`
        )}
        presetConfigs={{
          query: {
            instanceId: {
              $in: selectedInstanceList.map((instance) => instance.instanceId),
            },
          },
          fieldIds: props.fields,
        }}
        selectDisabled={!props.ipCopy}
        ipCopy={props.ipCopy}
        showCloseBtn={props.ipCopy ? true : props.showCloseBtn}
        pageSize={props.addInstancesModalPageSize}
        showSizeChanger={props.showSizeChanger}
        pageSizeOptions={props.pageSizeOptions}
        onCancel={closeAllSelectedInstancesModal}
        saveFieldsBackend={props.saveFieldsBackend}
        useExternalCmdbApi={props.useExternalCmdbApi}
        externalSourceId={props.externalSourceId}
        filterInstanceSourceDisabled={props.filterInstanceSourceDisabled}
      />
      <Spin
        style={{ textAlign: "left", marginBottom: "12px" }}
        spinning={isEqual(modelMap, {})}
      >
        <a
          className={style.addButton}
          style={{
            marginBottom: "10px",
          }}
          onClick={openAddInstancesModal}
        >
          {props.addTitle ?? props.useModelName
            ? i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CHOOSE_INSTANCE_NAME}`, {
                name: modelData.name,
              })
            : i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CHOOSE_INSTANCE}`)}
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
          instanceListData={{ list: partialSelectedInstances }}
          fieldIds={props.fields || fieldIds}
          selectDisabled={true}
          sortDisabled={true}
          configProps={
            props.showPagination && partialSelectedInstances.length > 10
              ? { pagination: { showSizeChanger: true } }
              : { pagination: false }
          }
          //
          isOperate={props.isOperate}
          useExternalCmdbApi={props.useExternalCmdbApi}
          externalSourceId={props.externalSourceId}
          filterInstanceSourceDisabled={props.filterInstanceSourceDisabled}
          handleDeleteFunction={(v: any) => {
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
