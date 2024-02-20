import React from "react";
import { debounce, remove, without, get, isEmpty } from "lodash";
import { extraFieldAttrs } from "./constants";
import { Checkbox, Col, Divider, Input, Row } from "antd";
import {
  getBatchEditableFields,
  CMDB_RESOURCE_FIELDS_SETTINGS,
} from "@next-libs/cmdb-utils";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
export interface DisplaySettingsProps {
  currentFields: string[];
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  objectId?: string;
  extraDisabledField?: string;
  extraDisabledFields?: string[];
  onChange?(fields: string[]): void;
}

interface DisplaySettingsState {
  nextFields: string[];
  q: string;
  filteredList: any;
  extraDisabledFieldSet: Set<string>;
  selectAllFields: boolean;
  allFieldsLength: number;
}

export class DisplaySettings extends React.Component<
  DisplaySettingsProps,
  DisplaySettingsState
> {
  debounceHandleSearch: () => void;
  attrAndRelationList: { id: string; name: string }[] = [];

  constructor(props: DisplaySettingsProps) {
    super(props);
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
    this.state = {
      nextFields,
      q: "",
      filteredList: this.attrAndRelationList,
      extraDisabledFieldSet: new Set(props.extraDisabledFields),
      selectAllFields: [...new Set([...nextFields])].length === allFieldsLength,
      allFieldsLength,
    };
    this.debounceHandleSearch = debounce(this.filterColTag, 300);
  }

  componentDidUpdate(prevProps: DisplaySettingsProps) {
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

  handleChecked(event: any, attr: any) {
    const fieldsKey = "nextFields";
    const fields = event.target.checked
      ? this.state[fieldsKey].concat(attr.id)
      : without(this.state[fieldsKey], attr.id);

    this.setState({
      [fieldsKey]: fields,
      selectAllFields: fields.length === this.state.allFieldsLength,
    });
    this.props.onChange?.(fields);
  }

  handleSelectAllFields(event: any, allFields: any[]) {
    const fieldsKey = "nextFields";
    const fields = event.target.checked ? allFields.map((attr) => attr.id) : [];
    this.setState({
      [fieldsKey]: fields,
      selectAllFields: event.target.checked,
    });
    this.props.onChange?.(fields);
  }

  renderCheckbox(attr: any, field: "nextFields" | "otherFields") {
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
          onChange={(event) => this.handleChecked(event, attr)}
          data-testid={`${attr.id}-checkbox`}
        >
          {attr.name}
        </Checkbox>
      </Col>
    );
  }

  filterColTag = () => {
    let filteredList = this.attrAndRelationList;
    const q = this.state.q.trim().toLowerCase();
    if (q) {
      filteredList = filteredList.filter((attr) => {
        return attr.name.toLowerCase().includes(q);
      });
    }
    this.setState({
      filteredList,
    });
  };

  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    this.setState({
      q: value,
    });
    this.debounceHandleSearch();
  };

  render() {
    const filteredList = this.state.filteredList;
    const extraAttrIds = extraFieldAttrs.map(
      (extraFieldAttr) => extraFieldAttr.id
    );
    const attrs = filteredList.filter(
      (attr: any) => !extraAttrIds.includes(attr.id)
    );
    const extraAttrs = filteredList.filter((attr: any) =>
      extraAttrIds.includes(attr.id)
    );

    return (
      <>
        <Divider orientation="left" plain style={{ marginTop: 0 }}>
          {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.FIELD_SETTINGS}`)}
        </Divider>
        <div>
          <Input.Search
            value={this.state.q}
            placeholder={i18n.t(
              `${NS_LIBS_CMDB_INSTANCES}:${K.SEARCH_BY_FIELD_NAME}`
            )}
            onChange={this.handleSearchChange}
            style={{ width: 200 }}
            data-testid="search-input"
          />

          <span style={{ paddingLeft: 15, verticalAlign: "sub" }}>
            <Checkbox
              checked={this.state.selectAllFields}
              onChange={(e) =>
                this.handleSelectAllFields(e, [...attrs, ...extraAttrs])
              }
              data-testid={`checkbox-select-all`}
            >
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SELECT_ALL}`)}
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
          <Row>
            {attrs.map((attr: any) => this.renderCheckbox(attr, "nextFields"))}
            {extraAttrs.length > 0 ? (
              <>
                <Divider />
                {extraAttrs.map((attr: any) =>
                  this.renderCheckbox(attr, "nextFields")
                )}
              </>
            ) : null}
          </Row>
        </div>
      </>
    );
  }
}
