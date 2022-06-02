import React, { useReducer } from "react";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { Query, LogicalOperators } from "@next-libs/cmdb-utils";
import { DynamicSearch } from "./DynamicSearch";
import { isEmpty, uniqueId, startsWith } from "lodash";
import { Tag } from "antd";
import styles from "./AdvancedSearchCondition.module.css";
export interface AdvancedSearchConditionProps {
  fields: Record<string, any>[];
  onAdvancedSearch?(queries: Query[]): void;
  isInstanceFilterForm?: boolean;
  aq?: Query[];
  aqToShow?: Query[];
  hideSearchConditions?: boolean;
}

interface AdvancedSearchConditionState {
  aq: Query[];
  aqToShow?: Query[];
  fieldIds: string[];
  fieldToShow?: Record<string, any[]>[];
  fields?: Record<string, any>[];
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

export const formatAqToShow = (aq: Query[]) => {
  let newAqToShow: any[] = [];
  if (aq) {
    aq.forEach((query) => {
      const aqToShow = Object.entries(query).map(([key, expressions]) => {
        let newExpressions: any[] = [];
        if (key === LogicalOperators.Or || key === LogicalOperators.And) {
          newExpressions = [...newExpressions, ...(expressions as Query[])];

          return { [key]: newExpressions };
        } else {
          return query;
        }
      });
      newAqToShow = [...newAqToShow, ...aqToShow];
    });
    return newAqToShow;
  }
  return newAqToShow;
};

function translateAqConditions(
  aq: Query[],
  fields: any[]
): { attrId: string; condition: string; valuesStr: string }[] {
  const conditions: {
    attrId: string;
    condition: string;
    valuesStr: string;
  }[] = [];
  if (!isEmpty(aq)) {
    for (const query of aq) {
      let queries: Query[] = [query];
      if (
        Object.keys(query)[0] === LogicalOperators.Or ||
        Object.keys(query)[0] === LogicalOperators.And
      ) {
        queries = query[Object.keys(query)[0]] as Query[];
      }
      queries.forEach((query) => {
        const key = Object.keys(query)[0];
        const value = Object.values(query)[0];
        const attr = fields.find((v) => v.id === key);
        const contain = i18n.t(
          `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_CONTAIN_DEFINE}`
        );
        const condition = `${attr?.name}:${contain}"${Object.values(
          value
        )[0].replace(/%/g, "")}"`;
        const curCondition = {
          attrId: key,
          condition,
          valuesStr: Object.values(value)[0],
        };
        conditions.push(curCondition);
      });
    }
  }
  return conditions;
}

export function AdvancedSearchCondition(
  props: AdvancedSearchConditionProps
): React.ReactElement {
  const [state, setState] = useReducer(reducer, undefined, () => ({
    aq: formatAqToShow(props.aq),
    aqToShow: props.aqToShow || formatAqToShow(props.aq),
    fieldIds: (props.fields || []).map((v) => v.id),
    fields: props.fields || [],
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

  /* istanbul ignore next */
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
      const formatAqQuery = (
        querys: any[],
        queries: Query[],
        isAq: boolean
      ) => {
        querys.forEach((query) => {
          const key = Object.keys(query)[0];
          const isKey = key !== attrId;
          const isStart = isAq
            ? isKey && !startsWith(attrId, `${key}.`)
            : isKey;
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
          } else if (isStart) {
            queries.push(query);
          } else if (
            props.isInstanceFilterForm &&
            key === attrId &&
            isValueEqual(query)
          ) {
            specialQueryHandler(query, key, queries);
          }
        });
      };
      formatAqQuery(state.aq, queries, true);
      formatAqQuery(state.aqToShow, queriesToShow, false);
      setState({
        aq: queries,
        aqToShow: queriesToShow,
      });
      props.onAdvancedSearch?.(queries);
    };
  };

  const conditions = translateAqConditions(state.aqToShow, state.fields);

  return (
    <div className={styles.advancedSearchWrapper}>
      <div style={{ marginBottom: "18px" }}>
        <DynamicSearch
          fields={state.fields}
          onSearch={onAdvancedSearch}
          key={newKey(state.fieldIds, state.aq)}
          q={state.aqToShow}
          fieldToShow={state.fieldToShow}
        />
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
