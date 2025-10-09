import React, {
  useEffect,
  useReducer,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
  omit,
  keyBy,
  cloneDeep,
  isNil,
  get,
  isArray,
} from "lodash";
import {
  BrickAsComponent,
  getRuntime,
  handleHttpError,
  useProvider,
} from "@next-core/brick-kit";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import {
  PropertyDisplayConfig,
  ReadPaginationChangeDetail,
  ReadSelectionChangeDetail,
  ReadSortingChangeDetail,
  UseBrickConf,
} from "@next-core/brick-types";
import {
  CmdbModels,
  InstanceApi_PostSearchRequestBody,
  InstanceApi_PostSearchV3RequestBody,
  InstanceApi_PostSearchV3ResponseBody,
  InstanceApi_postSearchV3,
  CmdbObjectApi_getIdMapName,
  CmdbObjectApi_getObjectRef,
  CmdbObjectApi_list,
} from "@next-sdk/cmdb-sdk";
import { Icon as LegacyIcon } from "@ant-design/compatible";
import { Button, Spin, Input, Tag, Select, Popover, message } from "antd";
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
  TransHierRelationType,
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
  UseBrickAndPropertyDisplayConfig,
} from "../instance-list-table";
import { InstanceListDrawer } from "../instance-list-drawer/InstanceListDrawer";
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
import FilterInstanceSource from "./FilterInstanceSource";
import { ColumnType } from "antd/lib/table";

export interface instanceArchiveRequestBody {
  // 搜索内容
  key_word?: string;
  /** 页码 */
  page?: number;
  /** 页大小 */
  page_size?: number;
  fields?: string;
}
interface ISortField {
  field: string;
  order: number;
}
type ObjectType = Partial<CmdbModels.ModelCmdbObject> & {
  view?: Partial<CmdbModels.ModelObjectView> & {
    trans_hier_relation_list?: TransHierRelationType[];
  };
};
export interface InstanceListPresetConfigs {
  query?: Record<string, any>;
  fieldIds?: string[];
}
export function joinRelationFieldAndShowkey(
  fields: string[],
  modelData: Record<string, any>,
  objectList: Record<string, any>[]
) {
  const attrIdMap = keyBy(modelData.attrList, "id");
  return fields.map((field) => {
    if (attrIdMap[field]) {
      return field;
    } else {
      const relation = modelData.relation_list.find(
        (relation: any) =>
          relation.left_id === field || relation.right_id === field
      );
      if (relation) {
        const isLeft = relation.left_object_id === modelData.objectId;
        const otherSideObjectId = isLeft
          ? relation.right_object_id
          : relation.left_object_id;
        const otherSideObject = objectList.find(
          (object) => object.objectId === otherSideObjectId
        );
        const showKey = otherSideObject?.view?.show_key?.[0] ?? "";
        return `${field}.${showKey}`;
      } else {
        return field;
      }
    }
  });
}

export function getQuery(
  modelData: Partial<CmdbModels.ModelCmdbObject>,
  idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>,
  q: string,
  fields?: string[],
  onlySearchByIp?: boolean,
  extraFixedFields?: string[]
) {
  const query: Record<string, any> = { $or: [] };
  const queryValues = q.trim().split(/\s+/);
  if (onlySearchByIp) {
    const searchIpFields =
      (getRuntime().getCurrentApp().config?.searchIpFields as string[]) || [];
    const queryOrs = [
      ...new Set([
        "ip",
        ...uniq([...searchIpFields, ...(extraFixedFields || [])]),
      ]),
    ];
    const searchValue = { $like: `%${q.trim()}%` };
    queryOrs.forEach((key) => {
      query.$or.push({ [key]: searchValue });
    });
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
    fields,
    //istanbul ignore next
    (relation: TransHierRelationType) => {
      const relationObject = idObjectMap[relation.relation_object];
      const showKeys = relation.display_keys?.length
        ? relation.display_keys
        : getInstanceNameKeys(relationObject);

      queryValues.forEach((queryValue) => {
        showKeys.forEach((nameKey) => {
          query.$or.push({
            [`${relation.relation_id}.${nameKey}`]: {
              $like: `%${queryValue}%`,
            },
          });
        });
      });
    }
  );

  return query;
}

export const isSpecialFn = (query: any, attrId: string) => {
  return Object.keys(query[attrId] as Query[]).some(
    (v) => v === "$exists" || v === "$gte" || v === "$lte"
  );
};

export const specialQueryHandler = (query: any, key: any, queries: Query[]) => {
  // $exists $gte $lte 针对为空，不为空，时间范围特殊处理
  const isSpecial = isSpecialFn(query, key);
  if (isSpecial) {
    return;
  }
  queries.push(query);
};

export const isValueEqualFn = (
  query: any,
  attrId: string,
  valuesStr?: string
) => {
  const isSpecial = isSpecialFn(query, attrId);
  if (isSpecial) return false;
  return query[attrId]
    ? valuesStr && Object.values(query[attrId]).join(" ") !== valuesStr // 当条件是为空和不为空时，需要判断valuesStr是否存在
    : false;
};
export function mergeFields(
  oldFields: ISortField[],
  newFieldIds: string[]
): ISortField[] {
  return newFieldIds.map((field) => {
    const existField = oldFields.find((f) => f.field === field);
    const order = existField ? existField.order : 0;
    return { field, order };
  });
}
export function updateSortFields(
  oldFields: ISortField[],
  sortInfo: { asc?: boolean; sort?: string },
  sortType?: string
): ISortField[] {
  const { asc, sort } = sortInfo;
  const order = isNil(asc)
    ? 0
    : ["series-number", "auto-increment-id"].includes(sortType)
    ? asc
      ? 2
      : -2
    : asc
    ? 1
    : -1;
  return oldFields.map((item) => {
    if (item.field === sort) {
      item.order = order;
    } else {
      item.order = 0;
    }
    return item;
  });
}

export function translateConditions(
  aq: Query[],
  idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>,
  modelData: ObjectType,
  t?: () => string
): { attrId: string; condition: string; valuesStr: string }[] {
  const conditions: {
    attrId: string;
    condition: string;
    valuesStr: string;
  }[] = [];
  const relations: any[] = [];
  const transHierRelations: {
    id: string;
    name: string;
    value: { type: string };
    relationSideId: string;
  }[] = [];
  modelData.view?.trans_hier_relation_list?.forEach((relation) => {
    const nameKeys = relation.display_keys?.length
      ? relation.display_keys
      : getInstanceNameKeys(idObjectMap[relation.relation_object]);
    nameKeys.forEach((nameKey) => {
      transHierRelations.push({
        id: `${relation.relation_id}.${nameKey}`,
        name: relation.relation_name,
        value: { type: "str" },
        relationSideId: relation.relation_id,
      });
    });
  });
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
  const attrAndRelationList = [
    ...modelData.attrList,
    ...relations,
    ...transHierRelations,
  ];
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
          attr?.relationSideId
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
            attr.id,
            attr.value.mode
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

export interface filterObjectIdQuery {
  objectId?: string;
  objectName?: string;
  query?: Record<string, string>;
  checked?: boolean;
}

interface FixedField {
  field: string;
  fixed?: boolean;
}

export type ExtraFixedFields = string[] | FixedField[];

// 判断是不是字符串数组
function isStringArray(arr: ExtraFixedFields): boolean {
  return isArray(arr) && (arr as any[]).every((item) => isString(item));
}
// 格式化extraFixedFields
function getExtraFixedFields(fields: ExtraFixedFields): string[] {
  if (isNil(fields) || isStringArray(fields)) {
    return fields as string[];
  } else {
    return (fields as FixedField[]).map((v: FixedField) => v.field);
  }
}

export interface InstanceListProps {
  objectId: string;
  objectList?: ObjectType[];
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
  propertyDisplayConfigs?: UseBrickAndPropertyDisplayConfig[];
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
  useAutoDiscoveryProvider?: boolean;
  extraParams?: Record<string, any>;
  // 指定固定显示的field,与presetConfigs的fieldIds同时生效,支持在最后固定列展示
  extraFixedFields?: ExtraFixedFields;
  //  如果在presetConfigs的query参数中指定了资源的范围，"按应用筛选"的功能是否也要限定资源的范围
  limitInstanceRange?: boolean;
  useInstanceArchiveProvider?: boolean;
  placeholder?: string;
  extraOperateBricks?: {
    useBrick: UseBrickConf;
  };
  updateDataTime?: number;
  // 是否开启实例来源筛选
  showFilterInstanceSource?: boolean;
  filterInstanceSource?: boolean;
  onFilterInstanceSourceChange?(value: boolean): void;
  onFilterObjectIdChange?(query: filterObjectIdQuery): void;
  objectIdQuery?: string;
  ignorePermission?: boolean;
  saveFieldsBackend?: boolean;
  onColumnsChange?: (columns: ColumnType<{ dataIndex: string }>[]) => void;
  useExternalCmdbApi?: boolean;
  externalSourceId?: string;
  hiddenColumns?: Array<string>;
  showCustomizedSerialNumber?: boolean;
  relationLimit?: number;
  onRelationMoreIconClick?: (record: Record<string, any>) => void;
  tableConfigProps?: Record<string, any>;
  //跨级关系，查询某个实例下的某条跨级关系数据
  searchTransHierRelationInstance?: boolean;
  transHierRelation?: TransHierRelationType;
  searchTransHierRelationSource?: { objectId: string; instanceId: string };
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
  presetConfigsQuery?: Record<string, any>;
  filterInstanceSource?: boolean;
  objectIdQuery?: string;
  instanceSourcePopoverVisible?: boolean;
  sortFields?: { field: string; order: number }[];
  backendDefaultFields?: { field: string; order: number }[];
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
  // 资源自动发现页面24小时发现主机抽屉的实例列表处，通用的postSearchV3接口无法查到正确结果，需要用下面的接口替换，参数里也要加上jobId:***
  // 为了不影响其他地方的实例列表，在该处加一个useAutoDiscoveryProvider参数，该参数为undefined或false的，仍调用原接口

  const listProvider = useProvider(
    "easyops.api.cmdb.job@SearchResource:1.0.1",
    { cache: false }
  );
  const instanceArchiveListProvider = useProvider(
    "providers-of-cmdb.instance-archive-api-list-archive-instance",
    {
      cache: false,
    }
  );
  const ignorePermissionProvider = useProvider(
    "easyops.api.cmdb.instance@PostSearchV3WithAdmin:1.0.0",
    { cache: false }
  );

  const searchRelationInstanceProvider = useProvider(
    "easyops.api.cmdb.instance@SearchRelationInstance:1.1.0",
    { cache: false }
  );
  // istanbul ignore next

  const fieldsProvider = useProvider(
    "easyops.api.cmdb.instance@GetListDisplayView:1.0.1",
    { cache: false }
  );

  // istanbul ignore next
  const updateFieldsProvider = useProvider(
    "easyops.api.cmdb.instance@UpdateListDisplayView:1.0.0",
    {
      cache: false,
      onError: (error) => {
        // istanbul ignore next
        throw error;
      },
    }
  );

  // 用于外部调用的接口, 当useExternalCmdbApi为true，才调用这些接口
  const externalPostSearchV3 = useProvider(
    "easyops.api.cmdb.topo_center@ProxyPostSearchV3:1.0.1",
    { cache: false }
  );
  const externalGetIdMapName = useProvider(
    "easyops.api.cmdb.topo_center@ProxyGetIdMapName:1.0.1",
    { cache: false }
  );
  const externalFieldsProvider = useProvider(
    "easyops.api.cmdb.topo_center@ProxyGetListDisplayView:1.0.0",
    { cache: false }
  );
  const externalUpdateFieldsProvider = useProvider(
    "easyops.api.cmdb.topo_center@ProxyUpdateListDisplayView:1.0.0",
    { cache: false }
  );

  const { modelData, idObjectMap } = useMemo(() => {
    let modelData: ObjectType;
    const idObjectMap: Record<string, ObjectType> = {};
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

  const processFixedFields = useMemo(() => {
    return getExtraFixedFields(props?.extraFixedFields);
  }, [props.extraFixedFields]);

  const [inheritanceModelIdNameMap, setInheritanceModelIdNameMap] = useState<
    Record<string, string>
  >({});
  const [fixedHeader, setFixHeader] = useState(false);

  const fetchInheritanceModelIdNameMap = async (
    modelData: Partial<CmdbModels.ModelCmdbObject>
  ): Promise<void> => {
    let idNameMap = {};
    if (modelData.isAbstract) {
      if (props.useExternalCmdbApi) {
        idNameMap = await externalGetIdMapName.query([
          {
            parentObjectId: modelData.objectId,
            sourceId: props.externalSourceId,
          },
        ]);
      } else {
        idNameMap = await CmdbObjectApi_getIdMapName({
          parentObjectId: modelData.objectId,
        } as any);
      }
      props.showFilterInstanceSource &&
        jsonLocalStorage.setItem(`instances-sources-objectId-name-map`, {
          parentObjectId: modelData.objectId,
          query: props.presetConfigs?.query,
          idNameMap,
        });
    }
    setInheritanceModelIdNameMap(idNameMap);
  };

  useEffect(() => {
    fetchInheritanceModelIdNameMap(modelData);
  }, [modelData]);

  const computeDefaultFields = (
    { inModal } = { inModal: false }
  ): { fieldIds: string[] } => {
    // 针对 显示字段，默认优先拿排序的字段，再去拿属性字段
    const settings: any = inModal
      ? CMDB_MODAL_FIELDS_SETTINGS
      : CMDB_RESOURCE_FIELDS_SETTINGS;
    const ignoredFields: string[] = (
      settings.ignoredFields[modelData.objectId] || []
    ).concat(modelData.view.hide_columns || []);
    const sortFields = modelData.view.attr_order || [];
    const allFields = [
      ...new Set([...sortFields, ...map(modelData.attrList, "id")]),
    ];
    const fieldIds: string[] = difference(allFields, ignoredFields).slice(0, 8);
    return { fieldIds };
  };

  // 根据用户预定义的 presetConfigs.fieldIds 进行排序，如果不在预定义的字段，则根据 fieldIds 进行排序
  const _sortFieldIds = (fieldIds: any[]) => {
    let frontFields: any[] = [];
    let restFields: any[] = [];
    if (props.presetConfigs?.fieldIds) {
      frontFields = filter(props.presetConfigs.fieldIds, (id) =>
        fieldIds.includes(id)
      );
    }
    restFields = reject(fieldIds, (id) => frontFields.includes(id));

    return [...frontFields, ...restFields];
  };
  // istanbul ignore next

  const getFieldsAsync = async () => {
    let sort = props.sort;
    let fieldIds = props.presetConfigs?.fieldIds;
    const sortType = modelData?.attrList?.find((attr) => attr.id === sort)
      ?.value?.default_type;
    let asc, sortFields;
    let backendDefaultFields;
    if (props.asc === true) {
      asc = ["series-number", "auto-increment-id"].includes(sortType) ? 2 : 1;
    } else {
      asc = ["series-number", "auto-increment-id"].includes(sortType) ? -2 : -1;
    }
    if (props.useExternalCmdbApi) {
      sortFields = (
        (await externalFieldsProvider.query([
          { object_id: props.objectId, sourceId: props.externalSourceId },
        ])) as {
          sortFields: ISortField[];
          object_id: string;
        }
      ).sortFields;
    } else {
      // 获取用户配置的显示列
      const returnData = (await fieldsProvider.query([props.objectId])) as {
        sortFields: ISortField[];
        object_id: string;
        defaultSortFields: ISortField[];
      };
      sortFields = returnData.sortFields;
      backendDefaultFields = returnData.defaultSortFields;
    }
    const extraFixedFieldIds = processFixedFields ?? [];
    if (isEmpty(fieldIds)) {
      fieldIds = sortFields.map((item) => item.field);
      if (isEmpty(sort) || isEmpty(asc)) {
        const orderField = sortFields.find((item) => item.order !== 0);
        if (orderField) {
          sort = orderField.field;
          asc = orderField.order;
        }
      }
    }
    if (isEmpty(fieldIds)) {
      fieldIds = computeDefaultFields().fieldIds;
    }
    if (!isEmpty(extraFixedFieldIds)) {
      fieldIds = uniq([...fieldIds, ...extraFixedFieldIds]);
    }
    fieldIds = props.extraDisabledField
      ? uniq([...fieldIds, props.extraDisabledField])
      : fieldIds;
    fieldIds = _sortFieldIds(fieldIds);
    const hideModelData: string[] = modelData.view.hide_columns || [];
    fieldIds = fieldIds.filter((field) => !hideModelData.includes(field));
    modelData.isAbstract && fieldIds.push("_object_id");
    return { fieldIds, sort, asc, sortFields, backendDefaultFields };
  };

  const getFields = () => {
    let fieldIds = props.presetConfigs?.fieldIds;
    const extraFixedFieldIds = processFixedFields ?? [];
    if (isEmpty(fieldIds)) {
      fieldIds = jsonLocalStorage.getItem(
        `${modelData.objectId}-selectAttrIds`
      );
    }
    if (isEmpty(fieldIds)) {
      fieldIds = computeDefaultFields().fieldIds;
    }
    if (!isEmpty(extraFixedFieldIds)) {
      fieldIds = uniq([...fieldIds, ...extraFixedFieldIds]);
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
    sortFields: [],
    aqToShow: props.aqToShow || initAqToShow(props.aq, modelData),
    instanceSourceQuery: props.instanceSourceQuery,
    asc: props.asc,
    sort: props.sort,
    page: props.dataSource?.page ?? props.page ?? 1,
    pageSize: props.dataSource?.pageSize ?? props.pageSize ?? 10,
    aliveHosts: props.aliveHosts,
    relatedToMe: props.relatedToMe,
    objectIdQuery: props.objectIdQuery,
    filterInstanceSource: props.filterInstanceSource,
    instanceSourcePopoverVisible: false,
    inited: false,
    loading: false,
    failed: false,
    isAdvancedSearchVisible: false,
    fieldIds: props.saveFieldsBackend ? [] : getFields(),
    presetConfigsQuery: props.presetConfigs?.query,
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
    backendDefaultFields: [],
  }));
  const [selectedRowKeys, setSelectedRowKeys] = useState(
    props.selectedRowKeys ?? []
  );
  const cache = useRef(new Map<string, InstanceApi_PostSearchV3ResponseBody>());
  const isFirstRunRef = useRef(true);

  // useExternalCmdbApi为true，外部接口参数
  const externalRequestParams = useMemo(() => {
    return {
      objectId: props.objectId,
      sourceId: props.externalSourceId,
    };
  }, [props.objectId, props.externalSourceId]);

  const getInstanceListData = async (
    sort: string,
    asc: boolean,
    page: number
  ): Promise<InstanceApi_PostSearchV3ResponseBody> => {
    const data: InstanceApi_PostSearchRequestBody = {};
    const v3Data: InstanceApi_PostSearchV3RequestBody = {
      fields: processFixedFields
        ? uniq(["instanceId"].concat(processFixedFields))
        : ["instanceId"],
    };
    if (!isEmpty(props.permission)) {
      v3Data.permission = data.permission = props.permission;
    }

    const archiveData: instanceArchiveRequestBody = {};
    let query: Record<string, any> = {};

    v3Data.page = data.page = archiveData.page = page;
    v3Data["page_size"] =
      data["page_size"] =
      archiveData["page_size"] =
        state.pageSize;
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
      let relationObjectShowKeys: string[] = [];
      if (
        !props.useExternalCmdbApi &&
        !props.useAutoDiscoveryProvider &&
        !props.ignorePermission
      ) {
        const relation = modelData?.relation_list?.find((i) =>
          i.right_object_id === props.objectId
            ? sort === i.right_id
            : sort === i.left_id
        );
        const relationObjectId =
          relation?.right_object_id === props.objectId
            ? relation?.left_object_id
            : relation?.right_object_id;
        relationObjectShowKeys = props.objectList?.find(
          (i) => i.objectId === relationObjectId
        )?.view?.show_key;
      }
      v3Data.sort = relationObjectShowKeys?.length
        ? relationObjectShowKeys.map((i) => ({ key: `${sort}.${i}`, order }))
        : [{ key: sort, order }];
    }

    if (state.q) {
      query = getQuery(
        modelData,
        idObjectMap,
        state.q,
        state.fieldIds,
        props.onlySearchByIp,
        processFixedFields
      );
    }

    if (state.q && props.useInstanceArchiveProvider) {
      archiveData.key_word = state.q;
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
      v3Data.fields = [
        ...state.fieldIds,
        ...v3Data.fields,
        ...(modelData.isAbstract ? ["_object_id"] : []),
      ];
      (v3Data as any).ignore_missing_field_error = true;
    }
    if (props.useAutoDiscoveryProvider) {
      v3Data.fields = joinRelationFieldAndShowkey(
        v3Data.fields,
        modelData,
        props.objectList
      );
    }
    if (props.useInstanceArchiveProvider) {
      archiveData.fields = v3Data.fields.join(",");
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
    // useAutoDiscoveryProvider=true, 使用useProvider的接口，请求参数里加上extraParams

    if (props.useAutoDiscoveryProvider && !isEmpty(props.extraParams)) {
      Object.assign(v3Data, props.extraParams);
    }
    if (state.relatedToMe) {
      v3Data.only_my_instance = data.only_my_instance = state.relatedToMe;
    }
    //按应用筛选
    // istanbul ignore next (state is not updated)
    if (state.searchByApp) {
      const hostRange = props.presetConfigs?.query?.["$and"]?.find(
        (i: any) => i.instanceId
      )?.instanceId?.["$in"];
      v3Data.query = {
        [state.currentChangeSelect === "App" ||
        (state.currentChangeSelect === "Cluster" &&
          state.clusterValue === "all")
          ? "_deviceList_CLUSTER.appId.instanceId"
          : "_deviceList_CLUSTER.instanceId"]: state.appSearchInstanceId,
        ...(!isEmpty(hostRange) && props.limitInstanceRange
          ? {
              instanceId: { $in: hostRange },
            }
          : {}),
        ...(state.aliveHosts && props.objectId === "HOST"
          ? { _agentStatus: "正常" }
          : {}),
      };
    }

    if (!(props.useExternalCmdbApi || props.useAutoDiscoveryProvider)) {
      v3Data.relation_limit =
        isNil(props.relationLimit) || props.relationLimit === 0
          ? 0
          : props.relationLimit + 1;
    }

    if (props.useInstanceArchiveProvider) {
      return instanceArchiveListProvider.query([props.objectId, archiveData]);
    }
    const promise = props.onSearchExecute?.(data, v3Data);
    // useAutoDiscoveryProvider=true, 使用useProvider的接口
    // useExternalCmdbApi= true 使用外部接口externalPostSearchV3
    return promise
      ? promise
      : props.useExternalCmdbApi
      ? externalPostSearchV3.query([
          {
            ...v3Data,
            ...externalRequestParams,
          },
        ])
      : props.useAutoDiscoveryProvider
      ? listProvider.query([props.objectId, v3Data])
      : props.ignorePermission
      ? ignorePermissionProvider.query([props.objectId, v3Data])
      : props.searchTransHierRelationInstance &&
        props.transHierRelation?.relation_id &&
        props.searchTransHierRelationSource
      ? searchRelationInstanceProvider.query([
          props.searchTransHierRelationSource.objectId,
          props.transHierRelation.relation_id,
          props.searchTransHierRelationSource.instanceId,
          { query_relation: v3Data.query, ...v3Data },
        ])
      : InstanceApi_postSearchV3(props.objectId, v3Data); //涉及到v3data的请求
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
      // 为了接口报错，不把整页面列干掉，去掉 failed: true 这个逻辑
      setState({
        idObjectMap: idObjectMap,
        instanceListData: [] as InstanceApi_PostSearchV3ResponseBody,
      });
    } finally {
      setState({ inited: true, loading: false });
    }
  };
  // const [fieldIds,setFieldIds] = useState([]);
  // istanbul ignore next
  useEffect(() => {
    if (props.saveFieldsBackend) {
      const getFieldIds = async () => {
        const fieldConfig = await getFieldsAsync();
        const { fieldIds, sort, asc, sortFields, backendDefaultFields } =
          fieldConfig;
        if (
          // 当 props.objectId 改变时，总是更新 state.fieldIds
          props.objectId !== state.objectId ||
          !isEqual(fieldIds, state.fieldIds) ||
          !isEqual(props.presetConfigs?.query, state.presetConfigsQuery)
        )
          setState({
            fieldIds,
            presetConfigsQuery: props.presetConfigs?.query,
            sort,
            asc: [1, 2].includes(asc) ? true : false,
            sortFields,
            backendDefaultFields,
          });
      };
      getFieldIds();
    } else {
      const fieldIds = getFields();
      if (
        // 当 props.objectId 改变时，总是更新 state.fieldIds
        props.objectId !== state.objectId ||
        !isEqual(fieldIds, state.fieldIds) ||
        !isEqual(props.presetConfigs?.query, state.presetConfigsQuery)
      ) {
        setState({
          fieldIds,
          presetConfigsQuery: props.presetConfigs?.query,
        });
      }
    }
  }, [props.objectId, props.presetConfigs, processFixedFields]);

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

  useEffect(() => {
    setQ(props.q);
    setState({ q: props.q });
  }, [props.q]);

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
    state.presetConfigsQuery,
    props.updateDataTime,
  ]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };

  // istanbul ignore next
  const onSelectionChange = useCallback(
    async (selected: { selectedKeys: string[]; selectedItems: any[] }) => {
      let { selectedItems, selectedKeys } = selected;
      setSelectedRowKeys(selectedKeys);
      if (selectedKeys.length > compact(selectedItems).length) {
        const ids = selectedKeys.filter((id) => !cache.current.has(id));
        if (ids.length) {
          let resp;
          const params: any = {
            fields: ["instanceId"],
            query: {
              instanceId: {
                $in: ids,
              },
            },
            page_size: ids.length,
            page: 1,
          };

          if (!(props.useExternalCmdbApi || props.useAutoDiscoveryProvider)) {
            params.relation_limit =
              isNil(props.relationLimit) || props.relationLimit === 0
                ? 0
                : props.relationLimit + 1;
          }
          // useExternalCmdbApi为true，使用外部接口PostSearchV3
          if (props.useExternalCmdbApi) {
            resp = await externalPostSearchV3.query([
              {
                ...params,
                ...externalRequestParams,
              },
            ]);
          } else if (props.useAutoDiscoveryProvider) {
            // useAutoDiscoveryProvider=true, 使用useProvider的接口，虽然这里列表用不到选择功能，但还是加上保持统一
            resp = await listProvider.query([
              props.objectId,
              Object.assign(params, props.extraParams),
            ]);
          } else if (props.ignorePermission) {
            resp = await ignorePermissionProvider.query([
              props.objectId,
              Object.assign(params, props.extraParams),
            ]);
          } else {
            resp = await InstanceApi_postSearchV3(props.objectId, params);
          }
          resp.list.forEach((i: Record<string, any>) =>
            cache.current.set(i.instanceId, i)
          );
        }
        selectedItems = selectedKeys.map((id) => cache.current.get(id));
      }
      props.onSelectionChange?.({ selectedItems, selectedKeys });
    },
    []
  );

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

  const onSortingChange = useCallback(
    async (info: ReadSortingChangeDetail, sortFields?: ISortField[]) => {
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
      // istanbul ignore next
      if (
        props.saveFieldsBackend &&
        sortFields.find((item) => item.field === info.sort)
      ) {
        try {
          const oldsortFields = sortFields;
          const sortType = modelData?.attrList?.find((attr) => attr.id === sort)
            ?.value?.default_type;
          const newSortFields = updateSortFields(oldsortFields, info, sortType);
          setState({
            sortFields: newSortFields,
          });
          if (props.useExternalCmdbApi) {
            await externalUpdateFieldsProvider.query([
              {
                object_id: props.objectId,
                sourceId: props.externalSourceId,
                sortFields: newSortFields,
              },
            ]);
          } else {
            await updateFieldsProvider.query([
              props.objectId,
              { sortFields: newSortFields },
            ]);
          }
        } catch (e) {
          handleHttpError;
        }
      }
      // istanbul ignore next
      props.onSortingChange?.(info);
    },
    [state.sort]
  );

  const onPaginationChange = useCallback(
    (pagination: ReadPaginationChangeDetail) => {
      setState({ page: pagination.page, pageSize: pagination.pageSize });
      props.onPaginationChange?.(pagination);
    },
    []
  );

  const onInstanceSourceChange = useCallback((instanceSourceQuery: string) => {
    setState({ instanceSourceQuery });
    props.onInstanceSourceChange?.(instanceSourceQuery);
  }, []);

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
      let appListResp: any;
      const params: any = {
        fields: ["clusters", "instanceId", "name"],
        sort: [{ key: "name", order: 1 }],
        page: 1,
        page_size: 3000,
        ...(props.useExternalCmdbApi ? externalRequestParams : {}),
      };
      // useExternalCmdbApi为true，使用外部接口PostSearchV3
      if (props.useExternalCmdbApi) {
        appListResp = await externalPostSearchV3.query([params]);
      } else {
        appListResp = await InstanceApi_postSearchV3("APP", params);
      }

      setState({
        appSearchInstanceId: appListResp.list?.[0].instanceId || "",
        appList: appListResp.list,
        clusterList: [...baseList, ...(appListResp.list?.[0].clusters || [])],
        searchByApp: true,
        appSelectValue: appListResp.list?.[0].instanceId || "",
        clusterValue: "all",
        page: 1,
      });
    } else {
      setState({ searchByApp: false, page: 1 });
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

  // 后台返回的默认配置

  const defaultFields = useMemo(() => {
    let defaultFields: string[];
    const fieldIds = props.presetConfigs?.fieldIds,
      extraFixedFieldIds = processFixedFields ?? [];
    if (!isEmpty(fieldIds)) {
      defaultFields = props.presetConfigs.fieldIds;
    } else {
      // istanbul ignore next
      // 所有用户（包括管理员）点击恢复默认按钮是恢复到 1.管理员设置的默认显示 2.管理员未设置时取前N个
      if (
        props.saveFieldsBackend &&
        !props.useExternalCmdbApi &&
        state.backendDefaultFields &&
        state.backendDefaultFields?.length > 0
      ) {
        // istanbul ignore next
        // 后台接口返回的默认字段（1. admin用户设置的，2. 前N个）
        defaultFields = compact(
          state.backendDefaultFields?.map((s) => s.field)
        );
      } else {
        defaultFields = computeDefaultFields().fieldIds;
      }
    }
    if (!isEmpty(extraFixedFieldIds)) {
      defaultFields = uniq([...defaultFields, ...extraFixedFieldIds]);
    }
    return defaultFields;
  }, [
    props.presetConfigs,
    modelData,
    state.backendDefaultFields,
    processFixedFields,
  ]);

  // istanbul ignore next
  const handleConfirm = async ({
    fields,
    isReset,
    isAdminSetDisplay,
  }: DisplaySettingsModalData) => {
    const onConfirm = async () => {
      if (props.saveFieldsBackend) {
        try {
          const sortFields = mergeFields(state.sortFields, fields);
          if (props.useExternalCmdbApi) {
            await externalUpdateFieldsProvider.query([
              {
                object_id: props.objectId,
                sourceId: props.externalSourceId,
                sortFields,
              },
            ]);
          } else {
            await updateFieldsProvider.query([props.objectId, { sortFields }]);
          }
          setState({
            fieldIds: _sortFieldIds(fields),
            sortFields,
          });
        } catch (e) {
          handleHttpError(e);
        }
      } else {
        const sortFields = mergeFields(state.sortFields, fields);
        setState({
          fieldIds: _sortFieldIds(fields),
          sortFields,
        });
        jsonLocalStorage.setItem(
          `${modelData.objectId}-selectAttrIds`,
          _sortFieldIds(fields)
        );
      }
      props.onFieldsModalConfirm(fields);
    };
    if (isReset) {
      // 恢复默认操作
      const fieldIds = defaultFields;
      modelData.isAbstract && fieldIds.push("_object_id");
      if (props.saveFieldsBackend) {
        const sortFields = mergeFields(state.sortFields, fieldIds);
        if (props.useExternalCmdbApi) {
          await externalUpdateFieldsProvider.query([
            {
              object_id: props.objectId,
              sourceId: props.externalSourceId,
              sortFields,
            },
          ]);
        } else {
          await updateFieldsProvider.query([props.objectId, { sortFields }]);
        }
        setState({ fieldIds, sortFields });
        props.onFieldsModalConfirm(fieldIds);
      } else {
        jsonLocalStorage.removeItem(`${modelData.objectId}-selectAttrIds`);
        setState({ fieldIds });
        props.onFieldsModalConfirm(fieldIds);
      }
    } else {
      if (!isAdminSetDisplay) {
        // 点击确定按钮触发
        await onConfirm();
      } else {
        // 点击【默认显示】按钮触发，不影响当前列表显示。
        try {
          // istanbul ignore next
          const sortFields = mergeFields(state.sortFields, fields);
          await updateFieldsProvider.query([
            props.objectId,
            { sortFields: sortFields, isDefault: true },
          ]);
          await onConfirm();
          message.success(
            i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SET_DEFAULT_DISPLAY_SUCCESS}`)
          );
          setState({
            backendDefaultFields: sortFields,
          });
        } catch (e) {
          handleHttpError(e);
        }
      }
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
        v3Data.page = 1;
        if (!(props.useExternalCmdbApi || props.useAutoDiscoveryProvider)) {
          v3Data.relation_limit =
            isNil(props.relationLimit) || props.relationLimit === 0
              ? 0
              : props.relationLimit + 1;
        }

        if (state.relatedToMe) {
          v3Data.only_my_instance = data.only_my_instance = state.relatedToMe;
        }
        if (props.extraParams) {
          Object.assign(v3Data, props.extraParams);
        }
        let resp: any;
        // useExternalCmdbApi为true，使用外部接口PostSearchV3
        if (props.useExternalCmdbApi) {
          resp = await externalPostSearchV3.query([
            {
              ...v3Data,
              ...externalRequestParams,
            },
          ]);
        } else if (props.useAutoDiscoveryProvider) {
          resp = await listProvider.query([props.objectId, v3Data]);
        } else {
          resp = await InstanceApi_postSearchV3(props.objectId, v3Data); //涉及到v3data的请求
        }
        resp.list.forEach((i: Record<string, any>) =>
          cache.current.set(i.instanceId, i)
        );
      })();
  }, [props.selectedRowKeys]);
  const handleToggleFixHeader = () => {
    setFixHeader(!fixedHeader);
  };
  const onAdvancedSearchCloseGen = (attrId: string, valuesStr: string) => {
    return () => {
      const queries: Query[] = [];
      const queriesToShow: Query[] = [];
      const filterAq = (queries: any[]) =>
        queries.filter((v: any) => isValueEqualFn(v, attrId, valuesStr));
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
          // $exists $gte $lte 针对为空，不为空，时间范围特殊处理
          if (!Array.isArray(query[key]) && isSpecialFn(query, key)) {
            queries.push(query);
          } else {
            // 多枚举值数据结构返回这种 {attrId: {$in:[]}}
            const fieldId =
              Object.keys(get(query[key] as Query[], "[0]", {}))?.[0] || key;
            // 判断是否为结构体
            const isStruct = isOfStruct(modelData, fieldId);
            // 结构体情况处理
            if (
              !(
                (key === "$or" || key === "$and") &&
                startsWith(fieldId, `${attrId}.`) &&
                isStruct
              )
            ) {
              queries.push(query);
            }
          }
        } else if (
          props.isInstanceFilterForm &&
          key === attrId &&
          isValueEqualFn(query, attrId, valuesStr)
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
          isValueEqualFn(query, attrId, valuesStr)
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

  const onFilterInstanceSourceChange = (checked: boolean): void => {
    setState({ filterInstanceSource: checked });
    props.onFilterInstanceSourceChange?.(checked);
  };

  const onFilterObjectIdChange = (objectIdQuery: any): void => {
    setState({ objectIdQuery: objectIdQuery });
    props.onFilterObjectIdChange?.(objectIdQuery);
  };

  const onPopoverVisibleChange = (visible: boolean): void => {
    setState({ instanceSourcePopoverVisible: visible });
  };

  const conditions = translateConditions(
    state.aqToShow,
    idObjectMap,
    modelData
  );

  useEffect(() => {
    if (props.showFilterInstanceSource) {
      const aq = initAqToShow(props.aq, modelData, false);
      const aqToShow = props.aqToShow || initAqToShow(props.aq, modelData);
      setState({ aq, aqToShow });
    }
  }, [props.aq, props.aqToShow, props.showFilterInstanceSource]);

  const fixedFieldIds = useMemo(() => {
    if (!props.extraFixedFields || isStringArray(props.extraFixedFields)) {
      return [];
    } else {
      return (props.extraFixedFields as FixedField[])
        .filter((v: FixedField) => v.fixed)
        .map((v) => v.field);
    }
  }, [props.extraFixedFields]);

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
                        placeholder={props.placeholder}
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
                      {state.appList?.map((r) => (
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
                {props.extraOperateBricks?.useBrick && (
                  <BrickAsComponent
                    useBrick={props.extraOperateBricks.useBrick}
                  />
                )}
                {props.showFilterInstanceSource && (
                  <FilterInstanceSource
                    visible={state.instanceSourcePopoverVisible}
                    checked={state.filterInstanceSource}
                    onPopoverVisibleChange={onPopoverVisibleChange}
                    onIconClicKChange={onFilterInstanceSourceChange}
                    onChange={onFilterObjectIdChange}
                    inheritanceModelIdNameMap={inheritanceModelIdNameMap}
                    value={state.objectIdQuery}
                    jsonLocalStorage={jsonLocalStorage}
                    isAbstract={modelData.isAbstract}
                  />
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
                    useExternalCmdbApi={props.useExternalCmdbApi}
                    saveFieldsBackend={props.saveFieldsBackend}
                    fieldIds={state.fieldIds}
                    defaultFields={defaultFields}
                    extraDisabledField={props.extraDisabledField}
                    handleToggleFixHeader={handleToggleFixHeader}
                    fixedHeader={fixedHeader}
                    showFixedHeader={props.showFixedHeader}
                    sortFields={state.sortFields}
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
              onSortingChange={(info: any) => {
                onSortingChange(info, state.sortFields);
              }}
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
              onColumnsChange={props.onColumnsChange}
              useExternalCmdbApi={props.useExternalCmdbApi}
              externalSourceId={props.externalSourceId}
              hiddenColumns={props.hiddenColumns}
              showCustomizedSerialNumber={props.showCustomizedSerialNumber}
              relationLimit={props.relationLimit}
              onRelationMoreIconClick={props.onRelationMoreIconClick}
              configProps={props.tableConfigProps}
              fixedFieldIds={fixedFieldIds}
            />
          )}
        </React.Fragment>
      ) : (
        // 加个空白的div是为了将loading效果撑起来
        <div className={styles.virtualLoading}></div>
      )}
    </Spin>
  );
}

/**
 *  把 objectList 封装到构件中请求，废弃掉通过老模板使用的方式，可直接使用构件。
 *  同时也兼容之前的使用方式，对于外部传进来的会优先使用外部的数据，构件内部不会额外请求，
 *  不传的话构件内部做请求，并作缓存
 */
export function LegacyInstanceListWrapper(
  props: InstanceListProps
): React.ReactElement {
  const [objectList, setObjectList] = useState<ObjectType[]>(props.objectList);

  const [mergeObjectList, setMergeObjectList] = useState<ObjectType[]>(
    props.objectList
  );

  const externalGetObjectRef = useProvider(
    "easyops.api.cmdb.topo_center@ProxyGetObjectRef:1.0.0",
    { cache: false }
  );

  useEffect(() => {
    if (props.objectList?.length) {
      setObjectList(props.objectList);
    } else {
      (async () => {
        const cacheData = objectListCache.get(props.objectId);
        if (cacheData) {
          setObjectList(cacheData);
        } else {
          try {
            let list;
            if (props.useExternalCmdbApi) {
              list = await externalGetObjectRef.query([
                {
                  ref_object: props.objectId,
                  sourceId: props.externalSourceId,
                },
              ]);
            } else {
              list = (
                await CmdbObjectApi_getObjectRef({ ref_object: props.objectId })
              ).data;
            }
            setObjectList(list);
            objectListCache.set(props.objectId, list);
          } catch (e) {
            // istanbul ignore next
            handleHttpError(e);
          }
        }
      })();
    }
  }, [props.objectId, props.objectList]);

  useEffect(() => {
    if (!objectList?.length && isEqual(objectList, mergeObjectList)) return;
    (async () => {
      const object = objectList?.find(
        (item) => item.objectId === props.objectId
      );
      const transHierRelationSideObjectIds: string[] =
        object?.view?.trans_hier_relation_list?.map((i) => i.relation_object);
      if (
        transHierRelationSideObjectIds?.length &&
        !transHierRelationSideObjectIds.every((i) =>
          objectList.some((o) => o.objectId === i)
        )
      ) {
        let list;
        try {
          if (!props.useExternalCmdbApi) {
            list = (
              await CmdbObjectApi_list({
                page: 1,
                page_size: transHierRelationSideObjectIds.length,
                objectIds: transHierRelationSideObjectIds.join(","),
              })
            ).list;
          }
        } catch (e) {
          // istanbul ignore next
          handleHttpError(e);
        }
        if (list?.length) {
          objectList.push(...list);
          objectListCache.set(props.objectId, objectList);
        }
      }

      setMergeObjectList(objectList);
    })();
  }, [objectList]);

  if (
    !mergeObjectList ||
    !mergeObjectList.find((item) => item.objectId === props.objectId)
  )
    return null;

  return <LegacyInstanceList {...props} objectList={mergeObjectList} />;
}

/**
 *
 *  支持关系点击打开抽屉查看更多关系，展示关系的实例列表
 */
export function InstanceList(props: InstanceListProps): React.ReactElement {
  return <InstanceListDrawer {...props} />;
}
