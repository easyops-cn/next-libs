import React, { useEffect, useReducer, useState, useRef, useMemo } from "react";
import _, {
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
  omit,
  keyBy,
} from "lodash";
import { BrickAsComponent, handleHttpError } from "@next-core/brick-kit";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import {
  PropertyDisplayConfig,
  ReadPaginationChangeDetail,
  ReadSelectionChangeDetail,
  ReadSortingChangeDetail,
  UseBrickConf,
} from "@next-core/brick-types";
import { TableProps } from "antd/lib/table";
import {
  CmdbModels,
  InstanceApi_PostSearchRequestBody,
  InstanceApi_PostSearchV3RequestBody,
  InstanceApi_PostSearchV3ResponseBody,
  InstanceApi_postSearchV3,
  CmdbObjectApi_getIdMapName,
  CmdbObjectApi_getObjectRef,
} from "@next-sdk/cmdb-sdk";
import { Icon as LegacyIcon } from "@ant-design/compatible";
import { Button, Spin, Input, Tag, Select } from "antd";
import {
  getRelationObjectSides,
  forEachAvailableFields,
  getInstanceNameKeys,
  RelationIdKeys,
  RelationNameKeys,
  RelationObjectIdKeys,
  RelationObjectSides,
  isSelfRelation,
  Query,
  ElementOperators,
  LogicalOperators,
  ComparisonOperators,
} from "@next-libs/cmdb-utils";
import { JsonStorage } from "@next-libs/storage";
import { ModelObjectAttr } from "@next-sdk/cmdb-sdk/dist/types/model/cmdb";

import {
  ConditionType,
  AdvancedSearch,
  getFieldConditionsAndValues,
  MoreButtonsContainer,
  InstanceListTable,
  CustomColumn,
  Field,
} from "../instance-list-table";
import styles from "./InstanceList.module.css";
import {
  extraFieldAttrs,
  CMDB_MODAL_FIELDS_SETTINGS,
  CMDB_RESOURCE_FIELDS_SETTINGS,
  objectListCache,
} from "./constants";
import { ModelAttributeValueType } from "../model-attribute-form-control/ModelAttributeFormControl";
import { IconButton } from "./IconButton";
import { changeQueryWithCustomRules } from "../processors";
import { DisplaySettingsModalData } from "../instance-list-table/DisplaySettingsModal";
export interface InstanceListPresetConfigs {
  query?: Record<string, any>;
  fieldIds?: string[];
}

export function getQuery(
  modelData: Partial<CmdbModels.ModelCmdbObject>,
  idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>,
  q: string,
  fields?: string[],
  onlySearchByIp?: boolean
) {
  const query: Record<string, any> = { $or: [] };

  const queryValues = q.trim().split(/\s+/);
  if (onlySearchByIp) {
    query.$or.push({ ip: { $like: `%${q.trim()}%` } });
    return query;
  }
  forEachAvailableFields(
    modelData,
    (attr) => {
      queryValues.forEach((queryValue) =>
        query.$or.push({ [attr.id]: { $like: `%${queryValue}%` } })
      );
    },
    (relation, sides) => {
      const id = relation[`${sides.this}_id` as RelationIdKeys];
      const nameKeys = getInstanceNameKeys(
        idObjectMap[relation[`${sides.that}_object_id` as RelationObjectIdKeys]]
      );

      queryValues.forEach((queryValue) => {
        nameKeys.forEach((nameKey) => {
          query.$or.push({
            [`${id}.${nameKey}`]: { $like: `%${queryValue}%` },
          });
        });
      });
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
    let sidesArr: RelationObjectSides[] = [];
    if (isSelfRelation(relation)) {
      sidesArr = [
        { this: "left", that: "right" },
        { this: "right", that: "left" },
      ];
    } else {
      sidesArr = [getRelationObjectSides(relation, modelData)];
    }
    sidesArr.forEach((sides) => {
      const objectId = relation[`${sides.this}_id` as RelationIdKeys];
      const relationObject =
        idObjectMap[
          relation[`${sides.that}_object_id` as RelationObjectIdKeys]
        ];
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
      relations.push({
        id: `${objectId}.`,
        name: `${relation[`${sides.this}_name` as RelationNameKeys]}`,
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
        const value = Object.values(query)[0];
        let attr = attrAndRelationList.find(
          (attr) => attr.id === key || attr.relationSideId === key
        );
        if (
          Object.keys(value)[0] === ElementOperators.Exists &&
          attr.relationSideId
        ) {
          const relationSideId = attr.relationSideId;
          attr =
            attrAndRelationList.find(
              (attr) => attr.id === `${relationSideId}.`
            ) || attr;
        }
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
          const curCondition = {
            attrId: key,
            condition,
            valuesStr: info.queryValuesStr,
          };
          if (
            conditions.every(
              (v) => !isEqual(omit(v, "attrId"), omit(curCondition, "attrId"))
            )
          ) {
            conditions.push(curCondition);
          }
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
const isOfStruct = (
  modelData: Partial<CmdbModels.ModelCmdbObject>,
  fieldId: string
) => {
  const structFields = modelData.attrList
    .filter(
      (attr: Partial<ModelObjectAttr>) =>
        attr.value.type === "struct" || attr.value.type === "structs"
    )
    ?.map((attr) => {
      const structs: string[] = [];
      attr.value.struct_define.forEach((struct) => {
        structs.push(`${attr.id}.${struct.id}`);
      });
      return structs;
    })
    .flat();
  return structFields.includes(fieldId);
};

const isOfBoolean = (
  attrList: Partial<CmdbModels.ModelObjectAttr>[],
  fieldId: string
): boolean => {
  const keyAttrMap = keyBy(attrList, "id");
  return keyAttrMap[fieldId]?.value.type === ModelAttributeValueType.BOOLEAN;
};

export const initAqToShow = (
  aq: Query[],
  modelData: Partial<CmdbModels.ModelCmdbObject>,
  isToShow = true
) => {
  let newAqToShow: any[] = [];
  if (aq) {
    aq.forEach((query) => {
      const aqToShow = Object.entries(query).map(([key, expressions]) => {
        let newExpressions: any[] = [];
        if (key === LogicalOperators.Or || key === LogicalOperators.And) {
          const firstSubQuery = (expressions as Query[])[0];
          const fieldId = Object.keys(firstSubQuery)[0];
          const isStruct = isOfStruct(modelData, fieldId);
          const isBool = isOfBoolean(modelData.attrList, fieldId);
          const structQueries: Record<string, any> = (
            expressions as Query[]
          ).filter((expression) => Object.keys(expression)[0] === fieldId);
          if (isStruct && isToShow) {
            const structExpressions = structQueries.map((item: any) => ({
              [fieldId.split(".")[0]]: item[fieldId],
            }));
            newExpressions = [...newExpressions, ...structExpressions];
          } else if (isBool && !isToShow) {
            const boolExpressions = (expressions as Query[]).map(
              (expression) => {
                const targetValue = expression[fieldId] as Record<
                  ComparisonOperators,
                  any
                >;
                if (typeof Object.values(targetValue)[0] === "string") {
                  return {
                    [fieldId]: {
                      [Object.keys(targetValue)[0]]:
                        Object.values(targetValue)[0] === "true",
                    },
                  };
                } else {
                  return expression;
                }
              }
            );
            newExpressions = [...newExpressions, ...boolExpressions];
          } else {
            newExpressions = [...newExpressions, ...(expressions as Query[])];
          }
          return { [key]: newExpressions };
        } else {
          return query;
        }
      });
      newAqToShow = [...newAqToShow, ...aqToShow];
    });
    return newAqToShow;
  }
  return;
};

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
  showHiddenInfoDisabled?: boolean;
  moreButtonsDisabled?: boolean;
  aliveHosts?: boolean;
  fixAliveHosts?: boolean;
  aliveHostsDisabled?: boolean;
  propertyDisplayConfigs?: PropertyDisplayConfig[];
  selectedRowKeys?: string[];
  selectDisabled?: boolean;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
  filterInstanceSourceDisabled?: boolean;
  instanceSourceQuery?: string;
  isInstanceFilterForm?: boolean;
  onSearchExecute?(
    data: InstanceApi_PostSearchRequestBody,
    v3Data: InstanceApi_PostSearchV3RequestBody
  ): Promise<InstanceApi_PostSearchV3ResponseBody> | void;
  onSearch?(value: string): void;
  onAdvancedSearch?(queries: Query[]): void;
  onClickItem?(
    evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ): void;
  onClickItemV2?(
    evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    record: Record<string, any>
  ): void;
  onPaginationChange?(pagination: ReadPaginationChangeDetail): void;
  onSortingChange?(sorting: ReadSortingChangeDetail): void;
  onSelectionChange?(selection: ReadSelectionChangeDetail): void;
  onRelatedToMeChange?(value: boolean): void;
  onAliveHostsChange?(value: boolean): void;
  onInstanceSourceChange?(instanceResource: string): void;
  onFieldsModalConfirm?(fields: Record<string, any>): void;
  relationLinkDisabled?: boolean;
  notifyCurrentFields?: (fiels: string[]) => void;
  defaultQuery?: { [fieldId: string]: any }[];
  extraFilterBricks?: {
    useBrick: UseBrickConf;
  };
  extraColumns?: CustomColumn[];
  extraDisabledField?: string;
  hideSearchConditions?: boolean;
  onlySearchByIp?: boolean;
  target?: string;
  ipCopy?: boolean;
  enableSearchByApp?: boolean;
  dataSource?: {
    list: Record<string, any>[];
    total?: number;
    page?: number;
    pageSize?: number;
  };
  separatorUsedInRelationData?: string;
  hideInstanceList?: boolean;
  autoSearch?: (fields: Field[]) => void;
  disabledDefaultFields?: boolean;
  showTooltip?: boolean;
  showFixedHeader?: boolean;
  rowSelectionType?: "checkbox" | "radio";
}

interface InstanceListState {
  objectId: string;
  q: string;
  aq: Query[];
  aqToShow?: Query[];
  instanceSourceQuery: string;
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
  instanceListData?: InstanceApi_PostSearchV3ResponseBody;
  isAdvancedSearchVisible: boolean;
  fieldIds: string[];
  autoBreakLine: boolean;
  fieldToShow?: Record<string, any[]>[];
  appSearchInstanceId?: string;
  currentChangeSelect?: string;
  appSelectValue?: string;
  clusterValue?: string;
  appList?: Record<string, any>[];
  clusterList?: Record<string, any>[];
  searchByApp?: boolean;
  showTooltip?: boolean;
}

export function LegacyInstanceList(
  props: InstanceListProps
): React.ReactElement {
  const { showTooltip = true } = props;
  const baseList = [
    {
      instanceId: "all",
      name: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ALL_CLUSTER}`),
    },
  ];
  const jsonLocalStorage = new JsonStorage(localStorage);
  const reducer = (
    prevState: InstanceListState,
    updatedProperty: Partial<InstanceListState>
  ): InstanceListState => {
    return {
      ...prevState,
      ...updatedProperty,
    };
  };

  const { modelData, idObjectMap } = useMemo(() => {
    let modelData: Partial<CmdbModels.ModelCmdbObject>;
    const idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>> = {};
    props.objectList.forEach((object) => {
      idObjectMap[object.objectId] = object;
      if (object.objectId === props.objectId) {
        modelData = object;
        modelData.attrList = !props.disabledDefaultFields
          ? union(object.attrList, extraFieldAttrs)
          : object.attrList;
      }
    });

    return { modelData, idObjectMap };
  }, [props.objectList, props.objectId]);

  const [inheritanceModelIdNameMap, setInheritanceModelIdNameMap] = useState<
    Record<string, string>
  >({});
  const [fixedHeader, setFixHeader] = useState(false);

  const fetchInheritanceModelIdNameMap = async (
    modelData: Partial<CmdbModels.ModelCmdbObject>
  ): Promise<void> => {
    let idNameMap = {};
    if (modelData.isAbstract) {
      idNameMap = await CmdbObjectApi_getIdMapName({
        parentObjectId: modelData.objectId,
      } as any);
    }
    setInheritanceModelIdNameMap(idNameMap);
  };

  useEffect(() => {
    fetchInheritanceModelIdNameMap(modelData);
  }, [modelData]);

  const computeDefaultFields = (
    { inModal } = { inModal: false }
  ): { fieldIds: string[] } => {
    // 原来有隐藏逻辑，针对 APP、HOST、USER、USER_GROUP模型，默认字段特殊处理了，现产品要求干掉，统一取8个默认字段，也不区分是否是内置模型
    const settings: any = inModal
      ? CMDB_MODAL_FIELDS_SETTINGS
      : CMDB_RESOURCE_FIELDS_SETTINGS;
    const ignoredFields: string[] =
      settings.ignoredFields[modelData.objectId] || [];
    let fieldIds: string[] = difference(
      uniq(map(modelData.attrList, "id")),
      ignoredFields
    ).slice(0, 8);
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
    fieldIds = props.extraDisabledField
      ? uniq([...fieldIds, props.extraDisabledField])
      : fieldIds;
    fieldIds = _sortFieldIds(fieldIds);
    const hideModelData: string[] = modelData.view.hide_columns || [];
    fieldIds = fieldIds.filter((field) => !hideModelData.includes(field));
    modelData.isAbstract && fieldIds.push("_object_id");
    return fieldIds;
  };

  const [q, setQ] = useState(props.q);
  const [state, setState] = useReducer(reducer, undefined, () => ({
    objectId: props.objectId,
    q: props.q,
    aq: initAqToShow(props.aq, modelData, false),
    aqToShow: props.aqToShow || initAqToShow(props.aq, modelData),
    instanceSourceQuery: props.instanceSourceQuery,
    asc: props.asc,
    sort: props.sort,
    page: props.dataSource?.page ?? props.page ?? 1,
    pageSize: props.dataSource?.pageSize ?? props.pageSize ?? 10,
    aliveHosts: props.aliveHosts,
    relatedToMe: props.relatedToMe,
    inited: false,
    loading: false,
    failed: false,
    isAdvancedSearchVisible: false,
    fieldIds: getFields(),
    autoBreakLine: false,
    appSearchInstanceId: "",
    currentChangeSelect: "App",
    appSelectValue: "",
    clusterValue: "all",
    appList: [],
    clusterList: [
      {
        instanceId: "all",
        name: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ALL_CLUSTER}`),
      },
    ],
    searchByApp: false,
  }));
  const [selectedRowKeys, setSelectedRowKeys] = useState(
    props.selectedRowKeys ?? []
  );
  const cache = useRef(new Map<string, InstanceApi_PostSearchV3ResponseBody>());
  const isFirstRunRef = useRef(true);

  const getInstanceListData = async (
    sort: string,
    asc: boolean,
    page: number
  ): Promise<InstanceApi_PostSearchV3ResponseBody> => {
    const data: InstanceApi_PostSearchRequestBody = {};
    const v3Data: InstanceApi_PostSearchV3RequestBody = {
      fields: ["instanceId"],
    };
    if (!isEmpty(props.permission)) {
      v3Data.permission = data.permission = props.permission;
    }

    let query: Record<string, any> = {};

    v3Data.page = data.page = page;
    v3Data["page_size"] = data["page_size"] = state.pageSize;
    const sortType = modelData?.attrList?.find((attr) => attr.id === sort)
      ?.value?.default_type;
    const order = ["series-number", "auto-increment-id"].includes(sortType)
      ? asc
        ? 2
        : -2
      : asc
      ? 1
      : -1;
    if (sort) {
      data.sort = { [sort]: order };
      v3Data.sort = [{ key: sort, order }];
    }

    if (state.q) {
      query = getQuery(
        modelData,
        idObjectMap,
        state.q,
        state.fieldIds,
        props.onlySearchByIp
      );
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
        if (Object.keys(query).length) {
          query = {
            $and: [query, props.presetConfigs.query],
          };
        } else {
          query = props.presetConfigs.query;
        }
      }
    }
    if (state.fieldIds) {
      data.fields = Object.fromEntries(
        state.fieldIds.map((fieldId) => [fieldId, true])
      );
      v3Data.fields = [...state.fieldIds, ...v3Data.fields];
      (v3Data as any).ignore_missing_field_error = true;
    }
    if (state.aliveHosts && props.objectId === "HOST") {
      query = { ...query, _agentStatus: "正常" };
    }
    if (state.instanceSourceQuery) {
      query = { ...query, _object_id: state.instanceSourceQuery };
    }

    if (!isEmpty(query)) {
      v3Data.query = data.query = query;
    }

    if (state.relatedToMe) {
      v3Data.only_my_instance = data.only_my_instance = state.relatedToMe;
    }
    //按应用筛选
    // istanbul ignore next (state is not updated)
    if (state.searchByApp) {
      v3Data.query = {
        [state.currentChangeSelect === "App" ||
        (state.currentChangeSelect === "Cluster" &&
          state.clusterValue === "all")
          ? "_deviceList_CLUSTER.appId.instanceId"
          : "_deviceList_CLUSTER.instanceId"]: state.appSearchInstanceId,
        ...(state.aliveHosts && props.objectId === "HOST"
          ? { _agentStatus: "正常" }
          : {}),
      };
    }
    const promise = props.onSearchExecute?.(data, v3Data);

    return promise ? promise : InstanceApi_postSearchV3(props.objectId, v3Data);
  };

  const refreshInstanceList = async (
    sort: string,
    asc: boolean,
    page: number
  ): Promise<void> => {
    setState({ loading: true });
    try {
      if (props.dataSource) {
        setState({
          idObjectMap: idObjectMap,
          instanceListData: props.dataSource,
        });
      } else {
        if (!props.hideInstanceList) {
          const instanceListData = await getInstanceListData(sort, asc, page);
          instanceListData.list.forEach((i) =>
            cache.current.set(i.instanceId, i)
          );
          setState({ idObjectMap: idObjectMap, instanceListData });
        } else {
          setState({
            idObjectMap: idObjectMap,
            instanceListData: [] as InstanceApi_PostSearchV3ResponseBody,
          });
        }
      }
    } catch (e) {
      handleHttpError(e);
      setState({ failed: true });
    } finally {
      setState({ inited: true, loading: false });
    }
  };

  useEffect(() => {
    const fieldIds = getFields();
    if (
      // 当 props.objectId 改变时，总是更新 state.fieldIds
      props.objectId !== state.objectId ||
      !isEqual(fieldIds, state.fieldIds)
    ) {
      setState({
        fieldIds,
      });
    }
  }, [props.objectId, props.presetConfigs]);

  useEffect(() => {
    setSelectedRowKeys(props.selectedRowKeys ?? []);
  }, [props.objectId, props.selectedRowKeys]);

  // on filter condition change
  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }

    let skip = false;

    if (state.page !== 1) {
      setState({ page: 1 });
      props.onPaginationChange?.({ page: 1, pageSize: state.pageSize });
      skip = true;
    }

    // 当 prop.objectId 改变时先跳过，等 state.fieldIds 更新后再获取数据
    if (props.objectId !== state.objectId) {
      setState({ objectId: props.objectId });
      skip = true;
    }

    if (skip) {
      return;
    }

    refreshInstanceList(state.sort, state.asc, 1);
  }, [
    state.q,
    state.aq,
    state.instanceSourceQuery,
    state.pageSize,
    state.aliveHosts,
    state.relatedToMe,
    props.objectId,
    props.permission,
    props.defaultQuery,
  ]);

  // on other condition change
  useEffect(() => {
    if (isEmpty(state.fieldIds)) return;

    refreshInstanceList(state.sort, state.asc, state.page);
  }, [
    state.page,
    state.sort,
    state.asc,
    state.fieldIds,
    state.appSearchInstanceId,
    state.currentChangeSelect,
    state.searchByApp,
    props.dataSource,
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
        const resp = await InstanceApi_postSearchV3(props.objectId, {
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
  };

  const onPaginationChange = (pagination: ReadPaginationChangeDetail) => {
    setState({ page: pagination.page, pageSize: pagination.pageSize });
    props.onPaginationChange?.(pagination);
  };

  const onInstanceSourceChange = (instanceSourceQuery: string) => {
    setState({ instanceSourceQuery });
    props.onInstanceSourceChange?.(instanceSourceQuery);
  };

  const onRelatedToMeChange = (checked: boolean) => {
    setState({ relatedToMe: checked });
    props.onRelatedToMeChange?.(checked);
  };

  const onAliveHostsChange = (checked: boolean) => {
    setState({ aliveHosts: checked });
    props.onAliveHostsChange?.(checked);
  };

  const toggleAutoBreakLine = (autoBreakLine: boolean) => {
    setState({ autoBreakLine });
  };
  // istanbul ignore next (state is not updated)
  const toggleSearchMode = React.useCallback(async () => {
    if (!state.searchByApp) {
      const appListResp = await InstanceApi_postSearchV3("APP", {
        fields: ["clusters", "instanceId", "name"],
        sort: [{ key: "name", order: 1 }],
        page: 1,
        page_size: 3000,
      });
      setState({
        appSearchInstanceId: appListResp.list?.[0].instanceId || "",
        appList: appListResp.list,
        clusterList: [...baseList, ...(appListResp.list?.[0].clusters || [])],
        searchByApp: true,
        appSelectValue: appListResp.list?.[0].instanceId || "",
        clusterValue: "all",
      });
    } else {
      setState({ searchByApp: false });
    }
  }, [state.searchByApp]);
  // istanbul ignore next (state is not updated)
  const appSelectChange = (v: string) => {
    setState({
      appSearchInstanceId: v,
      currentChangeSelect: "App",
      appSelectValue: v,
      clusterValue: "all",
      clusterList: [
        ...baseList,
        ...state.appList.find((r) => r.instanceId === v).clusters,
      ],
    });
  };
  // istanbul ignore next (state is not updated)
  const clusterSelectChange = (v: string) => {
    setState({
      appSearchInstanceId: v === "all" ? state.appSelectValue : v,
      currentChangeSelect: "Cluster",
      clusterValue: v,
    });
  };
  const defaultFields = useMemo(() => {
    let defaultFields: string[];
    if (!isEmpty(props.presetConfigs?.fieldIds)) {
      defaultFields = props.presetConfigs.fieldIds;
    } else {
      defaultFields = computeDefaultFields().fieldIds;
    }
    return defaultFields;
  }, [props.presetConfigs, modelData]);

  // istanbul ignore next
  const handleConfirm = ({ fields, isReset }: DisplaySettingsModalData) => {
    if (isReset) {
      const fieldIds = defaultFields;
      modelData.isAbstract && fieldIds.push("_object_id");
      setState({ fieldIds });
      jsonLocalStorage.removeItem(`${modelData.objectId}-selectAttrIds`);
      props.onFieldsModalConfirm(fieldIds);
    } else {
      setState({
        fieldIds: _sortFieldIds(fields),
      });
      jsonLocalStorage.setItem(`${modelData.objectId}-selectAttrIds`, fields);
      props.onFieldsModalConfirm(fields);
    }
  };

  useEffect(() => {
    props.notifyCurrentFields?.(state.fieldIds);
  }, [props.notifyCurrentFields]);

  // istanbul ignore next
  useEffect(() => {
    props.selectedRowKeys?.length &&
      (async () => {
        const data: InstanceApi_PostSearchRequestBody = {};
        const v3Data: InstanceApi_PostSearchV3RequestBody = {
          fields: ["instanceId"],
        };
        if (!isEmpty(props.permission)) {
          v3Data.permission = data.permission = props.permission;
        }

        if (state.fieldIds) {
          data.fields = Object.fromEntries(
            state.fieldIds.map((fieldId) => [fieldId, true])
          );
          v3Data.fields = [...state.fieldIds, ...v3Data.fields];
          (v3Data as any).ignore_missing_field_error = true;
        }

        v3Data.query = {
          instanceId: {
            $in: props.selectedRowKeys,
          },
        };
        v3Data.page_size = props.selectedRowKeys.length;

        if (state.relatedToMe) {
          v3Data.only_my_instance = data.only_my_instance = state.relatedToMe;
        }

        const resp = await InstanceApi_postSearchV3(props.objectId, v3Data);
        resp.list.forEach((i) => cache.current.set(i.instanceId, i));
      })();
  }, [props.selectedRowKeys]);
  const handleToggleFixHeader = () => {
    setFixHeader(!fixedHeader);
  };
  const onAdvancedSearchCloseGen = (attrId: string, valuesStr: string) => {
    return () => {
      const queries: Query[] = [];
      const queriesToShow: Query[] = [];
      const isValueEqual = (query: any) =>
        query[attrId]
          ? Object.values(query[attrId]).join(" ") !== valuesStr
          : false;
      const filterAq = (queries: any[]) =>
        queries.filter((v: any) => isValueEqual(v));
      const specialQueryHandler = (query: any, key: any, queries: Query[]) => {
        // $exists $gte $lte 针对为空，不为空，时间范围特殊处理
        const isSpecial = Object.keys(query[key] as Query[]).some(
          (v) => v === "$exists" || v === "$gte" || v === "$lte"
        );
        if (isSpecial) {
          return;
        }
        queries.push(query);
      };
      state.aq.forEach((query) => {
        const key = Object.keys(query)[0];
        if (
          (key === "$or" || key === "$and") &&
          Object.keys((query[key] as Query[])[0])[0] === attrId
        ) {
          const filteredSubQueries = filterAq(query[key] as Query[]);
          if (filteredSubQueries.length > 0) {
            queries.push({
              [key]: filteredSubQueries,
            });
          }
        } else if (key !== attrId && !startsWith(attrId, `${key}.`)) {
          queries.push(query);
        } else if (
          props.isInstanceFilterForm &&
          key === attrId &&
          isValueEqual(query)
        ) {
          specialQueryHandler(query, key, queries);
        }
      });
      state.aqToShow.forEach((query) => {
        const key = Object.keys(query)[0];
        if (
          (key === "$or" || key === "$and") &&
          Object.keys((query[key] as Query[])[0])[0] === attrId
        ) {
          const filteredSubQueries = filterAq(query[key] as Query[]);
          if (filteredSubQueries.length > 0) {
            queriesToShow.push({
              [key]: filteredSubQueries,
            });
          }
        } else if (key !== attrId) {
          queriesToShow.push(query);
        } else if (
          props.isInstanceFilterForm &&
          key === attrId &&
          isValueEqual(query)
        ) {
          specialQueryHandler(query, key, queriesToShow);
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
            !props.aliveHostsDisabled ||
            !props.moreButtonsDisabled) && (
            <div className={styles.instanceListToolbar}>
              <div className={styles.searchRelated}>
                {/* istanbul ignore next (state is not updated) */}
                {!state.searchByApp ? (
                  <>
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
                            isAdvancedSearchVisible:
                              !state.isAdvancedSearchVisible,
                          })
                        }
                        data-testid="advanced-search-toggle-btn"
                      >
                        {i18n.t(
                          `${NS_LIBS_CMDB_INSTANCES}:${K.ADVANCED_SEARCH}`
                        )}
                        <LegacyIcon
                          type={state.isAdvancedSearchVisible ? "up" : "down"}
                        />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Select
                      style={{ width: "150px", marginRight: "10px" }}
                      value={state.appSelectValue}
                      onChange={appSelectChange}
                      showSearch={true}
                      optionFilterProp="children"
                    >
                      {state.appList.map((r) => (
                        <Select.Option key={r.instanceId} value={r.instanceId}>
                          {r.name}
                        </Select.Option>
                      ))}
                    </Select>
                    <Select
                      style={{ width: "150px" }}
                      value={state.clusterValue}
                      onChange={clusterSelectChange}
                      showSearch={true}
                      optionFilterProp="children"
                    >
                      {state.clusterList.map((r) => (
                        <Select.Option key={r.instanceId} value={r.instanceId}>
                          {r.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </>
                )}
              </div>
              <div className={styles.options}>
                {selectedRowKeys.length > 0 && (
                  <div style={{ marginRight: 20 }}>
                    <span>
                      {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CHOSEN_OPTIONS}`, {
                        count: selectedRowKeys.length,
                      })}
                    </span>
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
                      {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLEAR}`)}
                    </a>
                  </div>
                )}
                {props.objectId === "HOST" && props.enableSearchByApp && (
                  <Button type={"link"} onClick={toggleSearchMode}>
                    {/* istanbul ignore next (state is not updated) */}
                    {state.searchByApp
                      ? i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.FREE_SELECTION}`)
                      : i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.APP_SELECTION}`)}
                  </Button>
                )}
                {props.objectId === "HOST" && !props.aliveHostsDisabled && (
                  <IconButton
                    checked={state.aliveHosts}
                    onChange={onAliveHostsChange}
                    style={{ marginRight: 10 }}
                    disabled={props.fixAliveHosts}
                    type="normalHost"
                    label={i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NORMAL_HOST}`)}
                    data-testid="alive-hosts"
                  />
                )}
                {!props.relatedToMeDisabled && (
                  <IconButton
                    checked={state.relatedToMe}
                    onChange={onRelatedToMeChange}
                    style={{ marginRight: 10 }}
                    type="relateToMe"
                    label={i18n.t(
                      `${NS_LIBS_CMDB_INSTANCES}:${K.RELATED_TO_ME}`
                    )}
                    data-testid="related-to-me"
                  />
                )}
                {!props.showHiddenInfoDisabled && (
                  <IconButton
                    checked={state.autoBreakLine}
                    onChange={toggleAutoBreakLine}
                    style={{ marginRight: 10 }}
                    type="showHiddenInfo"
                    label={i18n.t(
                      `${NS_LIBS_CMDB_INSTANCES}:${K.DISPLAY_OMITTED_INFORMATION}`
                    )}
                    data-testid="show-hidden-info"
                  />
                )}
                {!props.moreButtonsDisabled && (
                  <MoreButtonsContainer
                    modelData={modelData}
                    onConfirm={handleConfirm}
                    fieldIds={state.fieldIds}
                    defaultFields={defaultFields}
                    extraDisabledField={props.extraDisabledField}
                    handleToggleFixHeader={handleToggleFixHeader}
                    fixedHeader={fixedHeader}
                    showFixedHeader={props.showFixedHeader}
                  />
                )}
              </div>
            </div>
          )}
          {!props.advancedSearchDisabled && !state.searchByApp && (
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
                {...(props.autoSearch
                  ? {
                      autoSearch: props.autoSearch,
                    }
                  : null)}
              />
            </div>
          )}
          {!props.hideSearchConditions &&
            !state.searchByApp &&
            (state.instanceSourceQuery || state.q || !isEmpty(conditions)) && (
              <div className={styles.searchConditions}>
                <span>
                  {i18n.t(
                    `${NS_LIBS_CMDB_INSTANCES}:${K.CURRENT_FILTER_REQUIREMENTS}`
                  )}
                </span>
                {state.q && (
                  <Tag
                    closable
                    onClose={() => {
                      setQ("");
                      onSearch("");
                    }}
                  >
                    {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.FUZZY_SEARCH}`, {
                      query: state.q,
                    })}
                  </Tag>
                )}
                {state.instanceSourceQuery && (
                  <Tag
                    closable
                    onClose={() => {
                      onInstanceSourceChange(null);
                    }}
                  >
                    {i18n.t(
                      `${NS_LIBS_CMDB_INSTANCES}:${K.INSTANCE_SOURCE_TAG_TEXT}`,
                      {
                        query:
                          inheritanceModelIdNameMap?.[
                            state.instanceSourceQuery
                          ] || state.instanceSourceQuery,
                      }
                    )}
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
          {!props.hideInstanceList && (
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
              onClickItemV2={props.onClickItemV2}
              onPaginationChange={onPaginationChange}
              onSortingChange={onSortingChange}
              onSelectionChange={onSelectionChange}
              onInstanceSourceChange={onInstanceSourceChange}
              instanceSourceQuery={state.instanceSourceQuery}
              inheritanceModelIdNameMap={inheritanceModelIdNameMap}
              filterInstanceSourceDisabled={props.filterInstanceSourceDisabled}
              autoBreakLine={state.autoBreakLine}
              relationLinkDisabled={props.relationLinkDisabled}
              pageSizeOptions={props.pageSizeOptions}
              showSizeChanger={props.showSizeChanger}
              extraColumns={props.extraColumns}
              target={props.target}
              ipCopy={props.ipCopy}
              fixedHeader={fixedHeader}
              separatorUsedInRelationData={props.separatorUsedInRelationData}
              showTooltip={showTooltip}
              rowSelectionType={props.rowSelectionType}
            />
          )}
        </React.Fragment>
      ) : null}
    </Spin>
  );
}

export function InstanceList(props: InstanceListProps): React.ReactElement {
  const [objectList, setObjectList] = useState<
    Partial<CmdbModels.ModelCmdbObject>[]
  >(props.objectList);

  useEffect(() => {
    (async () => {
      const cacheData = objectListCache.get(props.objectId);
      if (isEmpty(objectList)) {
        if (cacheData) {
          setObjectList(cacheData);
        } else {
          try {
            const list = (
              await CmdbObjectApi_getObjectRef({ ref_object: props.objectId })
            ).data;
            setObjectList(list);
            objectListCache.set(props.objectId, list);
          } catch (e) {
            handleHttpError(e);
          }
        }
      }
    })();
  }, [props.objectId, objectList]);

  if (isEmpty(objectList)) return null;

  return <LegacyInstanceList {...props} objectList={objectList} />;
}
