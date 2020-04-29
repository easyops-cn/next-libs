import React, { useEffect, useReducer, useState } from "react";
import {
  difference,
  isEmpty,
  isEqual,
  map,
  uniq,
  union,
  filter,
  reject,
  sortBy,
  uniqueId,
  findIndex,
} from "lodash";
import { handleHttpError } from "@easyops/brick-kit";
import {
  PropertyDisplayConfig,
  ReadPaginationChangeDetail,
  ReadSelectionChangeDetail,
  ReadSortingChangeDetail,
} from "@easyops/brick-types";
import { CmdbModels, InstanceApi } from "@sdk/cmdb-sdk";
import { Button, Checkbox, Icon, Spin, Input, Tag } from "antd";
import {
  getRelationObjectSides,
  forEachAvailableFields,
  getInstanceNameKeys,
  RelationIdKeys,
  RelationNameKeys,
  RelationObjectIdKeys,
} from "@libs/cmdb-utils";

import {
  ConditionType,
  LogicalOperators,
  Query,
  AdvancedSearch,
  getFieldConditionsAndValues,
  MoreButtonsContainer,
  InstanceListTable,
} from "../instance-list-table";
import styles from "./InstanceList.module.css";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import {
  extraFieldAttrs,
  CMDB_MODAL_FIELDS_SETTINGS,
  CMDB_RESOURCE_FIELDS_SETTINGS,
  MAX_DEFAULT_FIELDS_COUNT,
  MAX_DEFAULT_MODAL_FIELDS_COUNT,
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

  const queryValues = q.trim().split(/\s+/);

  forEachAvailableFields(
    modelData,
    (attr) => {
      queryValues.forEach((queryValue) =>
        query.$or.push({ [attr.id]: { $like: `%${queryValue}%` } })
      );
    },
    (relation, sides) => {
      const id = relation[`${sides.this}_id` as RelationIdKeys];
      const nameKey = getInstanceNameKeys(
        idObjectMap[relation[`${sides.that}_object_id` as RelationObjectIdKeys]]
      );

      queryValues.forEach((queryValue) =>
        query.$or.push({
          [`${id}.${nameKey}`]: { $like: `%${queryValue}%` },
        })
      );
    },
    fields
  );

  return query;
}

function translateConditions(
  aq: Query[],
  idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>,
  modelData: Partial<CmdbModels.ModelCmdbObject>
): { attrId: string; condition: string; valuesStr: string }[] {
  const conditions: {
    attrId: string;
    condition: string;
    valuesStr: string;
  }[] = [];
  const relations: any[] = [];
  modelData.relation_list.forEach((relation) => {
    const sides = getRelationObjectSides(relation, modelData);
    const objectId = relation[`${sides.this}_id` as RelationIdKeys];
    const nameKeys = getInstanceNameKeys(
      idObjectMap[relation[`${sides.that}_object_id` as RelationObjectIdKeys]]
    );
    nameKeys.forEach((nameKey) => {
      const id = `${objectId}.${nameKey}`;
      const name = `${
        relation[`${sides.this}_name` as RelationNameKeys]
      }(${nameKey})`;
      relations.push({
        id,
        name,
        value: { type: "str" },
        relationSideId: relation[`${sides.this}_id` as RelationIdKeys],
      });
    });
  });
  const attrAndRelationList = [...modelData.attrList, ...relations];
  if (!isEmpty(aq)) {
    for (const query of aq) {
      let queries: Query[] = [query];
      if (Object.keys(query)[0] === "$or" || Object.keys(query)[0] === "$and") {
        queries = query[Object.keys(query)[0]] as Query[];
      }

      queries.forEach((query) => {
        const key = Object.keys(query)[0];
        const attr = attrAndRelationList.find(
          (attr) => attr.id === key || attr.relationSideId === key
        );
        if (attr) {
          const info = getFieldConditionsAndValues(
            query as any,
            key,
            attr.value.type as ModelAttributeValueType
          );

          let condition = `${attr.name}: ${info.currentCondition.label}`;
          if (
            ![ConditionType.Empty, ConditionType.NotEmpty].includes(
              info.currentCondition.type
            )
          ) {
            condition += `"${info.values.join(" ~ ")}"`;
          }
          conditions.push({
            attrId: key,
            condition,
            valuesStr: info.queryValuesStr,
          });
        }
      });
    }
  }

  return conditions;
}

function newKey(fieldIds: string[], aq: Query[]): string {
  let key = "";
  if (!isEmpty(fieldIds)) {
    key += fieldIds.join("-");
  }
  if (!isEmpty(aq)) {
    key += `-${aq.length}`;
  }
  return key;
}

interface InstanceListProps {
  objectId: string;
  objectList: Partial<CmdbModels.ModelCmdbObject>[];
  detailUrlTemplates?: Record<string, string>;
  presetConfigs?: InstanceListPresetConfigs;
  permission?: string[];
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
  fixAliveHosts?: boolean;
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
  fieldIds: string[];
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
      ...updatedProperty,
    };
  };

  const setModelData = () => {
    props.objectList.forEach((object) => {
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
      frontFields = filter(props.presetConfigs.fieldIds, (id) =>
        fieldIds.includes(id)
      );
    }
    restFields = sortBy(
      reject(fieldIds, (id) => frontFields.includes(id)),
      (fieldId) => {
        const foundIndex = findIndex(
          modelData.view.attr_order,
          (orderId) => orderId === fieldId
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
    fieldIds: props.presetConfigs?.fieldIds,
    autoBreakLine: false,
  };

  const [q, setQ] = useState(props.q);
  const [state, setState] = useReducer(reducer, initState);
  const [selectedRowKeys, setSelectedRowKeys] = useState(
    props.selectedRowKeys ?? []
  );

  const getInstanceListData = async (
    sort: string,
    asc: boolean,
    page: number
  ) => {
    try {
      const searchParams: InstanceApi.PostSearchRequestBody = {};
      if (!isEmpty(props.permission)) {
        searchParams.permission = props.permission;
      }

      let query: Record<string, any> = {};

      searchParams.page = page;
      state.pageSize && (searchParams["page_size"] = state.pageSize);
      sort && (searchParams.sort = { [sort]: asc ? 1 : -1 });
      if (state.q) {
        query = getQuery(modelData, idObjectMap, state.q, state.fieldIds);
      }

      if (!isEmpty(state.aq)) {
        query[LogicalOperators.And] = state.aq;
      }

      if (!isEmpty(query)) {
        searchParams.query = query;
      }
      if (props.presetConfigs) {
        if (!isEmpty(props.presetConfigs.query)) {
          if (searchParams.query) {
            searchParams.query = {
              $and: [searchParams.query, props.presetConfigs.query],
            };
          } else {
            searchParams.query = props.presetConfigs.query;
          }
        }
        if (state.fieldIds) {
          const fields: Record<string, boolean> = {};
          state.fieldIds.forEach((id) => (fields[id] = true));
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
      if (state.aliveHosts && props.objectId === "HOST") {
        searchParams.query = { ...searchParams.query, _agentStatus: "正常" };
      }
      return await InstanceApi.postSearch(props.objectId, searchParams);
    } catch (e) {
      handleHttpError(e);
    }
  };

  const refreshInstanceList = async (
    sort: string,
    asc: boolean,
    page: number
  ) => {
    setState({ loading: true });
    try {
      const instanceListData = await getInstanceListData(sort, asc, page);
      setState({ idObjectMap: idObjectMap, instanceListData });
    } catch (e) {
      handleHttpError(e);
      setState({ failed: true });
    } finally {
      setState({ inited: true, loading: false });
    }
  };

  useEffect(() => {
    const fieldIds = getFields();
    if (!isEqual(fieldIds, state.fieldIds)) {
      setState({
        fieldIds,
      });
    }
  }, [props.objectId, props.presetConfigs]);

  useEffect(() => {
    setSelectedRowKeys(props.selectedRowKeys ?? []);
  }, [props.objectId, props.selectedRowKeys]);

  useEffect(() => {
    if (isEmpty(state.fieldIds)) return;
    setState({ page: 1 });
    refreshInstanceList(state.sort, state.asc, 1);
    props.onPaginationChange?.({ page: 1, pageSize: state.pageSize });
  }, [
    state.q,
    state.aq,
    state.pageSize,
    state.aliveHosts,
    state.relatedToMe,
    state.fieldIds,
  ]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };

  const onSelectionChange = (selected: {
    selectedKeys: string[];
    selectedItems: any[];
  }) => {
    setSelectedRowKeys(selected.selectedKeys);
    props.onSelectionChange?.(selected);
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
    let asc: boolean;
    let sort: string;
    if (info.asc === undefined) {
      setState({ asc: undefined, sort: undefined });
    } else {
      setState({ asc: info.asc, sort: info.sort });
      asc = info.asc;
      sort = info.sort;
    }
    props.onSortingChange?.(info);
    refreshInstanceList(sort, asc, state.page);
  };

  const onPaginationChange = (pagination: ReadPaginationChangeDetail) => {
    setState({ page: pagination.page, pageSize: pagination.pageSize });
    props.onPaginationChange?.(pagination);
    refreshInstanceList(state.sort, state.asc, pagination.page);
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
      fieldIds: _sortFieldIds(selectAttrIds),
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
    const fieldIds = handleDefaultFields();
    setState({ fieldIds });
    jsonLocalStorage.removeItem(`${modelData.objectId}-selectAttrIds`);
  };

  useEffect(() => {
    props.notifyCurrentFields?.(state.fieldIds);
  }, [props.notifyCurrentFields]);

  const onAdvancedSearchCloseGen = (
    attrId: string,
    valuesStr: string
  ): Function => {
    return () => {
      const queries: Query[] = [];
      state.aq.forEach((query) => {
        const key = Object.keys(query)[0];
        if (
          (key === "$or" || key === "$and") &&
          Object.keys((query[key] as Query[])[0])[0] === attrId
        ) {
          const filteredSubQueries = (query[key] as Query[]).filter((query) => {
            return Object.values(query[attrId]).join(" ") !== valuesStr;
          });
          if (filteredSubQueries.length > 0) {
            queries.push({
              [key]: filteredSubQueries,
            });
          }
        } else if (key !== attrId) {
          queries.push(query);
        }
      });
      setState({ aq: queries });
      props.onAdvancedSearch?.(queries);
    };
  };
  const conditions = translateConditions(state.aq, idObjectMap, modelData);

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
                      marginRight: "auto",
                    }}
                    onClick={() =>
                      setState({
                        isAdvancedSearchVisible: !state.isAdvancedSearchVisible,
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
                {selectedRowKeys.length > 0 && (
                  <div style={{ marginRight: 20 }}>
                    <span>已选择 {selectedRowKeys.length} 项</span>
                    <a role="button" onClick={() => setSelectedRowKeys([])}>
                      {" "}
                      清空
                    </a>
                  </div>
                )}
                {props.objectId === "HOST" && !props.aliveHostsDisabled && (
                  <Checkbox
                    checked={state.aliveHosts}
                    onChange={onAliveHostsChange}
                    style={{ marginLeft: "auto" }}
                    disabled={props.fixAliveHosts}
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
                    fieldIds={state.fieldIds}
                    defaultFields={handleDefaultFields()}
                    autoBreakLine={state.autoBreakLine}
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
                key={newKey(state.fieldIds, state.aq)}
                fieldIds={state.fieldIds}
                idObjectMap={state.idObjectMap}
                modelData={modelData}
                q={state.aq}
                onSearch={onAdvancedSearch}
              />
            </div>
          )}
          {(state.q || !isEmpty(conditions)) && (
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
              {conditions.map((condition) => (
                <Tag
                  key={`${condition.attrId}${
                    condition.valuesStr
                  }-${uniqueId()}`}
                  closable
                  onClose={onAdvancedSearchCloseGen(
                    condition.attrId,
                    condition.valuesStr
                  )}
                >
                  {condition.condition}
                </Tag>
              ))}
            </div>
          )}
          <InstanceListTable
            detailUrlTemplates={props.detailUrlTemplates}
            fieldIds={state.fieldIds}
            idObjectMap={state.idObjectMap}
            modelData={modelData}
            instanceListData={state.instanceListData}
            sort={state.sort}
            asc={state.asc}
            selectedRowKeys={selectedRowKeys}
            selectDisabled={props.selectDisabled}
            sortDisabled={props.sortDisabled}
            propertyDisplayConfigs={props.propertyDisplayConfigs}
            onClickItem={props.onClickItem}
            onPaginationChange={onPaginationChange}
            onSortingChange={onSortingChange}
            onSelectionChange={onSelectionChange}
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
