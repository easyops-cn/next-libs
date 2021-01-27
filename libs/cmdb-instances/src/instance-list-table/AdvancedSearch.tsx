import React, { ChangeEvent, FormEvent } from "react";
import update from "immutability-helper";
import {
  isEqual,
  find,
  startsWith,
  findKey,
  isNil,
  flatten,
  isString,
  isArray,
} from "lodash";
import { Form } from "@ant-design/compatible";
import { Button, Col, Input, Row, Select } from "antd";
import { FormComponentProps } from "@ant-design/compatible/lib/form";
import { CmdbModels } from "@sdk/cmdb-sdk";
import {
  forEachAvailableFields,
  getInstanceNameKeys,
  RelationIdKeys,
  RelationNameKeys,
  RelationObjectIdKeys,
} from "@libs/cmdb-utils";

import styles from "./AdvancedSearch.module.css";
import {
  FormControlTypeEnum,
  ModelAttributeFormControl,
  ModelAttributeValueType,
} from "../model-attribute-form-control/ModelAttributeFormControl";
import {
  processAttrValueWithQuote,
  ENABLED_CMDB_ADVANCE_SEARCH_WITH_QUOTE,
} from "../processors";

enum ComparisonOperators {
  Equal = "$eq",
  NotEqual = "$ne",
  Like = "$like",
  NotLike = "$nlike",
  GreaterThan = "$gt",
  GreaterThanOrEqual = "$gte",
  LessThan = "$lt",
  LessThanOrEqual = "$lte",
  In = "$in",
  NotIn = "$nin",
}

enum ElementOperators {
  Exists = "$exists",
}

export enum LogicalOperators {
  And = "$and",
  Or = "$or",
}

export type QueryOperatorExpressions = Partial<
  Record<ComparisonOperators | ElementOperators, any>
>;

export interface Query {
  [fieldOrLogical: string]: QueryOperatorExpressions | Query[];
}

export enum ConditionType {
  Equal = "equal",
  NotEqual = "notEqual",
  Contain = "contain",
  NotContain = "notContain",
  Empty = "empty",
  NotEmpty = "notEmpty",
  Between = "between",
  True = "true",
  False = "false",
}

interface ConditionOperation {
  operator: ComparisonOperators | ElementOperators;
  fixedValue?: any;
  prefix?: string;
  suffix?: string;
}

interface Condition {
  type: ConditionType;
  label: string;
  operations: ConditionOperation[];
}

const FieldTypeConditionTypesMap: Record<string, ConditionType[]> = {
  [ModelAttributeValueType.STRING]: [
    ConditionType.Contain,
    ConditionType.NotContain,
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
  [ModelAttributeValueType.INTEGER]: [
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Between,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
  [ModelAttributeValueType.FLOAT]: [
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Between,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
  [ModelAttributeValueType.DATE]: [
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Between,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
  [ModelAttributeValueType.DATETIME]: [
    ConditionType.Between,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
  [ModelAttributeValueType.ENUM]: [
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
  [ModelAttributeValueType.ENUMS]: [
    ConditionType.Contain,
    ConditionType.NotContain,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
  [ModelAttributeValueType.ARR]: [
    ConditionType.Contain,
    ConditionType.NotContain,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
  [ModelAttributeValueType.STRUCT]: [
    ConditionType.Contain,
    ConditionType.NotContain,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
  [ModelAttributeValueType.IP]: [
    ConditionType.Contain,
    ConditionType.NotContain,
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Between,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
  [ModelAttributeValueType.BOOLEAN]: [
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
  [ModelAttributeValueType.JSON]: [
    ConditionType.Contain,
    ConditionType.NotContain,
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
};

const multiValueSearchOperators = [
  {
    comparisonOperator: ComparisonOperators.Like,
    logicalOperator: LogicalOperators.Or,
  },
  {
    comparisonOperator: ComparisonOperators.NotLike,
    logicalOperator: LogicalOperators.And,
  },
  {
    comparisonOperator: ComparisonOperators.Equal,
    logicalOperator: LogicalOperators.Or,
  },
  {
    comparisonOperator: ComparisonOperators.NotEqual,
    logicalOperator: LogicalOperators.And,
  },
];
FieldTypeConditionTypesMap[ModelAttributeValueType.STRUCT_LIST] =
  FieldTypeConditionTypesMap[ModelAttributeValueType.STRUCT];

function getCondition(
  conditionType: ConditionType,
  fieldType: ModelAttributeValueType
): Condition {
  let label: string;
  let operations: ConditionOperation[];

  switch (conditionType) {
    case ConditionType.Equal:
      label = "等于";
      operations = [
        {
          operator: ComparisonOperators.Equal,
        },
      ];
      break;
    case ConditionType.NotEqual:
      label = "不等于";
      operations = [
        {
          operator: ComparisonOperators.NotEqual,
        },
      ];
      break;
    case ConditionType.Contain:
      label = "包含";
      switch (fieldType) {
        case ModelAttributeValueType.ENUMS:
        case ModelAttributeValueType.ARR:
          operations = [
            {
              operator: ComparisonOperators.In,
            },
          ];
          break;
        default:
          operations = [
            {
              operator: ComparisonOperators.Like,
              prefix: "%",
              suffix: "%",
            },
          ];
      }
      break;
    case ConditionType.NotContain:
      label = "不包含";
      switch (fieldType) {
        case ModelAttributeValueType.ENUMS:
        case ModelAttributeValueType.ARR:
          operations = [
            {
              operator: ComparisonOperators.NotIn,
            },
          ];
          break;
        default:
          operations = [
            {
              operator: ComparisonOperators.NotLike,
              prefix: "%",
              suffix: "%",
            },
          ];
      }
      break;
    case ConditionType.Empty:
      label = "为空";
      operations = [
        {
          operator: ElementOperators.Exists,
          fixedValue: false,
        },
      ];
      break;
    case ConditionType.NotEmpty:
      label = "不为空";
      operations = [
        {
          operator: ElementOperators.Exists,
          fixedValue: true,
        },
      ];
      break;
    case ConditionType.True:
      label = "true";
      operations = [
        {
          operator: ComparisonOperators.Equal,
          fixedValue: true,
        },
      ];
      break;
    case ConditionType.False:
      label = "false";
      operations = [
        {
          operator: ComparisonOperators.Equal,
          fixedValue: false,
        },
      ];
      break;
    case ConditionType.Between:
      operations = [
        {
          operator: ComparisonOperators.GreaterThanOrEqual,
        },
        {
          operator: ComparisonOperators.LessThanOrEqual,
        },
      ];
      switch (fieldType) {
        case ModelAttributeValueType.INTEGER:
        case ModelAttributeValueType.FLOAT:
          label = "在此区间";
          break;
        case ModelAttributeValueType.DATE:
        case ModelAttributeValueType.DATETIME:
          label = "在此期间";
          break;
        case ModelAttributeValueType.IP:
          label = "范围";
          break;
        default:
          label = "在此之间";
      }
      break;
  }

  return {
    type: conditionType,
    label,
    operations,
  };
}

export function convertValue(valueType: string, value: any): any {
  if (typeof value !== "boolean") {
    switch (valueType) {
      case ModelAttributeValueType.INTEGER:
        return parseInt(value);
      case ModelAttributeValueType.FLOAT:
        return parseFloat(value);
    }
  }
  return value;
}

export function getFieldConditionsAndValues(
  fieldQueryOperatorExpressionsMap: Record<string, QueryOperatorExpressions>,
  id: string,
  valueType: ModelAttributeValueType,
  isRelation?: boolean,
  relationSideId?: string,
  index?: number
) {
  let isRelationWithNoExpression = false;
  let expressions = fieldQueryOperatorExpressionsMap[id];
  let expressionsKeysStr: string;
  if (!expressions && isRelation) {
    isRelationWithNoExpression = true;
    const relatedKey = findKey(fieldQueryOperatorExpressionsMap, (v, k) =>
      startsWith(k, `${relationSideId}.`)
    );
    const relatedExpressions = fieldQueryOperatorExpressionsMap[relatedKey];
    if (
      relatedExpressions &&
      !isNil(relatedExpressions[ElementOperators.Exists])
    ) {
      expressions = fieldQueryOperatorExpressionsMap[relatedKey];
    }
  }

  if (expressions) {
    expressionsKeysStr = Object.keys(expressions).join("");
  }
  let currentCondition: Condition;
  const availableConditions = FieldTypeConditionTypesMap[valueType].map(
    (conditionType) => {
      const condition = getCondition(conditionType, valueType);

      if (expressionsKeysStr) {
        let operatorsStr = "";
        const isFixedValueEqual = condition.operations.every((operation) => {
          operatorsStr += operation.operator;

          if (operation.fixedValue !== undefined) {
            return operation.fixedValue === expressions[operation.operator];
          } else {
            return true;
          }
        });
        if (isFixedValueEqual && operatorsStr === expressionsKeysStr) {
          currentCondition = condition;
        }
      }

      return condition;
    }
  );
  if (!currentCondition) {
    currentCondition = availableConditions[0];
  }
  let queryValuesStr = "";
  let values = currentCondition.operations.map((operation) => {
    let value: any;

    if (expressions?.[operation.operator] !== undefined) {
      value = expressions[operation.operator];
      let values = [expressions[operation.operator]];
      const i = multiValueSearchOperators.find(
        (multiValueSearchOperator) =>
          multiValueSearchOperator.comparisonOperator === operation.operator
      );
      if (i) {
        if (
          valueType === ModelAttributeValueType.ENUM ||
          typeof expressions[operation.operator] === "string"
        ) {
          values = expressions[operation.operator]
            .trim()
            .split(/\s+/)
            .map((value: string) => convertValue(valueType, value));
        }
      }

      if (typeof values[0] === "string") {
        queryValuesStr = values.join(" ");
        values = values.map((value: string) => {
          if (operation.prefix && value.startsWith(operation.prefix)) {
            value = value.slice(operation.prefix.length);
          }
          if (operation.suffix && value.endsWith(operation.suffix)) {
            value = value.slice(0, value.length - operation.suffix.length);
          }
          return value;
        });
        value =
          valueType === ModelAttributeValueType.ENUM
            ? values
            : values.join(" ");
      }
    } else {
      value = operation.fixedValue !== undefined ? operation.fixedValue : null;
    }

    return value;
  });

  let disabled = false;

  if (
    isRelation &&
    expressions &&
    currentCondition.operations[0].operator === ElementOperators.Exists &&
    isRelationWithNoExpression
  ) {
    disabled = true;
    currentCondition = availableConditions[0];
    values = [null];
    queryValuesStr = "";
  }

  return {
    availableConditions,
    currentCondition,
    values,
    queryValuesStr,
    disabled,
  };
}

interface Field {
  id: string;
  name: string;
  attrValue: Partial<CmdbModels.ModelObjectAttrValue>;
  values: any[];
  availableConditions: Condition[];
  currentCondition: Condition;
  isRelation: boolean;
  relationSideId?: string;
  disabled?: boolean;
}

export interface AdvancedSearchFormProps extends FormComponentProps {
  fieldIds?: string[];
  idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>;
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  q?: Query[];
  placeholder?: string;
  onSearch?(
    queries: Query[],
    queriesToShow?: Query[],
    fieldToShow?: Record<string, any[]>[]
  ): void;
  fieldToShow?: Record<string, any[]>[]; // 回填高级搜索的field值（根据query回填丢失了引号信息）
  onChange?(e: ChangeEvent<HTMLInputElement>): void;
}

export interface AdvancedSearchFormState {
  fields: Field[];
}

export class AdvancedSearchForm extends React.Component<
  AdvancedSearchFormProps,
  AdvancedSearchFormState
> {
  constructor(props: AdvancedSearchFormProps) {
    super(props);

    this.state = this.computeState();
  }

  componentDidUpdate(prevProps: Readonly<AdvancedSearchFormProps>): void {
    if (!isEqual(this.props.q, prevProps.q)) {
      const newState = this.computeState();
      this.setState(newState);

      this.setFormFieldValues(newState.fields);
    }
  }

  computeState(): { fields: Field[] } {
    const fieldQueryOperatorExpressionsMap: Record<
      string,
      QueryOperatorExpressions
    > = {};
    const fields: Field[] = [];
    if (this.props.q) {
      this.props.q.forEach((query) => {
        Object.entries(query).forEach(([key, expressions]) => {
          if (key === LogicalOperators.Or || key === LogicalOperators.And) {
            const firstSubQuery = (expressions as Query[])[0];
            const fieldId = Object.keys(firstSubQuery)[0];
            const compareOperator = Object.keys(firstSubQuery[fieldId])[0];
            let subQueryValue = "";
            let targetField;
            if (ENABLED_CMDB_ADVANCE_SEARCH_WITH_QUOTE) {
              targetField = this.props?.fieldToShow.find(
                (fieldItem) => Object.keys(fieldItem)[0] === fieldId
              );
            }
            if (!isNil(targetField)) {
              subQueryValue = isArray(targetField[fieldId])
                ? targetField[fieldId].join("")
                : (targetField[fieldId] as any);
            } else {
              subQueryValue = (expressions as Query[])
                .map((query) => {
                  const targetValue = (query[fieldId] as Record<
                    ComparisonOperators,
                    any
                  >)[compareOperator as ComparisonOperators];
                  if (
                    compareOperator === ComparisonOperators.Like ||
                    compareOperator === ComparisonOperators.NotLike
                  ) {
                    return isString(targetValue) && targetValue.includes(" ")
                      ? `${targetValue[0]}"${targetValue.slice(
                          1,
                          targetValue.length - 1
                        )}"${targetValue[targetValue.length - 1]}`
                      : targetValue;
                  } else {
                    return isString(targetValue) && targetValue.includes(" ")
                      ? `"${targetValue}"`
                      : targetValue;
                  }
                })
                .join(" ");
            }
            key = fieldId;
            expressions = {
              [compareOperator]: subQueryValue,
            };
          }

          fieldQueryOperatorExpressionsMap[
            key
          ] = expressions as QueryOperatorExpressions;
        });
      });
    }
    forEachAvailableFields(
      this.props.modelData,
      (attr) => {
        const attrValue: Partial<CmdbModels.ModelObjectAttrValue> & {
          isStruct?: boolean;
        } = {};

        switch (attr.value.type) {
          case ModelAttributeValueType.STRUCT:
          case ModelAttributeValueType.STRUCT_LIST:
            attrValue.type = ModelAttributeValueType.STRING;
            attrValue.struct_define = attr.value.struct_define;
            attrValue.isStruct = true;
            break;
          case ModelAttributeValueType.ENUM:
          case ModelAttributeValueType.ENUMS:
            attrValue.type = attr.value.type;
            attrValue.regex = attr.value.regex;
            break;
          default:
            attrValue.type = attr.value.type;
        }

        fields.push({
          id: attr.id,
          name: attr.name,
          attrValue,
          isRelation: false,
          ...getFieldConditionsAndValues(
            fieldQueryOperatorExpressionsMap,
            attr.id,
            attr.value.type as ModelAttributeValueType
          ),
        });
      },
      (relation, sides) => {
        const relationObject = this.props.idObjectMap[
          relation[`${sides.that}_object_id` as RelationObjectIdKeys]
        ];
        const showKeys = getInstanceNameKeys(relationObject);
        showKeys.forEach((showKey, index) => {
          const nameOfShowKey =
            find(relationObject?.attrList, ["id", showKey])?.name ?? showKey;
          const id = `${
            relation[`${sides.this}_id` as RelationIdKeys]
          }.${showKey}`;
          const type = ModelAttributeValueType.STRING;

          fields.push({
            id,
            name: `${
              relation[`${sides.this}_name` as RelationNameKeys]
            }(${nameOfShowKey})`,
            attrValue: { type },
            isRelation: true,
            relationSideId: relation[`${sides.this}_id` as RelationIdKeys],
            ...getFieldConditionsAndValues(
              fieldQueryOperatorExpressionsMap,
              id,
              type,
              true,
              relation[`${sides.this}_id` as RelationNameKeys],
              index
            ),
          });
        });
      },
      this.props.fieldIds
    );

    return { fields };
  }

  setFormFieldValues(fields: Field[]): void {
    const values = fields.reduce<{ [key: string]: any }>((acc, field) => {
      field.values.map((value, valueIndex) => {
        const operation = field.currentCondition.operations[valueIndex];
        acc[`${field.id}[${valueIndex}]`] =
          operation.fixedValue === undefined ? value : "";
      });
      return acc;
    }, {});
    this.props.form.setFieldsValue(values);
  }

  onValueChange = (
    value: any,
    valueIndex: number,
    field: Field,
    fieldIndex: number
  ) => {
    this.setState({
      fields: update(this.state.fields, {
        [fieldIndex]: { values: { [valueIndex]: { $set: value } } },
      }),
    });
  };

  onConditionChange = (
    value: ConditionType,
    field: Field,
    fieldIndex: number
  ) => {
    const hasFixedValues = field.currentCondition.operations.some(
      (operation) => operation.fixedValue !== undefined
    );

    const condition = field.availableConditions.find(
      (condition) => condition.type === value
    );
    let newValues = condition.operations.map((operation) =>
      operation.fixedValue !== undefined ? operation.fixedValue : null
    );
    if (
      newValues.every((value) => value === null) &&
      !hasFixedValues &&
      this.state.fields[fieldIndex].values.length === newValues.length
    ) {
      newValues = this.state.fields[fieldIndex].values;
    }

    let newFields = update(this.state.fields, {
      [fieldIndex]: {
        currentCondition: { $set: condition },
        values: {
          $set: newValues,
        },
      },
    });

    const relatedFieldIndex = newFields.findIndex(
      (f) =>
        f.isRelation &&
        f.relationSideId === field.relationSideId &&
        f.id !== field.id
    );
    if (relatedFieldIndex !== -1) {
      const relatedField = newFields[relatedFieldIndex];
      if (condition.operations[0].operator === ElementOperators.Exists) {
        newFields = update(newFields, {
          [relatedFieldIndex]: {
            currentCondition: { $set: relatedField.availableConditions[0] },
            values: {
              $set: [null],
            },
            disabled: {
              $set: true,
            },
          },
        });
      } else {
        newFields = update(newFields, {
          [relatedFieldIndex]: {
            disabled: {
              $set: false,
            },
          },
        });
      }
    }

    this.setState({
      fields: newFields,
    });

    this.setFormFieldValues(newFields);
  };

  getFields() {
    const { getFieldDecorator } = this.props.form;
    const hasBetween = this.state.fields.some((field) =>
      [
        ModelAttributeValueType.IP,
        ModelAttributeValueType.DATE,
        ModelAttributeValueType.DATETIME,
      ].includes(field.attrValue.type as ModelAttributeValueType)
    );
    return this.state.fields.map((field, fieldIndex) => {
      let type: string;
      let style: React.CSSProperties;
      let attrValue: any = field.attrValue;
      let multiSelect = false;
      switch (field.attrValue.type) {
        case ModelAttributeValueType.INTEGER:
        case ModelAttributeValueType.FLOAT:
          attrValue = {
            type: ModelAttributeValueType.STRING,
          };
          break;
        case ModelAttributeValueType.ENUM:
        case ModelAttributeValueType.ENUMS:
          type = FormControlTypeEnum.SELECT;
          multiSelect = true;
          break;
        case ModelAttributeValueType.DATETIME:
          style = { minWidth: "auto" };
          break;
      }
      return (
        <Col span={hasBetween ? 12 : 8} key={field.id}>
          <Form.Item label={field.name}>
            <Input.Group className={styles.conditionInputGroup} compact>
              <Select
                dropdownMatchSelectWidth={false}
                value={field.currentCondition.type}
                onChange={(value: ConditionType) =>
                  this.onConditionChange(value, field, fieldIndex)
                }
                disabled={field.disabled}
              >
                {field.availableConditions.map((condition) => (
                  <Select.Option value={condition.type} key={condition.type}>
                    {condition.label}
                  </Select.Option>
                ))}
              </Select>
              {field.values.map((value, valueIndex) => {
                const operation = field.currentCondition.operations[valueIndex];

                return (
                  <React.Fragment
                    key={`${field.currentCondition.type}-${operation.operator}`}
                  >
                    {valueIndex > 0 && (
                      <Input
                        className={styles.separatorInput}
                        placeholder="~"
                        disabled
                      />
                    )}
                    {getFieldDecorator(`${field.id}[${valueIndex}]`, {
                      initialValue:
                        operation.fixedValue === undefined ? value : "",
                    })(
                      operation.fixedValue === undefined && !field.disabled ? (
                        <ModelAttributeFormControl
                          type={type}
                          attribute={{
                            id: field.id,
                            name: field.name,
                            value: attrValue,
                          }}
                          multiSelect={multiSelect}
                          onChange={(value: any) =>
                            this.onValueChange(
                              value,
                              valueIndex,
                              field,
                              fieldIndex
                            )
                          }
                          className={styles.conditionInput}
                          style={style}
                        />
                      ) : (
                        <Input disabled />
                      )
                    )}
                  </React.Fragment>
                );
              })}
            </Input.Group>
          </Form.Item>
        </Col>
      );
    });
  }

  handleSearch = (e: FormEvent<any>): void => {
    e.preventDefault();
    if (this.props.onSearch) {
      // 当过滤字段为relation并且过滤条件为ElementOperators.Exists的时候，发起后台请求的搜索queries与负责前端展示的query不同。需要额外处理。
      let queries: Query[] = [];
      let queriesToShow: Query[] = [];
      const fieldToShow: Record<string, any[]>[] = [];
      this.state.fields.forEach((field) => {
        const expressions: QueryOperatorExpressions = {};
        let fieldQuery: Query = { [field.id]: expressions };
        let fieldQueryToShow: Query = { [field.id]: expressions };
        let hasValue = false;
        let structQueryId: string[];
        const isStruct = !!(field.attrValue as any).isStruct;
        if (isStruct) {
          structQueryId = field.attrValue.struct_define.map(
            (struct_item) => `${field.id}.${struct_item.id}`
          );
        }
        field.values.forEach((value, index) => {
          const operation = field.currentCondition.operations[index];
          const fieldId =
            field.isRelation && ElementOperators.Exists === operation.operator
              ? field.relationSideId
              : field.id;
          fieldQuery = { [fieldId]: expressions };

          const fieldIdToShow = field.id;
          fieldQueryToShow = { [fieldIdToShow]: expressions };

          if (
            value !== null &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0)
          ) {
            const multiValueSearchOperator = multiValueSearchOperators.find(
              (operator) => operator.comparisonOperator === operation.operator
            );
            if (multiValueSearchOperator) {
              let values: any[];
              if (field.attrValue.type === ModelAttributeValueType.ENUM) {
                values = value;
              } else if (typeof value === "string") {
                if (
                  !ENABLED_CMDB_ADVANCE_SEARCH_WITH_QUOTE ||
                  !value.includes('"')
                ) {
                  values = value
                    .trim()
                    .split(/\s+/)
                    .map((value) => convertValue(field.attrValue.type, value));
                } else {
                  values = processAttrValueWithQuote(value, []);
                }
              } else {
                values = [value];
              }
              if (values.length) {
                if (isStruct) {
                  fieldQuery = {
                    [multiValueSearchOperator.logicalOperator]: flatten(
                      values.map((value) => {
                        if (operation.prefix) {
                          value = operation.prefix + value;
                        }
                        if (operation.suffix) {
                          value += operation.suffix;
                        }

                        return structQueryId.map(
                          (structId: string | number) => ({
                            [structId]: {
                              [operation.operator]: value,
                            },
                          })
                        );
                      })
                    ),
                  };
                } else {
                  fieldQuery = {
                    [multiValueSearchOperator.logicalOperator]: values.map(
                      (value) => {
                        if (operation.prefix) {
                          value = operation.prefix + value;
                        }
                        if (operation.suffix) {
                          value += operation.suffix;
                        }
                        return {
                          [fieldId]: {
                            [operation.operator]: value,
                          },
                        };
                      }
                    ),
                  };
                }
                fieldQueryToShow = {
                  [multiValueSearchOperator.logicalOperator]: values.map(
                    (value) => {
                      if (operation.prefix) {
                        value = operation.prefix + value;
                      }
                      if (operation.suffix) {
                        value += operation.suffix;
                      }
                      return {
                        [fieldIdToShow]: {
                          [operation.operator]: value,
                        },
                      };
                    }
                  ),
                };
                hasValue = true;
                fieldToShow.push({ [field.id]: field.values });
              }
            } else {
              value = convertValue(field.attrValue.type, value);
              if (operation.prefix) {
                value = operation.prefix + value;
              }
              if (operation.suffix) {
                value += operation.suffix;
              }
              expressions[operation.operator] = value;
              hasValue = true;
              fieldToShow.push({ [field.id]: field.values });
            }
          }
        });
        if (hasValue) {
          queries.push(fieldQuery);
          queriesToShow.push(fieldQueryToShow);
        }
      });
      if (queries.length === 0) {
        queries = undefined;
        queriesToShow = undefined;
      }
      if (!isEqual(this.props.q, queries)) {
        this.props.onSearch(queries, queriesToShow, fieldToShow);
      }
    }
  };

  handleReset = () => {
    this.props.onSearch([], [], []);
    this.props.form.resetFields();
  };

  render(): React.ReactNode {
    return (
      <div className={styles.advancedSearch}>
        <Form
          layout="vertical"
          className={styles.advancedSearchForm}
          onSubmit={this.handleSearch}
        >
          <Row gutter={50}>{this.getFields()}</Row>
          <Row>
            <Col span={24} style={{ textAlign: "right" }}>
              <Button
                type="primary"
                htmlType="submit"
                data-testid="submit-button"
              >
                搜索
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={this.handleReset}
                data-testid="reset-button"
              >
                重置
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export const AdvancedSearch = Form.create<AdvancedSearchFormProps>({
  name: "advanced_search",
})(AdvancedSearchForm);
