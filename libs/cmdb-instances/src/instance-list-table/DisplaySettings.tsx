import React from "react";
import {
  debounce,
  remove,
  without,
  get,
  isEmpty,
  groupBy,
  mapValues,
  uniq,
} from "lodash";
import { extraFieldAttrs } from "./constants";
import { Checkbox, Col, Divider, Input, Row, Tag } from "antd";
import {
  getBatchEditableFields,
  CMDB_RESOURCE_FIELDS_SETTINGS,
} from "@next-libs/cmdb-utils";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { WithTranslation, withTranslation } from "react-i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import styles from "./DisplaySettings.module.css";
import classNames from "classnames";
export interface DisplaySettingsProps {
  currentFields: string[];
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  objectId?: string;
  extraDisabledField?: string;
  extraDisabledFields?: string[];
  onChange?(fields: string[]): void;
}

export interface WithTranslationDisplaySettingsProps
  extends DisplaySettingsProps,
    WithTranslation {}

interface DisplaySettingsState {
  nextFields: string[];
  q: string;
  filteredList: any;
  extraDisabledFieldSet: Set<string>;
  selectAllFields: boolean;
  selectCategoryAllFieldsMap: Record<string, boolean>;
  allFieldsLength: number;
  type: AttributeType | string;
}

enum AttributeType {
  Attribute = "attribute",
  Relation = "relation",
  TransHierRelation = "transHierRelation",
}

export class LegacyDisplaySettings extends React.Component<
  WithTranslationDisplaySettingsProps,
  DisplaySettingsState
> {
  debounceHandleSearch: () => void;
  attrAndRelationList: {
    id: string;
    name: string;
    category: string;
    type: AttributeType;
  }[] = [];

  constructor(props: WithTranslationDisplaySettingsProps) {
    super(props);
    const { t } = props;
    const attrAndRelationList = getBatchEditableFields(this.props.modelData);
    let hideColumns = this.props.modelData.view.hide_columns || [];
    const ignoredFields = get(
      CMDB_RESOURCE_FIELDS_SETTINGS,
      `ignoredFields.${this.props.modelData.objectId}`,
      []
    );
    hideColumns = [...hideColumns, ...ignoredFields];

    if (!isEmpty(hideColumns)) {
      hideColumns.forEach((hideColumn: string) => {
        remove(attrAndRelationList, (attr) => attr.id === hideColumn);
      });
    }

    this.attrAndRelationList = attrAndRelationList.map((attribute: any) => ({
      id: attribute.id,
      name: attribute.name,
      type: attribute.isTransHierRelation
        ? AttributeType.TransHierRelation
        : attribute.isRelation
        ? AttributeType.Relation
        : AttributeType.Attribute,
      category: get(
        attribute,
        "tag[0]",
        get(attribute, "left_tags[0]") ||
          get(attribute, "tags[0]") ||
          t(K.OTHERS)
      ),
    }));

    const filteredList = this.attrAndRelationList;
    const extraAttrIds = extraFieldAttrs.map(
      (extraFieldAttr) => extraFieldAttr.id
    );
    const attrs = filteredList.filter(
      (attr: any) => !extraAttrIds.includes(attr.id)
    );
    const extraAttrs = filteredList.filter((attr: any) =>
      extraAttrIds.includes(attr.id)
    );
    const nextFields = props.currentFields ? props.currentFields.slice() : [];

    const allFieldsLength = [...attrs, ...extraAttrs].length;
    const selectAllFields =
      [...new Set([...nextFields])].length === allFieldsLength;

    const categoryOrders = this.getCAategoryOrders();
    const categoryMap = groupBy(attrs, "category");
    const selectCategoryAllFieldsMap: Record<string, boolean> = {};
    categoryOrders.reduce((acc, item) => {
      const categoryAttrIds = categoryMap[item]?.map((attr) => attr.id);
      acc[item] = selectAllFields
        ? selectAllFields
        : !!categoryAttrIds?.every((id) => nextFields.includes(id));
      return acc;
    }, selectCategoryAllFieldsMap);
    this.state = {
      nextFields,
      q: "",
      filteredList: this.attrAndRelationList,
      extraDisabledFieldSet: new Set(props.extraDisabledFields),
      selectAllFields,
      allFieldsLength,
      selectCategoryAllFieldsMap,
      type: "",
    };
    this.debounceHandleSearch = debounce(this.filterColTag, 300);
  }

  componentDidUpdate(prevProps: WithTranslationDisplaySettingsProps) {
    if (this.props.currentFields !== prevProps.currentFields) {
      this.setState({
        nextFields: this.props.currentFields
          ? this.props.currentFields.slice()
          : [],
      });
    }

    if (this.props.extraDisabledFields !== prevProps.extraDisabledFields) {
      this.setState({
        extraDisabledFieldSet: new Set(this.props.extraDisabledFields),
      });
    }
  }

  handleChecked(event: any, attr: any, categoryData?: any) {
    const fieldsKey = "nextFields";
    const { category, attrs } = categoryData ?? {};
    const fields = event.target.checked
      ? this.state[fieldsKey].concat(attr.id)
      : without(this.state[fieldsKey], attr.id);
    if (category) {
      const attrsIds = attrs.map((attr: any) => attr.id);
      this.setState({
        [fieldsKey]: fields,
        selectAllFields: fields.length === this.state.allFieldsLength,
        selectCategoryAllFieldsMap: {
          ...this.state.selectCategoryAllFieldsMap,
          [category]: attrsIds.every((id: string) => fields.includes(id)),
        },
      });
    } else {
      this.setState({
        [fieldsKey]: fields,
        selectAllFields: fields.length === this.state.allFieldsLength,
      });
    }

    this.props.onChange?.(fields);
  }

  handlecCategoryChecked(event: any, categoryData: any) {
    const checked = event.target.checked;
    const fieldsKey = "nextFields";
    const { category, attrs } = categoryData;
    const attrsIds = attrs.map((attr: any) => attr.id);
    const fields = [
      ...new Set([
        ...(checked
          ? this.state[fieldsKey].concat(attrsIds)
          : without(this.state[fieldsKey], ...attrsIds)),
      ]),
    ];
    this.setState({
      [fieldsKey]: fields,
      selectAllFields: fields.length === this.state.allFieldsLength,
      selectCategoryAllFieldsMap: {
        ...this.state.selectCategoryAllFieldsMap,
        [category]: checked,
      },
    });
    this.props.onChange?.(fields);
  }

  handleSelectAllFields(event: any, allFields: any[]) {
    const fieldsKey = "nextFields";
    const checked = event.target.checked;
    const fields = checked ? allFields.map((attr) => attr.id) : [];
    const realAllFieldsIds = allFields.map((attr) => attr.id);
    const finalFields = checked
      ? uniq(this.state[fieldsKey].concat(fields))
      : this.state[fieldsKey].filter(
          (id: string) => !realAllFieldsIds.includes(id)
        );
    this.setState({
      [fieldsKey]: finalFields,
      selectAllFields: event.target.checked,
      selectCategoryAllFieldsMap: mapValues(
        this.state.selectCategoryAllFieldsMap,
        () => checked
      ),
    });
    this.props.onChange?.(finalFields);
  }

  renderCheckbox(
    attr: any,
    field: "nextFields" | "otherFields",
    categoryData?: any
  ) {
    const fieldsKey = "nextFields";
    const checked = this.state[fieldsKey].includes(attr.id);
    const disabled =
      attr.id === this.props.extraDisabledField ||
      this.state.extraDisabledFieldSet.has(attr.id);
    return (
      <Col
        key={attr.id}
        span={8}
        style={{ padding: 5 }}
        onClick={(event) => event.stopPropagation()}
      >
        <Checkbox
          name={field}
          style={{
            width: "100%",
            wordBreak: "break-all",
          }}
          checked={checked}
          disabled={disabled}
          onChange={(event) => this.handleChecked(event, attr, categoryData)}
          data-testid={`${attr.id}-checkbox`}
        >
          {attr.name}
        </Checkbox>
      </Col>
    );
  }
  getCAategoryOrders = () => {
    const categoryOrders = [
      ...new Set([
        ...get(this.props.modelData, "view.attr_category_order", []),
        this.props.t(K.OTHERS),
      ]),
    ]; //分组排序
    return categoryOrders;
  };
  filterColTag = () => {
    let filteredList = this.attrAndRelationList;
    const q = this.state.q.trim().toLowerCase();
    const type = this.state.type;
    filteredList = filteredList.filter((attr) => {
      const qResult = attr.name.toLowerCase().includes(q);
      const typeResult = !this.state.type || attr.type === this.state.type;
      return qResult && typeResult;
    });

    const fieldsKey = "nextFields";
    const attrs = this.state[fieldsKey];
    const categoryOrders = this.getCAategoryOrders();
    const categoryMap = groupBy(filteredList, "category");
    const selectAllFields = attrs.length === this.state.allFieldsLength;
    const selectCategoryAllFieldsMap: Record<string, boolean> = {};
    categoryOrders.reduce((acc, item) => {
      const categoryAttrIds = categoryMap[item]?.map((attr) => attr.id);
      acc[item] = selectAllFields
        ? selectAllFields
        : !!categoryAttrIds?.every((id) => attrs.includes(id));
      return acc;
    }, selectCategoryAllFieldsMap);
    this.setState({
      filteredList,
      selectAllFields,
      selectCategoryAllFieldsMap,
    });
  };

  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    this.setState({
      q: value,
    });
    this.debounceHandleSearch();
  };
  handleFilterType = (type: AttributeType | string) => {
    this.setState({
      type,
    });
    this.debounceHandleSearch();
  };
  render() {
    const { t } = this.props;
    const filteredList = this.state.filteredList;
    const extraAttrIds = extraFieldAttrs.map(
      (extraFieldAttr) => extraFieldAttr.id
    );
    const attrs = filteredList.filter(
      (attr: any) => !extraAttrIds.includes(attr.id)
    );
    const categoryOrders = this.getCAategoryOrders();
    const categoryMap = groupBy(attrs, "category");
    const extraAttrs = filteredList.filter((attr: any) =>
      extraAttrIds.includes(attr.id)
    );
    const attributeTypeMap = {
      [AttributeType.Attribute]: t(K.ATTRIBUTES),
      [AttributeType.Relation]: t(K.RELATIONSHIPS),
      [AttributeType.TransHierRelation]: t(K.CROSS_LEVEL_RELATIONSHIPS),
    };

    return (
      <>
        {/* <Divider orientation="left" plain style={{ marginTop: 0 }}>
          {t(K.FIELD_SETTINGS)}
        </Divider> */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input.Search
            value={this.state.q}
            placeholder={t(K.SEARCH_BY_FIELD_NAME)}
            onChange={this.handleSearchChange}
            style={{ width: 200, paddingRight: 10 }}
            data-testid="search-input"
          />

          {Object.keys(attributeTypeMap).map((key) => (
            <Tag
              className={classNames(styles.fieldTypeTag, {
                [styles.fieldTypeActive]:
                  this.state.type === (key as AttributeType),
              })}
              key={key}
              onClick={() =>
                this.handleFilterType(
                  !this.state.type || this.state.type !== key
                    ? (key as AttributeType)
                    : ""
                )
              }
            >
              {attributeTypeMap[key as AttributeType]}
            </Tag>
          ))}

          <span style={{ paddingLeft: 15, verticalAlign: "sub" }}>
            <Checkbox
              checked={this.state.selectAllFields}
              onChange={(e) =>
                this.handleSelectAllFields(e, [...attrs, ...extraAttrs])
              }
              data-testid={`checkbox-select-all`}
            >
              {t(K.SELECT_ALL)}
            </Checkbox>
          </span>
        </div>
        <div
          style={{
            marginTop: 15,
            maxHeight: 500,
            overflow: "auto",
          }}
          className="nextFields"
        >
          {categoryOrders?.map((category, index) => {
            const categoryAttrs = categoryMap?.[category] ?? [];
            return categoryAttrs.length > 0 ? (
              <div
                style={{
                  marginBottom: index === categoryOrders.length - 1 ? 0 : 15,
                }}
              >
                <Checkbox
                  checked={this.state.selectCategoryAllFieldsMap[category]}
                  onChange={(e) => {
                    this.handlecCategoryChecked(e, {
                      category,
                      attrs: categoryAttrs,
                    });
                  }}
                >
                  {category}
                </Checkbox>
                <Row style={{ padding: "12px 12px 0px 12px" }}>
                  {categoryAttrs.map((attr: any) =>
                    this.renderCheckbox(attr, "nextFields", {
                      category,
                      attrs: categoryAttrs,
                    })
                  )}
                </Row>
              </div>
            ) : null;
          })}
          {extraAttrs.length > 0 ? (
            <Row>
              <Divider />
              {extraAttrs.map((attr: any) =>
                this.renderCheckbox(attr, "nextFields")
              )}
            </Row>
          ) : null}
        </div>
      </>
    );
  }
}

export const DisplaySettings = withTranslation(NS_LIBS_CMDB_INSTANCES)(
  LegacyDisplaySettings
);
