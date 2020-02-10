import React, { useEffect, useReducer, useState } from "react";
import {
  difference,
  isEmpty,
  map,
  uniq,
  union,
  filter,
  reject,
  sortBy,
  findIndex
} from "lodash";
import { handleHttpError } from "@easyops/brick-kit";
import {
  PropertyDisplayConfig,
  ReadPaginationChangeDetail,
  ReadSelectionChangeDetail,
  ReadSortingChangeDetail
} from "@easyops/brick-types";
import { CmdbModels, InstanceApi } from "@sdk/cmdb-sdk";
import { Button, Checkbox, Icon, Spin, Input, Tag } from "antd";
import {
  forEachAvailableFields,
  getInstanceNameKeys,
  RelationIdKeys,
  RelationObjectIdKeys
} from "@libs/cmdb-utils";

import {
  LogicalOperators,
  Query,
  AdvancedSearch,
  getFieldConditionsAndValues,
  MoreButtonsContainer,
  InstanceListTable
} from "../instance-list-table";
import styles from "./InstanceList.module.css";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import {
  extraFieldAttrs,
  CMDB_MODAL_FIELDS_SETTINGS,
  CMDB_RESOURCE_FIELDS_SETTINGS,
  MAX_DEFAULT_FIELDS_COUNT,
  MAX_DEFAULT_MODAL_FIELDS_COUNT
} from "./constants";
import { JsonStorage } from "@libs/storage";
import { ModelAttributeValueType } from "../model-attribute-form-control/ModelAttributeFormControl";

export interface InstanceListPresetConfigs {
  query?: Record<string, any>;
  fieldIds?: string[];
}

export function getQuery(
  modelData: Partial<CmdbModels.ModelCmdbObject>,
  idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>,
  q: string,
  fields?: string[]
) {
  const query: Record<string, any> = { $or: [] };

  forEachAvailableFields(
    modelData,
    attr => {
      query.$or.push({ [attr.id]: { $like: `%${q}%` } });
    },
    (relation, sides) => {
      const id = relation[`${sides.this}_id` as RelationIdKeys];
      const nameKey = getInstanceNameKeys(
        idObjectMap[relation[`${sides.that}_object_id` as RelationObjectIdKeys]]
      );

      query.$or.push({
        [`${id}.${nameKey}`]: { $like: `%${q}%` }
      });
    },
    fields
  );

  return query;
}

function translateConditions(
  aq: Query[],
  modelData: Partial<CmdbModels.ModelCmdbObject>
): { attrId: string; condition: string }[] {
  const conditions: { attrId: string; condition: string }[] = [];
  if (!isEmpty(aq)) {
    for (const query of aq) {
      const key = Object.keys(query)[0];
      const attr = modelData.attrList.find(attr => attr.id === key);
      const info = getFieldConditionsAndValues(
        query as any,
        key,
        attr.value.type as ModelAttributeValueType
      );
      const condition = `${attr.name}: ${
        info.currentCondition.label
      }"${info.values.join(" | ")}"`;
      conditions.push({ attrId: key, condition });
    }
  }

  return conditions;
}

interface InstanceListProps {
  objectId: string;
  objectList: Partial<CmdbModels.ModelCmdbObject>[];
  detailUrlTemplates?: Record<string, string>;
  presetConfigs?: InstanceListPresetConfigs;
  q?: string;
  searchDisabled?: boolean;
  sortDisabled?: boolean;
  aq?: Query[];
  advancedSearchDisabled?: boolean;
  page?: number;
  pageSize?: number;
  sort?: string;
  asc?: boolean;
  relatedToMe?: boolean;
  relatedToMeDisabled?: boolean;
  moreButtonsDisabled?: boolean;
  aliveHosts?: boolean;
  aliveHostsDisabled?: boolean;
  propertyDisplayConfigs?: PropertyDisplayConfig[];
  selectedRowKeys?: string[];
  selectDisabled?: boolean;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
  onSearch?(value: string): void;
  onAdvancedSearch?(queries: Query[]): void;
  onClickItem?(
    evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ): void;
  onPaginationChange?(pagination: ReadPaginationChangeDetail): void;
  onSortingChange?(sorting: ReadSortingChangeDetail): void;
  onSelectionChange?(selection: ReadSelectionChangeDetail): void;
  onRelatedToMeChange?(value: boolean): void;
  onAliveHostsChange?(value: boolean): void;
  relationLinkDisabled?: boolean;
  notifyCurrentFields?: (fiels: string[]) => void;
}

interface InstanceListState {
  q: string;
  aq: Query[];
  asc: boolean;
  sort: string;
  page: number;
  pageSize: number;
  aliveHosts: boolean;
  relatedToMe: boolean;
  inited: boolean;
  loading: boolean;
  failed: boolean;
  idObjectMap?: Record<string, Partial<CmdbModels.ModelCmdbObject>>;
  instanceListData?: InstanceApi.PostSearchResponseBody;
  isAdvancedSearchVisible: boolean;
  presetConfigs: InstanceListPresetConfigs;
  autoBreakLine: boolean;
}

export function InstanceList(props: InstanceListProps): React.ReactElement {
  let modelData: Partial<CmdbModels.ModelCmdbObject>;
  const idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>> = {};
  const jsonLocalStorage: JsonStorage = new JsonStorage(localStorage);

  const reducer = (
    prevState: InstanceListState,
    updatedProperty: Record<string, any>
  ) => {
    return {
      ...prevState,
      ...updatedProperty
    };
  };

  const setModelData = () => {
    props.objectList.forEach(object => {
      idObjectMap[object.objectId] = object;
      if (object.objectId === props.objectId) {
        modelData = object;
        modelData.attrList = union(object.attrList, extraFieldAttrs);
      }
    });
  };

  const computeDefaultFields = (
    { inModal } = { inModal: false }
  ): { fieldIds: string[] } => {
    const settings: any = inModal
      ? CMDB_MODAL_FIELDS_SETTINGS
      : CMDB_RESOURCE_FIELDS_SETTINGS;
    const ignoredFields: string[] =
      settings.ignoredFields[modelData.objectId] || [];
    const fieldIds: string[] =
      settings.defaultFields[modelData.objectId] ||
      difference(uniq(map(modelData.attrList, "id")), ignoredFields).slice(
        0,
        inModal ? MAX_DEFAULT_MODAL_FIELDS_COUNT : MAX_DEFAULT_FIELDS_COUNT
      );
    return { fieldIds };
  };

  // 根据用户预定义的 presetConfigs.fieldIds 进行排序，如果不在预定义的字段，则根据 modelData.view.attr_order 进行排序
  const _sortFieldIds = (fieldIds: any[]) => {
    let frontFields: any[] = [];
    let restFields: any[] = [];
    if (props.presetConfigs?.fieldIds) {
      frontFields = filter(props.presetConfigs.fieldIds, id =>
        fieldIds.includes(id)
      );
    }
    restFields = sortBy(
      reject(fieldIds, id => frontFields.includes(id)),
      fieldId => {
        const foundIndex = findIndex(
          modelData.view.attr_order,
          orderId => orderId === fieldId
        );
        if (foundIndex === -1) {
          return null;
        } else {
          return foundIndex;
        }
      }
    );
    return [...frontFields, ...restFields];
  };

  const getFields = () => {
    const selectAttrIds = jsonLocalStorage.getItem(
      `${modelData.objectId}-selectAttrIds`
    );
    let fieldIds = isEmpty(selectAttrIds)
      ? props.presetConfigs?.fieldIds
      : selectAttrIds;

    if (isEmpty(fieldIds)) {
      fieldIds = computeDefaultFields().fieldIds;
    }
    fieldIds = _sortFieldIds(fieldIds);
    return fieldIds;
  };

  setModelData();
  const initState: InstanceListState = {
    q: props.q,
    aq: props.aq,
    asc: props.asc,
    sort: props.sort,
    page: props.page,
    pageSize: props.pageSize,
    aliveHosts: props.aliveHosts,
    relatedToMe: props.relatedToMe,
    inited: false,
    loading: false,
    failed: false,
    isAdvancedSearchVisible: false,
    presetConfigs: props.presetConfigs,
    autoBreakLine: false
  };

  const [q, setQ] = useState(props.q);
  const [state, setState] = useReducer(reducer, initState);

  const getInstanceListData = async () => {
    try {
      const searchParams: InstanceApi.PostSearchRequestBody = {};
      let query: Record<string, any> = {};

      state.page && (searchParams.page = state.page);
      state.pageSize && (searchParams["page_size"] = state.pageSize);
      state.sort && (searchParams.sort = { [state.sort]: state.asc ? 1 : -1 });
      if (state.q) {
        query = getQuery(
          modelData,
          idObjectMap,
          state.q,
          state.presetConfigs?.fieldIds
        );
      }

      if (state.aq) {
        query[LogicalOperators.And] = state.aq;
      }

      if (!isEmpty(query)) {
        searchParams.query = query;
      }
      if (state.presetConfigs) {
        if (state.presetConfigs.query) {
          if (searchParams.query) {
            searchParams.query = {
              $and: [searchParams.query, state.presetConfigs.query]
            };
          } else {
            searchParams.query = state.presetConfigs.query;
          }
        }
        if (state.presetConfigs.fieldIds) {
          const fields: Record<string, boolean> = {};
          state.presetConfigs.fieldIds.forEach(id => (fields[id] = true));
          if (searchParams.fields) {
            searchParams.fields = Object.assign(
              {},
              searchParams.fields,
              fields
            );
          } else {
            searchParams.fields = fields;
          }
        }
      }
      if (state.relatedToMe) {
        searchParams.only_my_instance = state.relatedToMe;
      }
      if (state.aliveHosts) {
        searchParams.query = { ...searchParams.query, _agentStatus: "正常" };
      }
      return await InstanceApi.postSearch(props.objectId, searchParams);
    } catch (e) {
      handleHttpError(e);
    }
  };

  const refreshInstanceList = async () => {
    setState({ loading: true });
    try {
      const instanceListData = await getInstanceListData();
      setState({ idObjectMap: idObjectMap, instanceListData });
    } catch (e) {
      handleHttpError(e);
      setState({ failed: true });
    } finally {
      setState({ inited: true, loading: false });
    }
  };

  useEffect(() => {
    setState({ loading: true });
    setModelData();
    const fieldIds = getFields();
    setState({
      presetConfigs: Object.assign(state.presetConfigs || {}, { fieldIds })
    });

    refreshInstanceList();
  }, [
    state.q,
    state.aq,
    state.page,
    state.pageSize,
    state.aliveHosts,
    state.relatedToMe,
    state.presetConfigs,
    state.sort,
    state.asc,
    props.objectId
  ]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };

  const onSearch = (value: string) => {
    const q = value.trim();
    setState({ q });
    props.onSearch?.(q);
  };

  const onAdvancedSearch = (queries: Query[]) => {
    setState({ aq: queries });
    props.onAdvancedSearch?.(queries);
  };

  const onSortingChange = (info: ReadSortingChangeDetail) => {
    if (info.asc === undefined) {
      setState({ asc: undefined, sort: undefined });
    } else {
      setState({ asc: info.asc, sort: info.sort });
    }
    props.onSortingChange?.(info);
  };

  const onPaginationChange = (pagination: ReadPaginationChangeDetail) => {
    setState({ page: pagination.page, pageSize: pagination.pageSize });
    props.onPaginationChange?.(pagination);
  };

  const onRelatedToMeChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setState({ relatedToMe: checked });
    props.onRelatedToMeChange?.(checked);
  };

  const onAliveHostsChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setState({ aliveHosts: checked });
    props.onAliveHostsChange?.(checked);
  };

  const handleConfirm = (selectAttrIds: string[]) => {
    setState({
      presetConfigs: Object.assign({}, state.presetConfigs, {
        fieldIds: _sortFieldIds(selectAttrIds)
      })
    });
    jsonLocalStorage.setItem(
      `${modelData.objectId}-selectAttrIds`,
      selectAttrIds
    );
  };

  const toggleAutoBreakLine = (autoBreakLine: boolean) => {
    setState({ autoBreakLine });
  };

  const handleDefaultFields = () => {
    let defaultFields: string[];
    if (!isEmpty(props.presetConfigs?.fieldIds)) {
      defaultFields = props.presetConfigs.fieldIds;
    } else {
      defaultFields = computeDefaultFields().fieldIds;
    }
    return defaultFields;
  };

  const handleReset = () => {
    setState({ presetConfigs: { fieldIds: handleDefaultFields() } });
    jsonLocalStorage.removeItem(`${modelData.objectId}-selectAttrIds`);
  };

  useEffect(() => {
    props.notifyCurrentFields?.(state.presetConfigs?.fieldIds);
  }, [props.notifyCurrentFields]);

  const onAdvancedSearchCloseGen = (attrId: string): Function => {
    return () => {
      const queries = state.aq.filter(
        query => Object.keys(query)[0] !== attrId
      );
      setState({ aq: queries });
      props.onAdvancedSearch?.(queries);
    };
  };
  const conditions = translateConditions(state.aq, modelData);

  return (
    <Spin spinning={state.loading}>
      {state.inited && !state.failed ? (
        <React.Fragment>
          {(!props.searchDisabled ||
            !props.advancedSearchDisabled ||
            !props.relatedToMeDisabled ||
            !props.aliveHostsDisabled) && (
            <div className={styles.instanceListToolbar}>
              <div className={styles.searchRelated}>
                {!props.searchDisabled && (
                  <Input.Search
                    enterButton
                    value={q}
                    onChange={onChange}
                    onSearch={onSearch}
                  />
                )}
                {!props.advancedSearchDisabled && (
                  <Button
                    type="link"
                    size="small"
                    style={{
                      marginLeft: "8px",
                      marginRight: "auto"
                    }}
                    onClick={() =>
                      setState({
                        isAdvancedSearchVisible: !state.isAdvancedSearchVisible
                      })
                    }
                    data-testid="advanced-search-toggle-btn"
                  >
                    高级搜索
                    <Icon
                      type={state.isAdvancedSearchVisible ? "up" : "down"}
                    />
                  </Button>
                )}
              </div>
              <div className={styles.options}>
                {props.objectId === "HOST" && !props.aliveHostsDisabled && (
                  <Checkbox
                    checked={state.aliveHosts}
                    onChange={onAliveHostsChange}
                    style={{ marginLeft: "auto" }}
                    data-testid="alive-hosts-checkbox"
                  >
                    正常主机
                  </Checkbox>
                )}
                {!props.relatedToMeDisabled && (
                  <Checkbox
                    checked={state.relatedToMe}
                    onChange={onRelatedToMeChange}
                    data-testid="related-to-me-checkbox"
                    style={{ marginRight: 10 }}
                  >
                    与我有关
                  </Checkbox>
                )}
                {!props.moreButtonsDisabled && (
                  <MoreButtonsContainer
                    modelData={modelData}
                    onHandleConfirm={handleConfirm}
                    onHandleReset={handleReset}
                    onToggleAutoBreakLine={toggleAutoBreakLine}
                    presetConfigs={state.presetConfigs}
                    defaultFields={handleDefaultFields()}
                  />
                )}
              </div>
            </div>
          )}
          {!props.advancedSearchDisabled && (
            <div
              style={{ marginBottom: "18px" }}
              hidden={!state.isAdvancedSearchVisible}
            >
              <AdvancedSearch
                key={
                  state.presetConfigs.fieldIds
                    ? state.presetConfigs.fieldIds.join("-")
                    : ""
                }
                presetConfigs={state.presetConfigs}
                idObjectMap={state.idObjectMap}
                modelData={modelData}
                q={state.aq}
                onSearch={onAdvancedSearch}
              />
            </div>
          )}
          {(state.q || !isEmpty(state.aq)) && (
            <div className={styles.searchConditions}>
              <span>当前筛选条件：</span>
              {state.q && (
                <Tag
                  closable
                  onClose={() => {
                    setQ("");
                    onSearch("");
                  }}
                >
                  模糊搜索：{state.q}
                </Tag>
              )}
              {conditions.map(condition => (
                <Tag
                  key={condition.attrId}
                  closable
                  onClose={onAdvancedSearchCloseGen(condition.attrId)}
                >
                  {condition.condition}
                </Tag>
              ))}
            </div>
          )}
          <InstanceListTable
            detailUrlTemplates={props.detailUrlTemplates}
            presetConfigs={state.presetConfigs}
            idObjectMap={state.idObjectMap}
            modelData={modelData}
            instanceListData={state.instanceListData}
            sort={state.sort}
            asc={state.asc}
            selectedRowKeys={props.selectedRowKeys}
            selectDisabled={props.selectDisabled}
            sortDisabled={props.sortDisabled}
            propertyDisplayConfigs={props.propertyDisplayConfigs}
            onClickItem={props.onClickItem}
            onPaginationChange={onPaginationChange}
            onSortingChange={onSortingChange}
            onSelectionChange={props.onSelectionChange}
            autoBreakLine={state.autoBreakLine}
            relationLinkDisabled={props.relationLinkDisabled}
            pageSizeOptions={props.pageSizeOptions}
            showSizeChanger={props.showSizeChanger}
          />
        </React.Fragment>
      ) : null}
    </Spin>
  );
}
