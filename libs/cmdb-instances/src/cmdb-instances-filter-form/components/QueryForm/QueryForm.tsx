import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Col, Row, Select, InputNumber, Input, Button } from "antd";
import { get, isNil, omit, uniq } from "lodash";
import { ModifiedModelCmdbObject } from "@next-libs/cmdb-utils";
import { CmdbModels } from "@next-sdk/cmdb-sdk";

import {
  convertQueryToConditions,
  convertConditionsToQuery,
  convertQueryToAdvancedQuery,
} from "../../utils/query";
import { QueryCondition } from "../../interfaces";
import {
  QueryOperatorValue,
  AttrValueType,
  AttrOperatorMap,
} from "../../constants/query";
import { NS_LIBS_CMDB_INSTANCES, K } from "../../../i18n/constants";
import { ModelAttributeFormControl } from "../../../model-attribute-form-control/ModelAttributeFormControl";
import { InstanceListModal } from "../../../instance-list-modal/InstanceListModal";
import style from "./style.module.css";

interface QueryFormProps {
  objectMap: { [objectId: string]: Partial<CmdbModels.ModelCmdbObject> };
  objectData: Partial<ModifiedModelCmdbObject>;
  query: any;
  onChange: (query: any) => void;
  searchDisabled?: boolean;
  advancedSearchDisabled?: boolean;
  hideSearchConditions?: boolean;
  ipCopy?: boolean;
}

export function QueryForm(props: QueryFormProps): React.ReactElement {
  const { t } = useTranslation(NS_LIBS_CMDB_INSTANCES);
  const [query, setQuery] = useState(props.query || {});
  const [queryConditions, setQueryConditions] = useState(
    convertQueryToConditions(props.objectMap, props.objectData, props.query) ||
      []
  );
  const [instancesModalProps, setInstancesModalProps] = useState({
    visible: false,
  });
  const fieldOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [];

    const defaultKey =
      props.objectData.objectId === "HOST" ? "hostname" : "name";
    props.objectData.__fieldList.forEach((field) => {
      if (field.__isRelation) {
        const relatedObjectId = field.right_object_id;
        const showKeys: string[] = get(
          props.objectMap[relatedObjectId],
          "view.show_key"
        ) || [defaultKey];

        uniq(showKeys).forEach((showKey) => {
          const attr = props.objectMap[relatedObjectId].attrList.find(
            (attr) => attr.id === showKey
          );
          const label = attr ? `${field.right_description}(${attr.name})` : "";
          attr && options.push({ label, value: `${field.__id}.${showKey}` });
        });
      } else {
        options.push({
          label: field.name,
          value: field.__id,
        });
      }
    });

    return options;
  }, [
    props.objectData.__fieldList,
    props.objectData.objectId,
    props.objectMap,
  ]);

  useEffect(() => {
    setQuery(props.query);
    setQueryConditions(
      convertQueryToConditions(
        props.objectMap,
        props.objectData,
        props.query
      ) || []
    );
  }, [props.objectData, props.objectMap, props.query]);

  const openInstancesModal = (): void => {
    setInstancesModalProps({ visible: true });
  };

  const closeInstancesModal = (): void => {
    setInstancesModalProps({ visible: false });
  };

  const validateQuery = (queryConditions: QueryCondition[]) => {
    return queryConditions.every(
      (queryCondition) =>
        queryCondition.fieldId &&
        queryCondition.operator &&
        ([QueryOperatorValue.Empty, QueryOperatorValue.NotEmpty].includes(
          queryCondition.operator
        ) ||
          (!isNil(queryCondition.value) &&
            queryCondition.value !== "" &&
            queryCondition.value !== "%%")) &&
        (queryCondition.operator !== QueryOperatorValue.Between ||
          (Array.isArray(queryCondition.value) &&
            ((!isNil(queryCondition.value[0]) &&
              queryCondition.value[0] !== "") ||
              (!isNil(queryCondition.value[1]) &&
                queryCondition.value[1] !== ""))))
    );
  };
  const validQuery = useMemo(
    () => validateQuery(queryConditions),
    [queryConditions]
  );

  const triggerChange = (queryConditions: QueryCondition[]) => {
    if (props.onChange && validateQuery(queryConditions)) {
      const query = convertConditionsToQuery(
        props.objectData.__fieldList,
        queryConditions
      );
      setQuery(query);
      props.onChange(query);
    }
  };

  const fieldIdSelected = (index: number, fieldId: string) => {
    queryConditions[index] = {
      fieldId,
    };
    const newQueryConditions = [...queryConditions];
    setQueryConditions(newQueryConditions);
    triggerChange(newQueryConditions);
  };

  const operatorSelected = (index: number, operator: QueryOperatorValue) => {
    queryConditions[index] = {
      fieldId: queryConditions[index].fieldId,
      operator,
    };
    queryConditions[index].value = undefined;
    const newQueryConditions = [...queryConditions];
    setQueryConditions(newQueryConditions);
    triggerChange(newQueryConditions);
  };

  const fieldValueChanged = (index: number, value: any) => {
    queryConditions[index].value = value;
    const newQueryConditions = [...queryConditions];
    setQueryConditions(newQueryConditions);
    triggerChange(newQueryConditions);
  };

  const addQueryCondition = () => {
    const newQueryConditions = [...queryConditions, {}];
    setQueryConditions(newQueryConditions);
    triggerChange(newQueryConditions);
  };

  const removeQueryCondition = (index: number) => {
    queryConditions.splice(index, 1);
    const newQueryConditions = [...queryConditions];
    setQueryConditions(newQueryConditions);
    triggerChange(newQueryConditions);
  };

  const renderFieldIdSelect = (
    index: number,
    queryCondition: QueryCondition
  ) => {
    const options = [];

    const defaultKey =
      props.objectData.objectId === "HOST" ? "hostname" : "name";
    props.objectData.__fieldList.forEach((field) => {
      if (field.__isRelation) {
        const relatedObjectId = field.right_object_id;
        const showKeys: string[] = get(
          props.objectMap[relatedObjectId],
          "view.show_key"
        ) || [defaultKey];

        uniq(showKeys).forEach((showKey) => {
          const attr = props.objectMap[relatedObjectId].attrList.find(
            (attr) => attr.id === showKey
          );
          const label = attr ? `${field.right_description}(${attr.name})` : "";
          attr &&
            options.push(
              <Select.Option
                key={`${field.__id}.${showKey}`}
                value={`${field.__id}.${showKey}`}
                title={label}
              >
                {label}
              </Select.Option>
            );
        });
      } else {
        options.push(
          <Select.Option key={field.__id} value={field.__id} title={field.name}>
            {field.name}
          </Select.Option>
        );
      }
    });

    return (
      <Select
        options={fieldOptions}
        className={style.fieldIdSelect}
        showSearch
        dropdownMatchSelectWidth={false}
        filterOption={(input, option) =>
          (option.label as string).toLowerCase().indexOf(input.toLowerCase()) >=
          0
        }
        onSelect={(value: any) => fieldIdSelected(index, value)}
        value={queryCondition.fieldId}
        data-testid={`field-select-${index}`}
      />
    );
  };

  const getField = (fieldId: string) => {
    fieldId = fieldId.split(".")[0];
    return props.objectData.__fieldList.find((field) => field.__id === fieldId);
  };

  const renderOperatorSelect = (
    index: number,
    queryCondition: QueryCondition
  ) => {
    const field = getField(queryCondition.fieldId);
    if (!field) return null;

    // TODO(Cyril): RelationOperator
    const operatorList =
      field.__isRelation === false
        ? AttrOperatorMap[field.value.type as AttrValueType]
        : AttrOperatorMap.FK;
    return (
      <Select
        className={style.operatorSelect}
        onSelect={(value: any) => operatorSelected(index, value)}
        value={queryCondition.operator}
        data-testid={`operator-select-${index}`}
      >
        {operatorList.map((operator) => {
          let label: string = operator.label;
          if (operator.value === QueryOperatorValue.Between) {
            if (field.__isRelation === false) {
              switch (field.value.type) {
                case AttrValueType.Int:
                case AttrValueType.Float:
                  label = t(K.OPERATOR_BETWEEN_DEFINE_TEXT_INT);
                  break;
                case AttrValueType.Date:
                case AttrValueType.Datetime:
                  label = t(K.OPERATOR_BETWEEN_DEFINE_TEXT_TIME);
                  break;
                case AttrValueType.Ip:
                  label = operator.label;
                  break;
                default:
                  label = t(K.OPERATOR_BETWEEN_DEFINE_TEXT_THE);
              }
            }
          }
          return (
            <Select.Option key={operator.value} value={operator.value}>
              {label}
            </Select.Option>
          );
        })}
      </Select>
    );
  };

  const renderValueInput = (index: number, queryCondition: QueryCondition) => {
    const field = getField(queryCondition.fieldId);
    let input: React.ReactElement;

    if (field.__isRelation) {
      input = (
        <Input
          className={style.valueInput}
          value={queryCondition.value}
          onChange={(event: any) =>
            fieldValueChanged(index, event.target.value)
          }
          data-testid={`value-input-${index}`}
        />
      );
    } else if (field.__isRelation === false) {
      const attr = omit(field, "readonly");

      if (queryCondition.operator === QueryOperatorValue.Between) {
        let value0: string;
        let value1: string;

        if (Array.isArray(queryCondition.value)) {
          value0 = queryCondition.value[0];
          value1 = queryCondition.value[1];
        }

        input = (
          <div style={{ display: "flex" }}>
            <ModelAttributeFormControl
              attribute={attr}
              className={style.valueInput}
              style={{
                minWidth: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              value={value0}
              onChange={(value: any) =>
                fieldValueChanged(index, [value, value1])
              }
              data-testid={`value-input-${index}-0`}
            />
            <Input
              className={style.separatorInput}
              placeholder="~"
              style={{ borderRadius: 0 }}
              disabled
            />
            <ModelAttributeFormControl
              attribute={attr}
              className={style.valueInput}
              style={{
                minWidth: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              value={value1}
              onChange={(value: any) =>
                fieldValueChanged(index, [value0, value])
              }
              data-testid={`value-input-${index}-1`}
            />
          </div>
        );
      } else {
        input = (
          <ModelAttributeFormControl
            attribute={attr}
            onChange={(value: any) => fieldValueChanged(index, value)}
            className={style.valueInput}
            value={queryCondition.value}
            multiSelect
            isSupportMultiStringValue
            data-testid={`value-input-${index}`}
          />
        );
      }
    }

    return input;
  };

  return (
    <div>
      {queryConditions.map((queryCondition: QueryCondition, index: number) => (
        <div
          key={`${index}_${queryCondition.fieldId}`}
          className={style.queryCondition}
        >
          <Row gutter={12} className={style.queryConditionInput}>
            <Col span={6}>{renderFieldIdSelect(index, queryCondition)}</Col>
            <Col span={6}>
              {queryCondition.fieldId
                ? renderOperatorSelect(index, queryCondition)
                : null}
            </Col>
            <Col span={12}>
              {queryCondition.fieldId &&
              queryCondition.operator &&
              ![QueryOperatorValue.Empty, QueryOperatorValue.NotEmpty].includes(
                queryCondition.operator
              )
                ? renderValueInput(index, queryCondition)
                : null}
            </Col>
          </Row>
          <MinusCircleOutlined
            className={style.queryConditionIcon}
            onClick={() => removeQueryCondition(index)}
            data-testid={`remove-button-${index}`}
          />
        </div>
      ))}
      <Row gutter={12} style={{ marginRight: 30 }}>
        <Col span={24}>
          <Button
            className={style.addButton}
            type="dashed"
            onClick={addQueryCondition}
            data-testid="add-button"
          >
            <PlusOutlined />
            {t(K.ADD)}
          </Button>
        </Col>
      </Row>
      <InstanceListModal
        objectMap={props.objectMap}
        objectId={props.objectData.objectId}
        visible={instancesModalProps.visible}
        title={t(K.TITLE_VIEW_SPECIFIC_EXAMPLE, {
          instance_title: props.objectData.name,
        })}
        // query={props.query}
        aq={query?.$and}
        selectDisabled={!props.ipCopy}
        ipCopy={props.ipCopy}
        sortDisabled={true}
        onCancel={closeInstancesModal}
        searchDisabled={props.searchDisabled}
        advancedSearchDisabled={props.advancedSearchDisabled}
        hideSearchConditions={props.hideSearchConditions}
        isInstanceFilterForm={true}
      />
      {validQuery ? (
        <a onClick={openInstancesModal}>{t(K.VIEW_SPECIFIC_EXAMPLE)}</a>
      ) : (
        <span className={style.disabledShowInstancesModalButton}>
          {t(K.VIEW_SPECIFIC_EXAMPLE)}
        </span>
      )}
    </div>
  );
}
