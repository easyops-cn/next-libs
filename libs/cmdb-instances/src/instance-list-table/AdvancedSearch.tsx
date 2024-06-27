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
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { getRuntime } from "@next-core/brick-kit";
import {
  ComparisonOperators,
  ElementOperators,
  forEachAvailableFields,
  getInstanceNameKeys,
  LogicalOperators,
  Query,
  QueryOperatorExpressions,
  RelationIdKeys,
  RelationNameKeys,
  RelationObjectIdKeys,
} from "@next-libs/cmdb-utils";
import { clusterMap } from "./constants";
import styles from "./AdvancedSearch.module.css";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import {
  FormControlTypeEnum,
  ModelAttributeFormControl,
  ModelAttributeValueType,
  ModelAttributeValueModeType,
} from "../model-attribute-form-control/ModelAttributeFormControl";
import {
  processAttrValueWithQuote,
  ENABLED_CMDB_ADVANCE_SEARCH_WITH_QUOTE,
  isAgentStatus,
} from "../processors";

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
    ConditionType.Equal,
    ConditionType.NotEqual,
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
    ConditionType.Empty,
    ConditionType.NotEmpty,
  ],
};

const AgentStatusConditionType: ConditionType[] = [
  ConditionType.Equal,
  ConditionType.NotEqual,
];
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

export function getCondition(
  conditionType: ConditionType,
  fieldType: ModelAttributeValueType
): Condition {
  let label: string;
  let operations: ConditionOperation[];

  switch (conditionType) {
    case ConditionType.Equal:
      label = i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_EQUAL_DEFINE}`);
      switch (fieldType) {
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
              operator: ComparisonOperators.Equal,
            },
          ];
      }
      break;
    case ConditionType.NotEqual:
      label = i18n.t(
        `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_NOT_EQUAL_DEFINE}`
      );
      switch (fieldType) {
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
              operator: ComparisonOperators.NotEqual,
            },
          ];
      }
      break;
    case ConditionType.Contain:
      label = i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_CONTAIN_DEFINE}`);
      switch (fieldType) {
        case ModelAttributeValueType.ENUMS:
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
      label = i18n.t(
        `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_NOT_CONTAIN_DEFINE}`
      );
      switch (fieldType) {
        case ModelAttributeValueType.ENUMS:
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
      label = i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_IS_EMPTY_DEFINE}`);
      operations = [
        {
          operator: ElementOperators.Exists,
          fixedValue: false,
        },
      ];
      break;
    case ConditionType.NotEmpty:
      label = i18n.t(
        `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_IS_NOT_EMPTY_DEFINE}`
      );
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
          // label = "在此区间";
          label = i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_BETWEEN_DEFINE_TEXT_INT}`
          );
          break;
        case ModelAttributeValueType.DATE:
        case ModelAttributeValueType.DATETIME:
          // label = "在此期间";
          label = i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_BETWEEN_DEFINE_TEXT_TIME}`
          );
          break;
        case ModelAttributeValueType.IP:
          // label = "范围";
          label = i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_BETWEEN_DEFINE_TEXT}`
          );
          break;
        default:
          // label = "在此之间";
          label = i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_BETWEEN_DEFINE_TEXT_THE}`
          );
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
        // undefined 后台可剔除
        return isNaN(parseInt(value)) ? undefined : parseInt(value);
      case ModelAttributeValueType.FLOAT:
        return isNaN(parseFloat(value)) ? undefined : parseFloat(value);
      case ModelAttributeValueType.BOOLEAN:
        return value === "true";
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
  objectId?: string,
  attrId?: string
) {
  // let isRelationWithNoExpression = false;
  // 针对主机的 agent状态，暂不支持 为空/不为空的筛选，将特殊处理
  let expressions = fieldQueryOperatorExpressionsMap[id];
  let expressionsKeys: string[];
  if (!expressions && isRelation) {
    // isRelationWithNoExpression = true;
    const relatedKey = findKey(
      fieldQueryOperatorExpressionsMap,
      (v, k) => startsWith(k, `${relationSideId}.`) || k === relationSideId
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
    expressionsKeys = Object.keys(expressions);
  }
  let currentCondition: Condition;
  const fieldConditionType =
    isAgentStatus(objectId, id) && valueType === ModelAttributeValueType.ENUM
      ? AgentStatusConditionType
      : FieldTypeConditionTypesMap[valueType];
  const availableConditions = fieldConditionType.map((conditionType) => {
    const condition = getCondition(conditionType, valueType);

    if (expressionsKeys?.length) {
      const operatorsStr: string[] = [];
      // 由于当 ConditionType.Between ，operations 有两个，当用户只填选一个时，currentCondition会默认第一个选择器。与实际不符
      const isFixedValueEqual = condition.operations.every((operation) => {
        operatorsStr.push(operation.operator);

        if (operation.fixedValue !== undefined) {
          return (
            operation.fixedValue?.toString() ===
            expressions[operation?.operator]?.toString()
          );
        } else {
          return true;
        }
      });
      if (
        isFixedValueEqual &&
        expressionsKeys.every((operator) => operatorsStr.includes(operator))
      ) {
        currentCondition = condition;
      }
    }

    return condition;
  });
  if (!currentCondition) {
    currentCondition = availableConditions[0];
  }
  let queryValuesStr = "";
  const values = currentCondition.operations.map((operation) => {
    let value: any;
    // istanbul ignore else ElementOperators.Exists时直接返回fixedValue
    if (
      expressions?.[operation.operator] !== undefined &&
      operation.operator !== ElementOperators.Exists
    ) {
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
            .map((value: string) => convertValue(valueType, value))
            .filter((value: any) => !isNil(value));
          if (objectId === "CLUSTER" && attrId === "type") {
            values = values.map((value) => clusterMap[value]);
          }
        }
      }
      if (
        typeof values[0] === "string" ||
        typeof values[0] === "number" ||
        typeof values[0] === "boolean"
      ) {
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
        value = [
          ModelAttributeValueType.ENUM,
          ModelAttributeValueType.ARR,
        ].includes(valueType)
          ? values
          : values.join(" ");
      }
    } else {
      value = operation.fixedValue !== undefined ? operation.fixedValue : null;
    }

    return value;
  });
  const disabled = false;
  return {
    availableConditions,
    currentCondition,
    values,
    queryValuesStr,
    disabled,
  };
}

export interface Field {
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
  autoSearch?: (fields: Field[]) => void;
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
            // 由于  ConditionType.Between 这边的 operator 是两个，由于需要支持选择一个的时候也要显示出来，这边不能将选择器合并成str吐出去
            const compareOperators = Object.keys(firstSubQuery[fieldId]);
            const compareOperator =
              compareOperators.length > 1
                ? compareOperators
                : compareOperators.join("");
            let subQueryValue = "";
            let targetField;
            if (ENABLED_CMDB_ADVANCE_SEARCH_WITH_QUOTE) {
              targetField = this.props.fieldToShow?.find(
                (fieldItem) => Object.keys(fieldItem)[0] === fieldId
              );
            }
            if (!isNil(targetField)) {
              // 二维数组会有问题，
              subQueryValue = isArray(targetField[fieldId])
                ? targetField[fieldId]
                    .map((item) => (isArray(item) ? item.join(" ") : item))
                    .join("")
                : (targetField[fieldId] as any);
            } else {
              subQueryValue = (expressions as Query[])
                .map((query) => {
                  const targetValue = (
                    query[fieldId] as Record<ComparisonOperators, any>
                  )[compareOperator as ComparisonOperators];
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
                  }
                  // 对于时间选择器有两个的，不用特意将值转换成str，因为不需要这里的值
                  else {
                    return isString(targetValue) && targetValue.includes(" ")
                      ? `"${targetValue}"`
                      : targetValue;
                  }
                })
                .join(" ");
            }
            key = fieldId;
            expressions = Array.isArray(compareOperator)
              ? firstSubQuery[fieldId]
              : {
                  [compareOperator]: subQueryValue,
                };
          }

          fieldQueryOperatorExpressionsMap[key] =
            expressions as QueryOperatorExpressions;
        });
      });
    }
    forEachAvailableFields(
      this.props.modelData,
      (attr) => {
        const attrValue: Partial<CmdbModels.ModelObjectAttrValue> & {
          isStruct?: boolean;
        } & { isClusterType?: boolean } = {};
        const attrValueType: any = attr.value.type;
        switch (attrValueType) {
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
            attrValue.mode = attr.value.mode;
            break;
          default:
            attrValue.type = attr.value.type;
        }

        fields.push({
          id: `_${attr.id}`,
          name: attr.name,
          attrValue,
          isRelation: false,
          ...getFieldConditionsAndValues(
            fieldQueryOperatorExpressionsMap,
            attr.id,
            attr.value.type as ModelAttributeValueType,
            false,
            "",
            this.props.modelData.objectId
          ),
        });
      },
      (relation, sides) => {
        const relationObject =
          this.props.idObjectMap[
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
            id: `_${id}`,
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
              this.props.modelData.objectId
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
      const relatedCondition = relatedField.availableConditions.find(
        (condition) => condition.type === value
      );
      if (condition.operations[0].operator === ElementOperators.Exists) {
        newFields = update(newFields, {
          [relatedFieldIndex]: {
            currentCondition: { $set: relatedCondition },
            values: {
              $set: [null],
            },
          },
        });
      } else if (
        relatedField.currentCondition.operations[0].operator ===
        ElementOperators.Exists
      ) {
        newFields = update(newFields, {
          [relatedFieldIndex]: {
            currentCondition: { $set: relatedField.availableConditions[0] },
            values: {
              $set: [null],
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
      const isBetween: boolean =
        field.currentCondition.type === ConditionType.Between;
      switch (field.attrValue.type) {
        case ModelAttributeValueType.INTEGER:
        case ModelAttributeValueType.FLOAT:
          attrValue = {
            type: isBetween
              ? ModelAttributeValueType.INTEGER
              : ModelAttributeValueType.STRING,
          };
          break;
        case ModelAttributeValueType.ENUM:
        case ModelAttributeValueType.ENUMS:
          if (
            getRuntime().getFeatureFlags()["cmdb-use-tree-enum-attr"] &&
            (field.attrValue.mode as any) ===
              ModelAttributeValueModeType.CASCADE
          ) {
            // istanbul ignore next
            type = FormControlTypeEnum.TREESELECT;
          } else {
            type = FormControlTypeEnum.SELECT;
          }
          multiSelect = true;
          break;
        case ModelAttributeValueType.DATETIME:
          style = { minWidth: "auto" };
          break;
      }
      //高级搜索这里即使是json格式，也用input输入框进行搜索
      if ((attrValue as any).type === "json") {
        attrValue = { ...attrValue, type: "str" };
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
                          objectId={this.props.modelData.objectId}
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
    const fields = this.state.fields.map((v) => ({ ...v, id: v.id.slice(1) }));
    if (this.props?.autoSearch) this.props.autoSearch(fields);
    if (this.props.onSearch) {
      // 当过滤字段为relation并且过滤条件为ElementOperators.Exists的时候，发起后台请求的搜索queries与负责前端展示的query不同。需要额外处理。
      let queries: Query[] = [];
      let queriesToShow: Query[] = [];
      const fieldToShow: Record<string, any[]>[] = [];
      fields.forEach((field) => {
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
              if (
                field.attrValue.type === ModelAttributeValueType.ENUM ||
                field.attrValue.type === ModelAttributeValueType.ARR
              ) {
                values = value;
              } else if (typeof value === "string") {
                if (
                  !ENABLED_CMDB_ADVANCE_SEARCH_WITH_QUOTE ||
                  !value.includes('"')
                ) {
                  values = value
                    .trim()
                    .split(/\s+/)
                    .map((value) => convertValue(field.attrValue.type, value))
                    .filter((value) => !isNil(value));
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
    if (this.props.autoSearch) this.props.autoSearch([]);
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
                {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SEARCH}`)}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={this.handleReset}
                data-testid="reset-button"
              >
                {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.RESET}`)}
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
