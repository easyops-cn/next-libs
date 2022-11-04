import { keys, some, every } from "lodash";
import { isObject } from "@next-core/brick-utils";

import { ConditionOperator, LogicalOperator } from "./constants";

const compareFuncMap: {
  [conditionOperator in ConditionOperator]: (
    value1: any,
    value2: any
  ) => boolean;
} = {
  [ConditionOperator.eq]: (value1: any, value2: any) => value1 === value2,
  [ConditionOperator.ne]: (value1: any, value2: any) => value1 !== value2,
  [ConditionOperator.lt]: (value1: any, value2: any) => value1 < value2,
  [ConditionOperator.lte]: (value1: any, value2: any) => value1 <= value2,
  [ConditionOperator.gt]: (value1: any, value2: any) => value1 > value2,
  [ConditionOperator.gte]: (value1: any, value2: any) => value1 >= value2,
};

export type DataType = boolean | number | string | Record<string, any>;

export type ConditionType =
  | boolean
  | number
  | string
  | Record<string | ConditionOperator, any>
  | LogicalCondition;
export interface LogicalCondition
  extends Record<string | LogicalOperator, ConditionType[]> {}

export const isConditionSatisfied = (
  data: DataType,
  condition: ConditionType
): boolean => {
  const checkConditionSatisfied = (
    data: DataType,
    condition: ConditionType
  ): boolean => {
    try {
      if (!isObject(condition)) {
        return compareFuncMap[ConditionOperator.eq](data, condition);
      }

      return every(keys(condition), (key: string) => {
        if (key === LogicalOperator.and) {
          return every(
            condition[LogicalOperator.and],
            (logicalStatement: any) =>
              checkConditionSatisfied(data, logicalStatement)
          );
        }

        if (key === LogicalOperator.or) {
          return some(condition[LogicalOperator.or], (logicalStatement: any) =>
            checkConditionSatisfied(data, logicalStatement)
          );
        }

        if (!isObject(data)) {
          if (compareFuncMap[key as ConditionOperator] !== undefined) {
            return compareFuncMap[key as ConditionOperator](
              data,
              condition[key]
            );
          } else {
            return false;
          }
        }

        if (!isObject(condition[key])) {
          return compareFuncMap[ConditionOperator.eq](
            data[key],
            condition[key]
          );
        }

        return every(
          keys(condition[key]),
          (conditionOperator: ConditionOperator) => {
            if (compareFuncMap[conditionOperator] !== undefined) {
              return compareFuncMap[conditionOperator as ConditionOperator](
                data[key],
                condition[key][conditionOperator]
              );
            }
            return true;
          }
        );
      });
    } catch (error) {
      return false;
    }
  };

  return checkConditionSatisfied(data, condition);
};
