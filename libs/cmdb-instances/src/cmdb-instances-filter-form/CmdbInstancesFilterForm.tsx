import React, { forwardRef, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Radio } from "antd";
import { RadioChangeEvent } from "antd/lib/radio";
import { get, keyBy, isEmpty, Dictionary } from "lodash";
import { FormItemWrapperProps, FormItemWrapper } from "@next-libs/forms";
import { modifyModelData } from "@next-libs/cmdb-utils";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { ValidationRule } from "@ant-design/compatible/lib/form";
import { handleHttpError } from "@next-core/brick-kit";

import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import { QueryForm } from "./components/QueryForm/QueryForm";
import { fetchCmdbObjectRef } from "../data-providers";
import { InstanceListModal } from "../instance-list-modal/InstanceListModal";
import { CmdbInstancesSelectPanel } from "../cmdb-instances-select-panel/CmdbInstancesSelectPanel";
import style from "./style.module.css";

export enum CmdbInstancesFilterInstancesType {
  Constant = "constant",
  Search = "search",
  All = "all",
}
export interface CmdbInstancesFilterFormItemValue {
  objectId: string;
  type: CmdbInstancesFilterInstancesType;
  instanceIds: string[];
  query: any;
}

export interface CmdbInstancesFilterInstances {
  type: CmdbInstancesFilterInstancesType;
  query?: any;
}

export interface CmdbInstancesFilter {
  objectId: string;
  instances: CmdbInstancesFilterInstances;
}

export interface CmdbInstancesFilterFormItemProps {
  objectMap?: { [objectId: string]: Partial<CmdbModels.ModelCmdbObject> };
  value?: CmdbInstancesFilter;
  filter?: CmdbInstancesFilter;
  children?: React.ReactNode;
  onChange?: (value: CmdbInstancesFilter) => void;
  autoPullObjectList?: boolean;
  autoCullNonExistentInstances?: boolean; //是否自动剔除不存在的实例
  searchDisabled?: boolean;
  advancedSearchDisabled?: boolean;
  hideSearchConditions?: boolean;
  ipCopy?: boolean;
}

// eslint-disable-next-line react/display-name
export const CmdbInstancesFilterFormItem = forwardRef<
  HTMLDivElement,
  CmdbInstancesFilterFormItemProps
>((props, ref) => {
  const { t } = useTranslation(NS_LIBS_CMDB_INSTANCES);

  const objectListCache = useRef<{
    objectId?: string;
    objectList?: Dictionary<Partial<CmdbModels.ModelCmdbObject>>;
  }>({});

  const [value, setValue] = useState<CmdbInstancesFilterFormItemValue>();
  const [objectData, setObjectData] = useState({
    modelData: null,
    objectMap: props.objectMap,
  });
  const getObjectList = async (objectId: string) => {
    try {
      // Cache objectList to avoid re-pulling the interface
      if (objectId !== objectListCache.current.objectId) {
        const objectRef = (await fetchCmdbObjectRef(objectId)).data;
        const objectList = keyBy(objectRef, "objectId");
        objectListCache.current = { objectId, objectList };
        return objectList;
      } else {
        return objectListCache.current.objectList;
      }
    } catch (error) {
      handleHttpError(error);
    }
  };
  const convertFilters = (
    value: CmdbInstancesFilter,
    _objectMap: { [objectId: string]: Partial<CmdbModels.ModelCmdbObject> }
  ): void => {
    setObjectData({
      objectMap: _objectMap,
      modelData: modifyModelData(_objectMap[value.objectId]),
    });

    const type =
      get(value, "instances.type") || CmdbInstancesFilterInstancesType.All;
    let instanceIds = [];
    let query = {};
    switch (type) {
      case CmdbInstancesFilterInstancesType.Constant:
        instanceIds = get(value, "instances.query.instanceId.$in") || [];
        break;
      case CmdbInstancesFilterInstancesType.Search:
        query = get(value, "instances.query") || {};
        break;
    }

    setValue({
      objectId: value.objectId,
      type,
      instanceIds,
      query,
    });
  };

  const triggerChange = (
    objectId: string,
    type: CmdbInstancesFilterInstancesType,
    query?: any
  ): void => {
    if (props.onChange) {
      const instances: CmdbInstancesFilterInstances = { type };
      switch (type) {
        case CmdbInstancesFilterInstancesType.Constant:
        case CmdbInstancesFilterInstancesType.Search:
          instances.query = query;
      }

      props.onChange({ objectId, instances });
    }
  };
  const handleTypeChange = (event: RadioChangeEvent): void => {
    const type = event.target.value;
    setValue({ ...value, type });

    switch (type) {
      case CmdbInstancesFilterInstancesType.All:
        triggerChange(value.objectId, type);
        break;
      case CmdbInstancesFilterInstancesType.Constant:
        triggerChange(value.objectId, type, {
          instanceId: { $in: value.instanceIds },
        });
        break;
      case CmdbInstancesFilterInstancesType.Search:
        triggerChange(value.objectId, type, value.query);
    }
  };

  const handleCmdbInstanceSelectPanelChange = (
    instanceDataList: any[]
  ): void => {
    const instanceIdList = instanceDataList.map(
      (instance) => instance.instanceId
    );
    setValue({ ...value, instanceIds: instanceIdList });
    triggerChange(value.objectId, value.type, {
      instanceId: { $in: instanceIdList },
    });
  };

  const handleQueryFormChange = (query: any): void => {
    setValue({ ...value, query });
    triggerChange(value.objectId, value.type, query);
  };

  const [allInstancesModalProps, setAllInstancesModalProps] = useState({
    visible: false,
  });

  const openAllModal = (): void => {
    setAllInstancesModalProps({ visible: true });
  };

  const closeAllModal = (): void => {
    setAllInstancesModalProps({ visible: false });
  };
  const renderFilterPanel = (): React.ReactNode => {
    const { modelData, objectMap } = objectData;

    if (objectMap && objectMap[value.objectId]) {
      switch (value.type) {
        case CmdbInstancesFilterInstancesType.All:
          return (
            <>
              <InstanceListModal
                objectMap={objectMap}
                objectId={value.objectId}
                visible={allInstancesModalProps.visible}
                title={t(K.TITLE_VIEW_SPECIFIC_EXAMPLE, {
                  instance_title: modelData.name,
                })}
                query={{}}
                selectDisabled={!props.ipCopy}
                ipCopy={props.ipCopy}
                onCancel={closeAllModal}
                searchDisabled={props.searchDisabled}
                advancedSearchDisabled={props.advancedSearchDisabled}
              />
              <a onClick={openAllModal}>{t(K.VIEW_SPECIFIC_EXAMPLE)}</a>
            </>
          );
        case CmdbInstancesFilterInstancesType.Constant:
          return (
            <CmdbInstancesSelectPanel
              modelData={objectMap[value.objectId]}
              objectId={value.objectId}
              value={value.instanceIds}
              onChange={handleCmdbInstanceSelectPanelChange}
              onFetchedInstances={
                props.autoCullNonExistentInstances
                  ? handleCmdbInstanceSelectPanelChange
                  : // eslint-disable-next-line @typescript-eslint/no-empty-function
                    () => {}
              }
              ipCopy={props.ipCopy}
              searchDisabled={props.searchDisabled}
              advancedSearchDisabled={props.advancedSearchDisabled}
            />
          );
        case CmdbInstancesFilterInstancesType.Search:
          return (
            <QueryForm
              objectMap={objectMap}
              objectData={modelData}
              query={value.query}
              onChange={handleQueryFormChange}
              searchDisabled={props.searchDisabled}
              advancedSearchDisabled={props.advancedSearchDisabled}
              hideSearchConditions={props.hideSearchConditions}
              ipCopy={props.ipCopy}
            />
          );
      }
    }
  };

  useEffect(() => {
    if (props.filter?.objectId) {
      if (props.autoPullObjectList) {
        getObjectList(props.filter.objectId).then((res) => {
          convertFilters(props.filter, res);
          triggerChange(
            props.filter.objectId,
            props.filter.instances.type,
            props.filter.instances.query
          );
        });
      } else {
        convertFilters(props.filter, props.objectMap);
        triggerChange(
          props.filter.objectId,
          props.filter.instances.type,
          props.filter.instances.query
        );
      }
    } else {
      setValue(null);
    }
  }, [props.autoPullObjectList, props.filter]);

  useEffect(() => {
    if (props.value?.objectId) {
      if (props.autoPullObjectList) {
        getObjectList(props.value.objectId).then((res) => {
          convertFilters(props.value, res);
        });
      } else {
        convertFilters(props.value, props.objectMap);
      }
    } else {
      !props.filter?.objectId && setValue(null);
    }
  }, [props.autoPullObjectList, props.value]);

  return (
    <div className={style.itemWrapper} ref={ref}>
      {value && (
        <>
          <Radio.Group
            className={style.typeRadioGroup}
            value={value.type}
            onChange={handleTypeChange}
          >
            <Radio value={CmdbInstancesFilterInstancesType.All}>
              {t(K.ALL_INSTANCES)}
            </Radio>
            <Radio value={CmdbInstancesFilterInstancesType.Constant}>
              {t(K.SPECIFIC_INSTANCES)}
            </Radio>
            <Radio value={CmdbInstancesFilterInstancesType.Search}>
              {t(K.DYNAMIC_FILTER)}
            </Radio>
          </Radio.Group>
          <div>{renderFilterPanel()}</div>
        </>
      )}
    </div>
  );
});

export interface CmdbInstancesFilterFormProps extends FormItemWrapperProps {
  objectMap?: { [objectId: string]: Partial<CmdbModels.ModelCmdbObject> };
  filter?: CmdbInstancesFilter;
  onChange?: (value: CmdbInstancesFilter) => void;
  autoPullObjectList?: boolean;
  autoCullNonExistentInstances?: boolean; //是否自动剔除不存在的实例
  searchDisabled?: boolean;
  advancedSearchDisabled?: boolean;
  hideSearchConditions?: boolean;
  ipCopy?: boolean;
}

export function CmdbInstancesFilterForm(
  props: CmdbInstancesFilterFormProps
): React.ReactElement {
  const { t } = useTranslation(NS_LIBS_CMDB_INSTANCES);
  const validatorFn = (
    rule: any,
    value: any,
    callback: (message?: string) => void
  ): void => {
    if (
      props.required &&
      value?.instances?.type === CmdbInstancesFilterInstancesType.Constant &&
      (isEmpty(value?.instances?.query) ||
        value?.instances?.query?.instanceId?.$in.length === 0)
    ) {
      callback(
        props.label ? props.label + t(K.REQUIRED) : t(K.THIS_ITEM_IS_REQUIRED)
      );
    }
  };
  const builtInValidator: Pick<ValidationRule, "validator" | "message">[] = [
    { validator: validatorFn },
  ];
  return (
    <FormItemWrapper
      {...props}
      validator={
        props.validator
          ? builtInValidator.concat(props.validator as any)
          : builtInValidator
      }
    >
      <CmdbInstancesFilterFormItem
        objectMap={props.objectMap}
        filter={props.filter}
        onChange={props.onChange}
        autoPullObjectList={props.autoPullObjectList}
        autoCullNonExistentInstances={props.autoCullNonExistentInstances}
        searchDisabled={props.searchDisabled}
        advancedSearchDisabled={props.advancedSearchDisabled}
        hideSearchConditions={props.hideSearchConditions}
        ipCopy={props.ipCopy}
      />
    </FormItemWrapper>
  );
}
