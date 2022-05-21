import { keyBy } from "lodash";
import { NS_LIBS_CMDB_INSTANCES, K } from "../../i18n/constants";
import i18n from "i18next";
export enum QueryOperatorValue {
  Contain = "contain",
  NotContain = "notContain",
  Equal = "equal",
  NotEqual = "notEqual",
  Empty = "empty",
  NotEmpty = "notEmpty",
  Between = "between",
}

export interface QueryOperator {
  value: QueryOperatorValue;
  label: string;
}

export const CONTAIN_OPERATOR: QueryOperator = {
  value: QueryOperatorValue.Contain,
  label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CONTAIN}`),
};

export const NOT_CONTAIN_OPERATOR: QueryOperator = {
  value: QueryOperatorValue.NotContain,
  label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NOT_CONTAIN}`),
};

export const EQUAL_OPERATOR: QueryOperator = {
  value: QueryOperatorValue.Equal,
  label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.EQUAL}`),
};

export const NOT_EQUAL_OPERATOR: QueryOperator = {
  value: QueryOperatorValue.NotEqual,
  label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NOT_EQUAL}`),
};

export const EMPTY_OPERATOR: QueryOperator = {
  value: QueryOperatorValue.Empty,
  label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.EMPTY}`),
};

export const NOT_EMPTY_OPERATOR: QueryOperator = {
  value: QueryOperatorValue.NotEmpty,
  label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NOT_EMPTY}`),
};

export const BETWEEN_OPERATOR: QueryOperator = {
  value: QueryOperatorValue.Between,
  label: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.RANGE}`),
};

export const OPERATOR_LIST: QueryOperator[] = [
  CONTAIN_OPERATOR,
  NOT_CONTAIN_OPERATOR,
  EQUAL_OPERATOR,
  NOT_EQUAL_OPERATOR,
  EMPTY_OPERATOR,
  NOT_EMPTY_OPERATOR,
];

export const OPERATOR_MAP = keyBy(OPERATOR_LIST, "value");

export enum AttrValueType {
  Str = "str",
  Int = "int",
  Float = "float",
  Date = "date",
  Datetime = "datetime",
  Enum = "enum",
  Arr = "arr",
  FK = "FK",
  FKs = "FKs",
  Struct = "struct",
  Structs = "structs",
  Ip = "ip",
  Boolean = "bool",
  Json = "json",
  Enums = "enums",
}

export const AttrOperatorMap: { [key in AttrValueType]: QueryOperator[] } = {
  str: [
    CONTAIN_OPERATOR,
    NOT_CONTAIN_OPERATOR,
    EQUAL_OPERATOR,
    NOT_EQUAL_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  int: [
    EQUAL_OPERATOR,
    NOT_EQUAL_OPERATOR,
    BETWEEN_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  float: [
    EQUAL_OPERATOR,
    NOT_EQUAL_OPERATOR,
    BETWEEN_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  date: [
    EQUAL_OPERATOR,
    NOT_EQUAL_OPERATOR,
    BETWEEN_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  datetime: [BETWEEN_OPERATOR, EMPTY_OPERATOR, NOT_EMPTY_OPERATOR],
  enum: [
    EQUAL_OPERATOR,
    NOT_EQUAL_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  arr: [
    CONTAIN_OPERATOR,
    NOT_CONTAIN_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  FK: [
    CONTAIN_OPERATOR,
    NOT_CONTAIN_OPERATOR,
    EQUAL_OPERATOR,
    NOT_EQUAL_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  FKs: [
    CONTAIN_OPERATOR,
    NOT_CONTAIN_OPERATOR,
    EQUAL_OPERATOR,
    NOT_EQUAL_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  structs: [
    CONTAIN_OPERATOR,
    NOT_CONTAIN_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  struct: [
    CONTAIN_OPERATOR,
    NOT_CONTAIN_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  ip: [
    CONTAIN_OPERATOR,
    NOT_CONTAIN_OPERATOR,
    EQUAL_OPERATOR,
    NOT_EQUAL_OPERATOR,
    BETWEEN_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  bool: [
    EQUAL_OPERATOR,
    NOT_EQUAL_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  json: [
    CONTAIN_OPERATOR,
    NOT_CONTAIN_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
  enums: [
    CONTAIN_OPERATOR,
    NOT_CONTAIN_OPERATOR,
    EMPTY_OPERATOR,
    NOT_EMPTY_OPERATOR,
  ],
};
