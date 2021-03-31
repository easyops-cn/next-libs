import React, { useEffect, useReducer, useState, useRef } from "react";
import {
  difference,
  isEmpty,
  isEqual,
  isString,
  map,
  uniq,
  union,
  filter,
  reject,
  sortBy,
  uniqueId,
  findIndex,
  find,
  startsWith,
  compact,
} from "lodash";
import { BrickAsComponent, handleHttpError } from "@next-core/brick-kit";
import {
  PropertyDisplayConfig,
  ReadPaginationChangeDetail,
  ReadSelectionChangeDetail,
  ReadSortingChangeDetail,
  UseBrickConf,
} from "@next-core/brick-types";
import { CmdbModels, InstanceApi } from "@next-sdk/cmdb-sdk";
import { Icon as LegacyIcon } from "@ant-design/compatible";
import { Button, Spin, Input, Tag } from "antd";
import {
  getRelationObjectSides,
  forEachAvailableFields,
  getInstanceNameKeys,
  RelationIdKeys,
  RelationNameKeys,
  RelationObjectIdKeys,
} from "@next-libs/cmdb-utils";

import {
  ConditionType,
  LogicalOperators,
  Query,
  AdvancedSearch,
  getFieldConditionsAndValues,
  MoreButtonsContainer,
  InstanceListTable,
  CustomColumn,
} from "../instance-list-table";
import styles from "./InstanceList.module.css";
import {
  extraFieldAttrs,
  CMDB_MODAL_FIELDS_SETTINGS,
  CMDB_RESOURCE_FIELDS_SETTINGS,
  MAX_DEFAULT_FIELDS_COUNT,
  MAX_DEFAULT_MODAL_FIELDS_COUNT,
} from "./constants";
import { JsonStorage } from "@next-libs/storage";
import { ModelAttributeValueType } from "../model-attribute-form-control/ModelAttributeFormControl";
import { IconButton } from "./IconButton";
import { changeQueryWithCustomRules } from "../processors";
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
  modelData: Partial<CmdbModels.ModelCmdbObject>,
  t?: () => string
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
    const relationObject =
      idObjectMap[relation[`${sides.that}_object_id` as RelationObjectIdKeys]];
    const nameKeys = getInstanceNameKeys(relationObject);
    nameKeys.forEach((nameKey) => {
      const nameOfNameKey =
        find(relationObject?.attrList, ["id", nameKey])?.name ?? nameKey;
      const id = `${objectId}.${nameKey}`;
      const name = `${
        relation[`${sides.this}_name` as RelationNameKeys]
      }(${nameOfNameKey})`;
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
          query = changeQueryWithCustomRules(
            modelData.objectId,
            attr.id,
            query
          );
          const info = getFieldConditionsAndValues(
            query as any,
            key,
            attr.value.type as ModelAttributeValueType,
            undefined,
            undefined,
            modelData.objectId,
            attr.id
          );
          if (
            ![
              ConditionType.Between,
              ConditionType.Empty,
              ConditionType.NotEmpty,
              ConditionType.False,
              ConditionType.True,
            ].includes(info.currentCondition.type)
          ) {
            info.values = info.values.map((v) =>
              isString(v) && v.includes(" ") ? v.replace(/^"+|"+$/g, "") : v
            );
          }

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
  aqToShow?: Query[];
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
  onSearchExecute?(
    data: InstanceApi.PostSearchRequestBody,
    v3Data: InstanceApi.PostSearchV3RequestBody
  ): Promise<InstanceApi.PostSearchV3ResponseBody> | void;
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
  defaultQuery?: { [fieldId: string]: any }[];
  extraFilterBricks?: {
    useBrick: UseBrickConf;
  };
  extraColumns?: CustomColumn[];
}

interface InstanceListState {
  q: string;
  aq: Query[];
  aqToShow?: Query[];
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
  instanceListData?: InstanceApi.PostSearchV3ResponseBody;
  isAdvancedSearchVisible: boolean;
  fieldIds: string[];
  autoBreakLine: boolean;
  fieldToShow?: Record<string, any[]>[];
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
    let fieldIds: string[] =
      settings.defaultFields[modelData.objectId] ||
      difference(uniq(map(modelData.attrList, "id")), ignoredFields).slice(
        0,
        inModal ? MAX_DEFAULT_MODAL_FIELDS_COUNT : MAX_DEFAULT_FIELDS_COUNT
      );
    const hideModelData: string[] = modelData.view.hide_columns || [];
    fieldIds = fieldIds.filter((field) => !hideModelData.includes(field));
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
    let fieldIds = props.presetConfigs?.fieldIds;
    if (isEmpty(fieldIds)) {
      fieldIds = jsonLocalStorage.getItem(
        `${modelData.objectId}-selectAttrIds`
      );
    }

    if (isEmpty(fieldIds)) {
      fieldIds = computeDefaultFields().fieldIds;
    }
    fieldIds = _sortFieldIds(fieldIds);
    const hideModelData: string[] = modelData.view.hide_columns || [];
    fieldIds = fieldIds.filter((field) => !hideModelData.includes(field));
    return fieldIds;
  };

  setModelData();
  const initState: InstanceListState = {
    q: props.q,
    aq: props.aq,
    aqToShow: props.aqToShow || props.aq,
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
    fieldIds: getFields(),
    autoBreakLine: false,
  };
  const [q, setQ] = useState(props.q);
  const [state, setState] = useReducer(reducer, initState);
  const [selectedRowKeys, setSelectedRowKeys] = useState(
    props.selectedRowKeys ?? []
  );
  const cache = useRef(new Map<string, InstanceApi.PostSearchV3ResponseBody>());

  const getInstanceListData = async (
    sort: string,
    asc: boolean,
    page: number
  ): Promise<InstanceApi.PostSearchV3ResponseBody> => {
    const data: InstanceApi.PostSearchRequestBody = {};
    const v3Data: InstanceApi.PostSearchV3RequestBody = {
      fields: ["instanceId"],
    };
    if (!isEmpty(props.permission)) {
      v3Data.permission = data.permission = props.permission;
    }

    let query: Record<string, any> = {};

    v3Data.page = data.page = page;
    v3Data["page_size"] = data["page_size"] = state?.pageSize ?? 10;
    if (sort) {
      data.sort = { [sort]: asc ? 1 : -1 };
      v3Data.sort = [{ key: sort, order: asc ? 1 : -1 }];
    }

    if (state.q) {
      query = getQuery(modelData, idObjectMap, state.q, state.fieldIds);
    }

    if (!isEmpty(state.aq)) {
      query[LogicalOperators.And] = state.aq;
    }

    if (!isEmpty(props.defaultQuery)) {
      query[LogicalOperators.And] = [
        ...(query[LogicalOperators.And] || []),
        ...props.defaultQuery,
      ];
    }
    if (props.presetConfigs) {
      if (!isEmpty(props.presetConfigs.query)) {
        if (query) {
          query = {
            $and: [query, props.presetConfigs.query],
          };
        } else {
          query = props.presetConfigs.query;
        }
      }
      if (state.fieldIds) {
        data.fields = Object.fromEntries(
          state.fieldIds.map((fieldId) => [fieldId, true])
        );
        v3Data.fields = state.fieldIds;
      }
    }
    if (state.aliveHosts && props.objectId === "HOST") {
      query = { ...query, _agentStatus: "正常" };
    }

    if (!isEmpty(query)) {
      v3Data.query = data.query = query;
    }

    if (state.relatedToMe) {
      v3Data.only_my_instance = data.only_my_instance = state.relatedToMe;
    }

    const promise = props.onSearchExecute?.(data, v3Data);

    return promise ? promise : InstanceApi.postSearchV3(props.objectId, v3Data);
  };

  const refreshInstanceList = async (
    sort: string,
    asc: boolean,
    page: number
  ): Promise<void> => {
    setState({ loading: true });
    try {
      const instanceListData = await getInstanceListData(sort, asc, page);
      instanceListData.list.forEach((i) => cache.current.set(i.instanceId, i));
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
    props.onPaginationChange?.({ page: state.page, pageSize: state.pageSize });
    refreshInstanceList(state.sort, state.asc, state.page);
  }, [
    state.q,
    state.aq,
    state.page,
    state.pageSize,
    state.aliveHosts,
    state.relatedToMe,
    state.fieldIds,
  ]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };

  // istanbul ignore next
  const onSelectionChange = async (selected: {
    selectedKeys: string[];
    selectedItems: any[];
  }) => {
    let { selectedItems, selectedKeys } = selected;
    setSelectedRowKeys(selectedKeys);
    if (selectedKeys.length > compact(selectedItems).length) {
      const ids = selectedKeys.filter((id) => !cache.current.has(id));
      if (ids.length) {
        const resp = await InstanceApi.postSearchV3(props.objectId, {
          fields: ["instanceId"],
          query: {
            instanceId: {
              $in: ids,
            },
          },
          page_size: ids.length,
        });
        resp.list.forEach((i) => cache.current.set(i.instanceId, i));
      }
      selectedItems = selectedKeys.map((id) => cache.current.get(id));
    }
    props.onSelectionChange?.({ selectedItems, selectedKeys });
  };

  const onSearch = (value: string) => {
    const q = value.trim();
    setState({ q });
    props.onSearch?.(q);
  };

  const onAdvancedSearch = (
    queries: Query[],
    queriesToShow: Query[],
    fieldToShow: Record<string, any[]>[]
  ) => {
    setState({
      aq: queries,
      fieldToShow,
      aqToShow: queriesToShow,
    });
    props.onAdvancedSearch?.(queries);
  };

  const onSortingChange = (info: ReadSortingChangeDetail) => {
    let asc: boolean;
    let sort: string;
    if (info.asc === undefined) {
      if (!state.sort) {
        return;
      }

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
    if (pagination.pageSize !== state.pageSize) {
      setState({ pageSize: pagination.pageSize, page: 1 });
    } else if (pagination.page !== state.page) {
      setState({ page: pagination.page });
    }
  };

  const onRelatedToMeChange = (checked: boolean) => {
    setState({ relatedToMe: checked });
    props.onRelatedToMeChange?.(checked);
  };

  const onAliveHostsChange = (checked: boolean) => {
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

  const onAdvancedSearchCloseGen = (attrId: string, valuesStr: string) => {
    return () => {
      const queries: Query[] = [];
      const queriesToShow: Query[] = [];
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
        } else if (key !== attrId && !startsWith(attrId, `${key}.`)) {
          queries.push(query);
        }
      });
      state.aqToShow.forEach((query) => {
        const key = Object.keys(query)[0];
        if (
          (key === "$or" || key === "$and") &&
          Object.keys((query[key] as Query[])[0])[0] === attrId
        ) {
          const filteredSubQueries = (query[key] as Query[]).filter((query) => {
            return Object.values(query[attrId]).join(" ") !== valuesStr;
          });
          if (filteredSubQueries.length > 0) {
            queriesToShow.push({
              [key]: filteredSubQueries,
            });
          }
        } else if (key !== attrId) {
          queriesToShow.push(query);
        }
      });
      setState({
        aq: queries,
        aqToShow: queriesToShow,
      });
      props.onAdvancedSearch?.(queries);
    };
  };
  const conditions = translateConditions(
    state.aqToShow,
    idObjectMap,
    modelData
  );

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
                    <LegacyIcon
                      type={state.isAdvancedSearchVisible ? "up" : "down"}
                    />
                  </Button>
                )}
              </div>
              <div className={styles.options}>
                {selectedRowKeys.length > 0 && (
                  <div style={{ marginRight: 20 }}>
                    <span>已选择 {selectedRowKeys.length} 项</span>
                    <a
                      role="button"
                      onClick={() =>
                        onSelectionChange({
                          selectedKeys: [],
                          selectedItems: [],
                        })
                      }
                    >
                      {" "}
                      清空
                    </a>
                  </div>
                )}
                {props.objectId === "HOST" && !props.aliveHostsDisabled && (
                  <IconButton
                    checked={state.aliveHosts}
                    onChange={onAliveHostsChange}
                    style={{ marginRight: 10 }}
                    disabled={props.fixAliveHosts}
                    type="normalHost"
                    label="正常主机"
                    data-testid="alive-hosts"
                  />
                )}
                {!props.relatedToMeDisabled && (
                  <IconButton
                    checked={state.relatedToMe}
                    onChange={onRelatedToMeChange}
                    style={{ marginRight: 10 }}
                    type="relateToMe"
                    label="与我有关"
                    data-testid="related-to-me"
                  />
                )}
                <IconButton
                  checked={state.autoBreakLine}
                  onChange={toggleAutoBreakLine}
                  style={{ marginRight: 10 }}
                  type="showHiddenInfo"
                  label="省略信息"
                  data-testid="show-hidden-info"
                />
                {!props.moreButtonsDisabled && (
                  <MoreButtonsContainer
                    modelData={modelData}
                    onHandleConfirm={handleConfirm}
                    onHandleReset={handleReset}
                    fieldIds={state.fieldIds}
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
                key={newKey(state.fieldIds, state.aq)}
                fieldIds={state.fieldIds}
                idObjectMap={state.idObjectMap}
                modelData={modelData}
                q={state.aqToShow}
                fieldToShow={state.fieldToShow}
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
          {props.extraFilterBricks?.useBrick && (
            <BrickAsComponent useBrick={props.extraFilterBricks.useBrick} />
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
            extraColumns={props.extraColumns}
          />
        </React.Fragment>
      ) : null}
    </Spin>
  );
}
