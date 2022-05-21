import { QueryOperatorValue } from "./constants/query";

export type QueryConditionValue = string | number | string[];

export interface QueryCondition {
  fieldId?: string;
  operator?: QueryOperatorValue;
  value?: QueryConditionValue;
}
