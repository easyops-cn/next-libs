import React, { ChangeEvent, FormEvent } from "react";
import update from "immutability-helper";
import { isEqual } from "lodash";
import { Button, Col, Form, Input, Row, Select } from "antd";
import { FormComponentProps } from "antd/lib/form";
import { CmdbModels } from "@sdk/cmdb-sdk";
import {
  forEachAvailableFields,
  getInstanceNameKeys,
  RelationIdKeys,
  RelationNameKeys,
  RelationObjectIdKeys
} from "@libs/cmdb-utils";

import { InstanceListPresetConfigs } from "./interfaces";
import styles from "./AdvancedSearch.module.css";
import {
  FormControlTypeEnum,
  ModelAttributeFormControl,
  ModelAttributeValueType
} from "../model-attribute-form-control/ModelAttributeFormControl";

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
  NotIn = "$nin"
}

enum ElementOperators {
  Exists = "$exists"
}

export enum LogicalOperators {
  And = "$and",
  Or = "$or"
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
  False = "false"
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
    ConditionType.NotEmpty
  ],
  [ModelAttributeValueType.INTEGER]: [
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Between,
    ConditionType.Empty,
    ConditionType.NotEmpty
  ],
  [ModelAttributeValueType.FLOAT]: [
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Between,
    ConditionType.Empty,
    ConditionType.NotEmpty
  ],
  [ModelAttributeValueType.DATE]: [
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Between,
    ConditionType.Empty,
    ConditionType.NotEmpty
  ],
  [ModelAttributeValueType.DATETIME]: [
    ConditionType.Between,
    ConditionType.Empty,
    ConditionType.NotEmpty
  ],
  [ModelAttributeValueType.ENUM]: [
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Empty,
    ConditionType.NotEmpty
  ],
  [ModelAttributeValueType.ARR]: [
    ConditionType.Contain,
    ConditionType.NotContain,
    ConditionType.Empty,
    ConditionType.NotEmpty
  ],
  [ModelAttributeValueType.STRUCT]: [
    ConditionType.Contain,
    ConditionType.NotContain,
    ConditionType.Empty,
    ConditionType.NotEmpty
  ],
  [ModelAttributeValueType.IP]: [
    ConditionType.Contain,
    ConditionType.NotContain,
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Between,
    ConditionType.Empty,
    ConditionType.NotEmpty
  ],
  [ModelAttributeValueType.BOOLEAN]: [
    ConditionType.Equal,
    ConditionType.NotEqual,
    ConditionType.Empty,
    ConditionType.NotEmpty
  ]
};

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
          operator: ComparisonOperators.Equal
        }
      ];
      break;
    case ConditionType.NotEqual:
      label = "不等于";
      operations = [
        {
          operator: ComparisonOperators.NotEqual
        }
      ];
      break;
    case ConditionType.Contain:
      label = "包含";
      switch (fieldType) {
        case ModelAttributeValueType.ARR:
          operations = [
            {
              operator: ComparisonOperators.In
            }
          ];
          break;
        default:
          operations = [
            {
              operator: ComparisonOperators.Like,
              prefix: "%",
              suffix: "%"
            }
          ];
      }
      break;
    case ConditionType.NotContain:
      label = "不包含";
      switch (fieldType) {
        case ModelAttributeValueType.ARR:
          operations = [
            {
              operator: ComparisonOperators.NotIn
            }
          ];
          break;
        default:
          operations = [
            {
              operator: ComparisonOperators.NotLike,
              prefix: "%",
              suffix: "%"
            }
          ];
      }
      break;
    case ConditionType.Empty:
      label = "为空";
      operations = [
        {
          operator: ElementOperators.Exists,
          fixedValue: false
        }
      ];
      break;
    case ConditionType.NotEmpty:
      label = "不为空";
      operations = [
        {
          operator: ElementOperators.Exists,
          fixedValue: true
        }
      ];
      break;
    case ConditionType.True:
      label = "true";
      operations = [
        {
          operator: ComparisonOperators.Equal,
          fixedValue: true
        }
      ];
      break;
    case ConditionType.False:
      label = "false";
      operations = [
        {
          operator: ComparisonOperators.Equal,
          fixedValue: false
        }
      ];
      break;
    case ConditionType.Between:
      operations = [
        {
          operator: ComparisonOperators.GreaterThanOrEqual
        },
        {
          operator: ComparisonOperators.LessThanOrEqual
        }
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
    operations
  };
}

export function getFieldConditionsAndValues(
  fieldQueryOperatorExpressionsMap: Record<string, QueryOperatorExpressions>,
  id: string,
  valueType: ModelAttributeValueType
) {
  const expressions = fieldQueryOperatorExpressionsMap[id];
  let expressionsKeysStr: string;
  if (expressions) {
    expressionsKeysStr = Object.keys(expressions).join("");
  }
  let currentCondition: Condition;
  const availableConditions = FieldTypeConditionTypesMap[valueType].map(
    conditionType => {
      const condition = getCondition(conditionType, valueType);

      if (expressionsKeysStr) {
        let operatorsStr = "";
        const isFixedValueEqual = condition.operations.every(operation => {
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
  const values = currentCondition.operations.map(operation => {
    let value: string;

    if (expressions?.[operation.operator] !== undefined) {
      value = expressions[operation.operator];
      if (operation.prefix && value.startsWith(operation.prefix)) {
        value = value.slice(operation.prefix.length);
      }
      if (operation.suffix && value.endsWith(operation.suffix)) {
        value = value.slice(0, value.length - operation.suffix.length);
      }
    } else {
      value = operation.fixedValue !== undefined ? operation.fixedValue : null;
    }

    return value;
  });

  return {
    availableConditions,
    currentCondition,
    values
  };
}

interface Field {
  id: string;
  name: string;
  attrValue: Partial<CmdbModels.ModelObjectAttrValue>;
  values: any[];
  availableConditions: Condition[];
  currentCondition: Condition;
}

export interface AdvancedSearchFormProps extends FormComponentProps {
  presetConfigs?: InstanceListPresetConfigs;
  idObjectMap: Record<string, Partial<CmdbModels.ModelCmdbObject>>;
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  q?: Query[];
  placeholder?: string;
  onSearch?(queries: Query[]): void;
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

    const fieldQueryOperatorExpressionsMap: Record<
      string,
      QueryOperatorExpressions
    > = {};
    const fields: Field[] = [];
    if (this.props.q) {
      this.props.q.forEach(query => {
        Object.entries(query).forEach(([key, expressions]) => {
          fieldQueryOperatorExpressionsMap[
            key
          ] = expressions as QueryOperatorExpressions;
        });
      });
    }
    forEachAvailableFields(
      this.props.modelData,
      attr => {
        const attrValue: Partial<CmdbModels.ModelObjectAttrValue> = {};

        switch (attr.value.type) {
          case ModelAttributeValueType.STRUCT:
          case ModelAttributeValueType.STRUCT_LIST:
            attrValue.type = ModelAttributeValueType.STRING;
            break;
          case ModelAttributeValueType.ENUM:
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
          ...getFieldConditionsAndValues(
            fieldQueryOperatorExpressionsMap,
            attr.id,
            attr.value.type as ModelAttributeValueType
          )
        });
      },
      (relation, sides) => {
        const id = `${
          relation[`${sides.this}_id` as RelationIdKeys]
        }.${getInstanceNameKeys(
          this.props.idObjectMap[
            relation[`${sides.that}_object_id` as RelationObjectIdKeys]
          ]
        )}`;
        const type = ModelAttributeValueType.STRING;

        fields.push({
          id,
          name: relation[`${sides.this}_name` as RelationNameKeys],
          attrValue: { type },
          ...getFieldConditionsAndValues(
            fieldQueryOperatorExpressionsMap,
            id,
            type
          )
        });
      },
      this.props.presetConfigs?.fieldIds
    );

    this.state = { fields };
  }

  onValueChange = (
    value: any,
    valueIndex: number,
    field: Field,
    fieldIndex: number
  ) => {
    this.setState({
      fields: update(this.state.fields, {
        [fieldIndex]: { values: { [valueIndex]: { $set: value } } }
      })
    });
  };

  onConditionChange = (
    value: ConditionType,
    field: Field,
    fieldIndex: number
  ) => {
    const condition = field.availableConditions.find(
      condition => condition.type === value
    );
    this.setState({
      fields: update(this.state.fields, {
        [fieldIndex]: {
          currentCondition: { $set: condition },
          values: {
            $set: condition.operations.map(operation =>
              operation.fixedValue !== undefined ? operation.fixedValue : null
            )
          }
        }
      })
    });
  };

  getFields() {
    const { getFieldDecorator } = this.props.form;
    const hasBetween = this.state.fields.some(field =>
      [
        ModelAttributeValueType.IP,
        ModelAttributeValueType.DATE,
        ModelAttributeValueType.DATETIME
      ].includes(field.attrValue.type as ModelAttributeValueType)
    );
    return this.state.fields.map((field, fieldIndex) => {
      let type: string;
      let style: React.CSSProperties;
      switch (field.attrValue.type) {
        case ModelAttributeValueType.ENUM:
          type = FormControlTypeEnum.SELECT;
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
              >
                {field.availableConditions.map(condition => (
                  <Select.Option key={condition.type}>
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
                        operation.fixedValue === undefined ? value : ""
                    })(
                      operation.fixedValue === undefined ? (
                        <ModelAttributeFormControl
                          type={type}
                          attribute={{
                            id: field.id,
                            name: field.name,
                            value: field.attrValue
                          }}
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
      let queries: Query[] = [];
      this.state.fields.forEach(field => {
        const expressions: QueryOperatorExpressions = {};
        const fieldQuery: Query = { [field.id]: expressions };
        let hasValue = false;
        field.values.forEach((value, index) => {
          const operation = field.currentCondition.operations[index];
          if (
            value !== null &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0)
          ) {
            if (operation.prefix) {
              value = operation.prefix + value;
            }
            if (operation.suffix) {
              value += operation.suffix;
            }
            expressions[operation.operator] = value;
            hasValue = true;
          }
        });
        if (hasValue) {
          queries.push(fieldQuery);
        }
      });
      if (queries.length === 0) {
        queries = undefined;
      }
      if (!isEqual(this.props.q, queries)) {
        this.props.onSearch(queries);
      }
    }
  };

  handleReset = () => {
    this.setState({
      fields: this.state.fields.map(field =>
        update(field, {
          values: { $set: new Array(field.values.length).fill(null) }
        })
      )
    });
    this.props.form.resetFields();
  };

  render(): React.ReactNode {
    return (
      <div className={styles.advancedSearch}>
        <Form
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
  name: "advanced_search"
})(AdvancedSearchForm);
