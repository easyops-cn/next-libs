import React from "react";
import { debounce, isEqual, remove, without, get, isEmpty } from "lodash";
import { extraFieldAttrs, otherFieldIds } from "./constants";
import { Button, Checkbox, Col, Input, Row, Typography } from "antd";
import {
  getBatchEditableRelations,
  CMDB_RESOURCE_FIELDS_SETTINGS
} from "@libs/cmdb-utils";
import { CmdbModels } from "@sdk/cmdb-sdk";

interface SettingsProps {
  title?: string;
  currentFields: string[];
  defaultFields?: string[];
  modelData: Partial<CmdbModels.ModelCmdbObject>;
  onHideSettings: () => void;
  onToggleAutoBreakLine?: (autoBreakLine: boolean) => void;
  options: { autoBreakLine: boolean };
  objectId?: string;
  onHandleConfirm: (attrIds: string[]) => void;
  onHandleReset: (fields: string[]) => void;
}

interface SettingsState {
  nextFields: string[];
  otherFields: any[];
  q: string;
  filterList: object[];
}

export class Settings extends React.Component<SettingsProps, SettingsState> {
  debounceHandleSearch: () => void;
  titleLineStyle: any;
  titleLineSpanStyle: any;
  otherAttrs: any[];
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
      ...relationList
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
        remove(attrAndRelationList, attr => attr.id === hideColumn);
      });
    }

    this.attrAndRelationList = attrAndRelationList.map((attribute: any) => ({
      id: attribute.id,
      name: attribute.name
    }));

    this.state = {
      nextFields: props.currentFields.slice(),
      otherFields: [],
      q: "",
      filterList: this.attrAndRelationList
    };
    this.debounceHandleSearch = debounce(this.filterColTag, 300);

    this.titleLineStyle = {
      height: "1px",
      borderTop: "1px solid #ddd",
      marginTop: "24px",
      marginBottom: "24px"
    };

    this.titleLineSpanStyle = {
      position: "relative",
      top: "-14px",
      fontSize: "16px",
      background: "#fff",
      paddingRight: "10px"
    };

    this.otherAttrs = [
      {
        id: otherFieldIds.autoBreakLine,
        name: "显示省略信息"
      }
    ];
    if (props.options.autoBreakLine) {
      this.state.otherFields.push(otherFieldIds.autoBreakLine);
    }
  }

  handleChecked(event: any, attr: any) {
    const fieldsKey = this.otherAttrs.map(attr => attr.id).includes(attr.id)
      ? "otherFields"
      : "nextFields";
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
    const fieldsKey = this.otherAttrs.map(attr => attr.id).includes(attr.id)
      ? "otherFields"
      : "nextFields";
    const checked = this.state[fieldsKey].includes(attr.id);

    return (
      <Col key={attr.id} span={8}>
        <Checkbox
          name={field}
          style={{ margin: 5 }}
          checked={checked}
          onChange={event => this.handleChecked(event, attr)}
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
      filterList = filterList.filter(attr => {
        return (
          attr.id.toLowerCase().includes(q) ||
          attr.name.toLowerCase().includes(q)
        );
      });
    }
    this.setState({
      filterList
    });
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    this.setState({
      q: value
    });
    this.debounceHandleSearch();
  };

  handleCancel = () => {
    this.props.onHideSettings();
  };

  handleConfirm = () => {
    this.props.onHideSettings();
    this.props.onHandleConfirm(this.state.nextFields);
    this.props.onToggleAutoBreakLine(
      this.state.otherFields.includes(otherFieldIds.autoBreakLine)
    );
  };

  render() {
    const { title } = this.props;
    const filterList = this.state.filterList;
    const count = this.state.nextFields.length;
    const extraAttrIds = extraFieldAttrs.map(
      extraFieldAttr => extraFieldAttr.id
    );
    const attrs = filterList.filter(
      (attr: any) => !extraAttrIds.includes(attr.id)
    );
    const extraAttrs = filterList.filter((attr: any) =>
      extraAttrIds.includes(attr.id)
    );

    return (
      <div>
        <Typography.Title level={4}>{title}</Typography.Title>
        <Row>
          <Row style={this.titleLineStyle}>
            <span style={this.titleLineSpanStyle}>字段设置</span>
          </Row>
          <Row>
            <Input.Search
              value={this.state.q}
              placeholder="按字段名称搜索"
              onChange={this.handleChange}
              style={{ width: 200 }}
            />
          </Row>
          <Row
            style={{
              marginTop: 15,
              marginBottom: 15,
              height: 200,
              overflow: "auto"
            }}
            className="nextFields"
          >
            {attrs.map((attr: any) => this.renderCheckbox(attr, "nextFields"))}
            {extraAttrs.length > 0 ? (
              <>
                <Col
                  span={24}
                  style={{ borderTop: "1px solid #e9e9e9", margin: "10px 0" }}
                />
                {extraAttrs.map(attr =>
                  this.renderCheckbox(attr, "nextFields")
                )}
              </>
            ) : null}
          </Row>
          <Row style={this.titleLineStyle}>
            <span style={this.titleLineSpanStyle}>其他设置</span>
          </Row>
          <Row>
            {this.otherAttrs.map(attr =>
              this.renderCheckbox(attr, "otherFields")
            )}
          </Row>
          <Row style={this.titleLineStyle}>
            <Col span={8}>
              <Button
                type="default"
                onClick={this.handleReset}
                style={{ marginTop: 15 }}
              >
                恢复默认
              </Button>
            </Col>
            <Col span={16}>
              <Row type="flex" justify="end">
                <Button
                  type="default"
                  onClick={this.handleCancel}
                  style={{ marginTop: 15, marginRight: 10 }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={this.handleConfirm}
                  disabled={count === 0}
                  style={{ marginTop: 15 }}
                >
                  确定
                </Button>
              </Row>
            </Col>
          </Row>
        </Row>
      </div>
    );
  }
}
