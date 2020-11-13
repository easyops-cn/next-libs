import React from "react";
import { debounce, isEqual, remove, without, get, isEmpty } from "lodash";
import { extraFieldAttrs, otherFieldIds } from "./constants";
import { Button, Checkbox, Col, Divider, Input, Row, Typography } from "antd";
import {
  getBatchEditableRelations,
  CMDB_RESOURCE_FIELDS_SETTINGS,
} from "@libs/cmdb-utils";
import { CmdbModels } from "@sdk/cmdb-sdk";

interface SettingsProps {
  title?: string;
  currentFields: string[];
  defaultFields?: string[];
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  onHideSettings: () => void;
  objectId?: string;
  onHandleConfirm: (attrIds: string[]) => void;
  onHandleReset: (fields: string[]) => void;
}

interface SettingsState {
  nextFields: string[];
  q: string;
  filterList: any;
}

export class Settings extends React.Component<SettingsProps, SettingsState> {
  debounceHandleSearch: () => void;
  attrAndRelationList: { id: string; name: string }[] = [];

  constructor(props: SettingsProps) {
    super(props);
    this.handleChecked = this.handleChecked.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);

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
      filterList: this.attrAndRelationList,
    };
    this.debounceHandleSearch = debounce(this.filterColTag, 300);
  }

  handleChecked(event: any, attr: any) {
    const fieldsKey = "nextFields";
    if (event.target.checked) {
      // eslint-disable-next-line
      // @ts-ignore
      this.setState({ [fieldsKey]: this.state[fieldsKey].concat(attr.id) });
    } else {
      // eslint-disable-next-line
      // @ts-ignore
      this.setState({ [fieldsKey]: without(this.state[fieldsKey], attr.id) });
    }
  }

  renderCheckbox(attr: any, field: "nextFields" | "otherFields") {
    const fieldsKey = "nextFields";
    const checked = this.state[fieldsKey].includes(attr.id);

    return (
      <Col key={attr.id} span={8} style={{ padding: 5 }}>
        <Checkbox
          name={field}
          style={{ width: "100%" }}
          checked={checked}
          onChange={(event) => this.handleChecked(event, attr)}
        >
          {attr.name}
        </Checkbox>
      </Col>
    );
  }

  handleReset = () => {
    if (!isEqual(this.props.defaultFields, this.state.nextFields)) {
      this.setState({ nextFields: this.props.defaultFields.slice() });
    }
    this.props.onHideSettings();
    this.props.onHandleReset(this.props.defaultFields);
  };

  filterColTag = () => {
    let filterList = this.attrAndRelationList;
    const q = this.state.q.trim().toLowerCase();
    if (q) {
      filterList = filterList.filter((attr) => {
        return attr.name.toLowerCase().includes(q);
      });
    }
    this.setState({
      filterList,
    });
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    this.setState({
      q: value,
    });
    this.debounceHandleSearch();
  };

  handleCancel = () => {
    this.props.onHideSettings();
  };

  handleConfirm = () => {
    this.props.onHideSettings();
    this.props.onHandleConfirm(this.state.nextFields);
  };

  render() {
    const { title } = this.props;
    const filterList = this.state.filterList;
    const count = this.state.nextFields.length;
    const extraAttrIds = extraFieldAttrs.map(
      (extraFieldAttr) => extraFieldAttr.id
    );
    const attrs = filterList.filter(
      (attr: any) => !extraAttrIds.includes(attr.id)
    );
    const extraAttrs = filterList.filter((attr: any) =>
      extraAttrIds.includes(attr.id)
    );

    return (
      <>
        <Typography.Title level={5}>{title}</Typography.Title>
        <Divider orientation="left" plain>
          字段设置
        </Divider>
        <div>
          <Input.Search
            value={this.state.q}
            placeholder="按字段名称搜索"
            onChange={this.handleChange}
            style={{ width: 200 }}
          />
        </div>
        <Row
          style={{
            marginTop: 15,
            height: 200,
            overflow: "auto",
          }}
          className="nextFields"
        >
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
        <Divider style={{ marginBottom: 15 }} />
        <div style={{ display: "flex" }}>
          <div>
            <Button type="default" onClick={this.handleReset}>
              恢复默认
            </Button>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Button
              type="default"
              onClick={this.handleCancel}
              style={{ marginRight: 10 }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={this.handleConfirm}
              disabled={count === 0}
            >
              确定
            </Button>
          </div>
        </div>
      </>
    );
  }
}
