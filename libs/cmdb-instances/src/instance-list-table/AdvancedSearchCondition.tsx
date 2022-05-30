import React, { useMemo, useReducer } from "react";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import {
  getRelationObjectSides,
  getInstanceNameKeys,
  RelationIdKeys,
  RelationNameKeys,
  RelationObjectIdKeys,
  RelationObjectSides,
  isSelfRelation,
  Query,
  ElementOperators,
} from "@next-libs/cmdb-utils";
import {
  extraFieldAttrs,
  CMDB_MODAL_FIELDS_SETTINGS,
  CMDB_RESOURCE_FIELDS_SETTINGS,
} from "./constants";
import { ModelAttributeValueType } from "../model-attribute-form-control/ModelAttributeFormControl";
import { changeQueryWithCustomRules } from "../processors";
import { initAqToShow } from "../instance-list/InstanceList";
import {
  difference,
  isEmpty,
  isEqual,
  isString,
  map,
  uniq,
  filter,
  reject,
  sortBy,
  uniqueId,
  findIndex,
  find,
  startsWith,
  omit,
} from "lodash";
import { Tag } from "antd";
import {
  AdvancedSearch,
  ConditionType,
  getFieldConditionsAndValues,
} from "./AdvancedSearch";
import styles from "./AdvancedSearchCondition.module.css";

export interface AdvancedSearchConditionProps {
  objectId: string;
  objectList: Partial<CmdbModels.ModelCmdbObject>[];
  onAdvancedSearch?(queries: Query[]): void;
  autoSearch?: boolean;
  isInstanceFilterForm?: boolean;
  aq?: Query[];
  aqToShow?: Query[];
  fieldIds?: string[];
  hideSearchConditions?: boolean;
}

interface AdvancedSearchConditionState {
  objectId: string;
  aq: Query[];
  aqToShow?: Query[];
  idObjectMap?: Record<string, Partial<CmdbModels.ModelCmdbObject>>;
  fieldIds: string[];
  fieldToShow?: Record<string, any[]>[];
}

/* istanbul ignore next */
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
/* istanbul ignore next */
const reducer = (
  prevState: AdvancedSearchConditionState,
  updatedProperty: Partial<AdvancedSearchConditionState>
): AdvancedSearchConditionState => {
  return {
    ...prevState,
    ...updatedProperty,
  };
};

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

export function AdvancedSearchCondition(
  props: AdvancedSearchConditionProps
): React.ReactElement {
  const { modelData, idObjectMap } = useMemo(() => {
    let modelData: Partial<CmdbModels.ModelCmdbObject>;
    const idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>> = {};
    props.objectList.forEach((object) => {
      idObjectMap[object.objectId] = object;
      if (object.objectId === props.objectId) {
        modelData = object;
        modelData.attrList = object.attrList;
      }
    });

    return { modelData, idObjectMap };
  }, [props.objectList, props.objectId]);

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
    if (props.fieldIds?.length) {
      frontFields = filter(props.fieldIds, (id) => fieldIds.includes(id));
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
    let fieldIds = props.fieldIds;
    if (!fieldIds?.length) {
      fieldIds = computeDefaultFields().fieldIds;
    }

    fieldIds = _sortFieldIds(fieldIds);
    const hideModelData: string[] = modelData.view.hide_columns || [];
    fieldIds = fieldIds.filter((field) => !hideModelData.includes(field));
    modelData.isAbstract && fieldIds.push("_object_id");
    return fieldIds;
  };

  const [state, setState] = useReducer(reducer, undefined, () => ({
    objectId: props.objectId,
    aq: initAqToShow(props.aq, modelData, false),
    aqToShow: props.aqToShow || initAqToShow(props.aq, modelData),
    fieldIds: getFields(),
  }));

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
    <div className={styles.advancedSearchWrapper}>
      <div style={{ marginBottom: "18px" }}>
        <AdvancedSearch
          modelData={modelData}
          idObjectMap={idObjectMap}
          key={newKey(state.fieldIds, state.aq)}
          fieldIds={state.fieldIds}
          q={state.aqToShow}
          fieldToShow={state.fieldToShow}
          onSearch={onAdvancedSearch}
        ></AdvancedSearch>
      </div>
      {!props.hideSearchConditions && !isEmpty(conditions) && (
        <div className={styles.searchConditions}>
          <span>
            {i18n.t(
              `${NS_LIBS_CMDB_INSTANCES}:${K.CURRENT_FILTER_REQUIREMENTS}`
            )}
          </span>
          {conditions.map((condition) => (
            <Tag
              key={`${condition.attrId}${condition.valuesStr}-${uniqueId()}`}
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
    </div>
  );
}
