import React from "react";
import { debounce, remove, without, get, isEmpty } from "lodash";
import { extraFieldAttrs } from "./constants";
import { Checkbox, Col, Divider, Input, Row } from "antd";
import {
  getBatchEditableRelations,
  CMDB_RESOURCE_FIELDS_SETTINGS,
} from "@next-libs/cmdb-utils";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
export interface SettingsProps {
  currentFields: string[];
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  objectId?: string;
  extraDisabledField?: string;
  onChange?(fields: string[]): void;
}

interface SettingsState {
  nextFields: string[];
  q: string;
  filteredList: any;
}

export class Settings extends React.Component<SettingsProps, SettingsState> {
  debounceHandleSearch: () => void;
  attrAndRelationList: { id: string; name: string }[] = [];

  constructor(props: SettingsProps) {
    super(props);

    const relationList = getBatchEditableRelations(this.props.modelData);
    const attrAndRelationList = [
      ...this.props.modelData.attrList,
      ...relationList,
    ];

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

    this.state = {
      nextFields: props.currentFields.slice(),
      q: "",
      filteredList: this.attrAndRelationList,
    };
    this.debounceHandleSearch = debounce(this.filterColTag, 300);
  }

  componentDidUpdate(prevProps: SettingsProps) {
    if (this.props.currentFields !== prevProps.currentFields) {
      this.setState({ nextFields: this.props.currentFields.slice() });
    }
  }

  handleChecked(event: any, attr: any) {
    const fieldsKey = "nextFields";
    const fields = event.target.checked
      ? this.state[fieldsKey].concat(attr.id)
      : without(this.state[fieldsKey], attr.id);

    this.setState({ [fieldsKey]: fields });
    this.props.onChange?.(fields);
  }

  renderCheckbox(attr: any, field: "nextFields" | "otherFields") {
    const fieldsKey = "nextFields";
    const checked = this.state[fieldsKey].includes(attr.id);
    const disabled = attr.id === this.props.extraDisabledField;
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
        </div>
        <div
          style={{
            marginTop: 15,
            minHeight: 200,
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
