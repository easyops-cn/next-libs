import React, { FormEvent } from "react";
import update from "immutability-helper";
import { isEqual, isNil, isString, isArray, isEmpty } from "lodash";
import { Form } from "@ant-design/compatible";
import { Button, Col, Input, Row, Select } from "antd";
import { FormComponentProps } from "@ant-design/compatible/lib/form";
import {
  ComparisonOperators,
  LogicalOperators,
  Query,
  QueryOperatorExpressions,
} from "@next-libs/cmdb-utils";
import styles from "./DynamicSearch.module.css";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import {
  processAttrValueWithQuote,
  ENABLED_CMDB_ADVANCE_SEARCH_WITH_QUOTE,
} from "../processors";

export interface Field {
  id: string;
  name: string;
  values?: any[];
}

export interface DynamicSearchFormProps extends FormComponentProps {
  fields: Record<string, any>[];
  q?: Query[];
  onSearch?(
    queries: Query[],
    queriesToShow?: Query[],
    fieldToShow?: Record<string, any[]>[]
  ): void;
  fieldToShow?: Record<string, any[]>[]; // 回填高级搜索的field值（根据query回填丢失了引号信息）
}

export interface DynamicSearchFormState {
  fields: Field[];
}

export class DynamicSearchForm extends React.Component<
  DynamicSearchFormProps,
  DynamicSearchFormState
> {
  constructor(props: DynamicSearchFormProps) {
    super(props);

    this.state = this.computeState();
  }

  componentDidUpdate(prevProps: Readonly<DynamicSearchFormProps>): void {
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
    let fields: Field[] = [];
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

          fieldQueryOperatorExpressionsMap[key] =
            expressions as QueryOperatorExpressions;
        });
      });
    }
    if (this.props.fields) {
      fields = this.props.fields.map(
        (v) => ({ ...v, values: [null] } as Field)
      );
      if (!isEmpty(fieldQueryOperatorExpressionsMap)) {
        fields = this.props.fields.map((v) => {
          let str: any = null;
          if (fieldQueryOperatorExpressionsMap[v.id]) {
            const expressions = fieldQueryOperatorExpressionsMap[v.id]["$like"];
            str = expressions.replace(/%/g, "");
          }
          return {
            ...v,
            values: [str],
          } as Field;
        });
      }
    }
    return { fields };
  }

  setFormFieldValues(fields: Field[]): void {
    const values = fields.reduce<{ [key: string]: any }>((acc, field) => {
      acc[`${field.id}`] = field.values.join("");
      return acc;
    }, {});
    this.props.form.setFieldsValue(values);
  }

  onValueChange = (value: any, fieldIndex: number, valueIndex: number) => {
    this.setState({
      fields: update(this.state.fields, {
        [fieldIndex]: { values: { [valueIndex]: { $set: value } } },
      }),
    });
  };

  getFields() {
    const { getFieldDecorator } = this.props.form;
    return this.state.fields.map((field, fieldIndex) => {
      return (
        <Col span={12} key={field.id}>
          <Form.Item label={field.name}>
            {getFieldDecorator(`${field.id}`, {
              initialValue: field.values || "",
            })(
              <Input
                className={styles.conditionInput}
                addonBefore={i18n.t(
                  `${NS_LIBS_CMDB_INSTANCES}:${K.OPERATOR_CONTAIN_DEFINE}`
                )}
                placeholder={i18n.t(
                  `${NS_LIBS_CMDB_INSTANCES}:${K.ADVANCE_SEARCH_SINGLE_INPUT_PLACEHOLDER}`
                )}
                onChange={(e) => this.handleValueChange(e, fieldIndex)}
              />
            )}
          </Form.Item>
        </Col>
      );
    });
  }

  handleValueChange = (e: any, fieldIndex: number) => {
    this.onValueChange(e.target.value, fieldIndex, 0);
  };

  handleSearch = (e: FormEvent<any>): void => {
    e.preventDefault();
    if (this.props.onSearch) {
      let queries: Query[] = [];
      let queriesToShow: Query[] = [];
      const fieldToShow: Record<string, any[]>[] = [];
      this.state.fields.forEach((field) => {
        const expressions: QueryOperatorExpressions = {};
        const fieldId = field.id;
        let fieldQuery: Query = { [fieldId]: expressions };
        let fieldQueryToShow: Query = { [fieldId]: expressions };
        let hasValue = false;
        const operator = {
          comparisonOperator: ComparisonOperators.Like,
          logicalOperator: LogicalOperators.Or,
        };
        field.values.forEach((value) => {
          fieldQuery = { [field.id]: expressions };
          const fieldIdToShow = field.id;
          fieldQueryToShow = { [fieldIdToShow]: expressions };
          if (
            value !== null &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0)
          ) {
            let values: any[];
            if (typeof value === "string") {
              values = processAttrValueWithQuote(value, []);
            }
            if (values.length) {
              fieldQuery = {
                [operator.logicalOperator]: values.map((value) => {
                  return {
                    [fieldId]: {
                      [operator.comparisonOperator]: `%${value}%`,
                    },
                  };
                }),
              };
            }
            fieldQueryToShow = {
              [operator.logicalOperator]: values.map((value) => {
                return {
                  [fieldIdToShow]: {
                    [operator.comparisonOperator]: `%${value}%`,
                  },
                };
              }),
            };
            hasValue = true;
            fieldToShow.push({ [field.id]: field.values });
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
      <div className={styles.dynamicSearch}>
        <Form
          layout="vertical"
          className={styles.dynamicSearchForm}
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

export const DynamicSearch = Form.create<DynamicSearchFormProps>({
  name: "dynamic_search",
})(DynamicSearchForm);
