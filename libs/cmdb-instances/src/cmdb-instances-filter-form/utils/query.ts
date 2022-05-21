import { get, keys, isEmpty, isNil } from "lodash";

import {
  ModifiedModelCmdbObject,
  ModifiedModelObjectField,
} from "@next-libs/cmdb-utils";
import { CmdbModels } from "@next-sdk/cmdb-sdk";

import { AttrValueType, QueryOperatorValue } from "../constants/query";
import { QueryCondition, QueryConditionValue } from "../interfaces";
import { Query } from "../../instance-list-table/AdvancedSearch";

const queryOperatorConditionOperatorMap: Record<string, QueryOperatorValue> = {
  $like: QueryOperatorValue.Contain,
  $nlike: QueryOperatorValue.NotContain,
  $eq: QueryOperatorValue.Equal,
  $ne: QueryOperatorValue.NotEqual,
  $gte: QueryOperatorValue.Between,
  $lte: QueryOperatorValue.Between,
  $in: QueryOperatorValue.Contain,
  $nin: QueryOperatorValue.NotContain,
};

export function convertConditionsToQuery(
  fields: ModifiedModelObjectField[],
  conditions: QueryCondition[]
): Record<string, unknown> {
  if (isEmpty(conditions)) {
    return {};
  }

  return {
    $and: conditions.map((condition) => {
      const { operator, value } = condition;
      const [fieldId, relatedFieldId] = condition.fieldId.split(".");
      const field: ModifiedModelObjectField = fields.find(
        (field) => field.__id === fieldId
      );

      let key: string, queries: unknown[];
      switch (operator) {
        case QueryOperatorValue.Contain: {
          key = field.__isRelation ? `${fieldId}.${relatedFieldId}` : fieldId;
          queries =
            field.__isRelation === false &&
            (field.value.type === "arr" || field.value.type === "enums")
              ? [
                  {
                    $in: value,
                  },
                ]
              : (Array.isArray(value)
                  ? value.length > 0
                    ? value
                    : [""]
                  : [value]
                ).map((_value) => ({
                  $like: `%${_value}%`,
                }));
          break;
        }
        case QueryOperatorValue.NotContain:
          key = field.__isRelation ? `${fieldId}.${relatedFieldId}` : fieldId;
          queries =
            field.__isRelation === false &&
            (field.value.type === "arr" || field.value.type === "enums")
              ? [
                  {
                    $nin: value,
                  },
                ]
              : (Array.isArray(value)
                  ? value.length > 0
                    ? value
                    : [""]
                  : [value]
                ).map((_value) => ({
                  $nlike: `%${_value}%`,
                }));
          break;
        case QueryOperatorValue.Equal:
          key = field.__isRelation ? `${fieldId}.${relatedFieldId}` : fieldId;
          queries = (
            Array.isArray(value) ? (value.length > 0 ? value : [""]) : [value]
          ).map((_value) => ({
            $eq: _value,
          }));
          break;
        case QueryOperatorValue.NotEqual:
          key = field.__isRelation ? `${fieldId}.${relatedFieldId}` : fieldId;
          queries = (
            Array.isArray(value) ? (value.length > 0 ? value : [""]) : [value]
          ).map((_value) => ({
            $ne: _value,
          }));
          break;
        case QueryOperatorValue.Empty:
          key = fieldId;
          queries = [
            {
              $exists: false,
            },
          ];
          break;
        case QueryOperatorValue.NotEmpty:
          key = fieldId;
          queries = [
            {
              $exists: true,
            },
          ];
          break;
        case QueryOperatorValue.Between:
          key = fieldId;
          queries = [
            {
              $gte: (value as string[])[0],
              $lte: (value as string[])[1],
            },
          ];
      }

      return {
        $or: queries.map((query) => ({
          [key]: query,
        })),
      };
    }),
  };
}

export function convertQueryToConditions(
  objectMap: { [objectId: string]: Partial<CmdbModels.ModelCmdbObject> },
  objectData: Partial<ModifiedModelCmdbObject>,
  query: any
): QueryCondition[] {
  return query.$and
    ? query.$and.map((queryItem: any) => {
        const { $or, $and } = queryItem;
        let queries: Record<string, any>[];

        if ($or) {
          queries = $or;
        } else if ($and) {
          queries = $and;
        } else {
          queries = [queryItem];
        }

        const query = queries[0];
        const key = Object.keys(query)[0];
        const dotIndex = key.indexOf(".");
        const fieldId = dotIndex > -1 ? key.slice(0, dotIndex) : key;
        const field = objectData.__fieldList.find(
          (field) => field.__id === fieldId
        );
        const queryOperator = Object.keys(query[key])[0];
        let conditionFieldId = key;
        let operator = queryOperatorConditionOperatorMap[queryOperator];
        const values = queries.map((query) => {
          let value: QueryConditionValue = query[key][queryOperator];

          switch (queryOperator) {
            case "$like":
            case "$nlike":
              if (typeof value === "string") {
                value = value.slice(1, value.length - 1);
              }
              break;
            case "$exists":
              if (field.__isRelation) {
                const relatedObjectId = (
                  field as CmdbModels.ModelObjectRelation
                ).right_object_id;
                const showKeys: string[] = get(
                  objectMap[relatedObjectId],
                  "view.show_key"
                ) || [objectData.objectId === "HOST" ? "hostname" : "name"];

                conditionFieldId = `${fieldId}.${showKeys[0]}`;
              }
              operator = value
                ? QueryOperatorValue.NotEmpty
                : QueryOperatorValue.Empty;
              value = undefined;
              break;
            case "$gte":
              value = [value, query[key].$lte];
              break;
            case "$lte":
              value = [query[key].$gte, value];
              break;
          }

          return value;
        });

        return {
          fieldId: conditionFieldId,
          operator,
          value: values.length === 1 ? values[0] : values,
        };
      })
    : [];
}

export function convertQueryToAdvancedQuery(query: any): Query[] {
  const queryConditions = get(query, "$and", []);
  return queryConditions.map((queryItem: Record<string, any>) => {
    const key = Object.keys(queryItem)[0];
    if (key === "$or" || key === "$and") {
      return queryItem["$or"][0] || queryItem["$and"][0];
    } else {
      return queryItem;
    }
  });
}
