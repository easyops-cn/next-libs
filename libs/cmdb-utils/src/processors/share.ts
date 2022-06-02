import { ComparisonOperators, ElementOperators } from "../interfaces";

export enum ConditionOperators {
  OPERATOR_CONTAIN = "contain",
  OPERATOR_EQUAL = "equal",
  OPERATOR_NOT_CONTAIN = "notContain",
  OPERATOR_NOT_EQUAL = "notEqual",
  OPERATOR_IS_EMPTY = "isEmpty",
  OPERATOR_IN = "in",
  OPERATOR_NOT_IN = "notIn",
  OPERATOR_BETWEEN = "between",
  OPERATOR_IS_NOT_EMPTY = "isNotEmpty",
}

export interface Condition {
  field: string;
  operator: ConditionOperators;
  value: any;
}

export type AqOperators = ElementOperators | ComparisonOperators;
