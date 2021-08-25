import React, { ChangeEvent } from "react";
import { DatePicker, Input, InputNumber, Modal, Radio, Select } from "antd";
import { Attribute, Structkey } from "./interfaces";
import { boolOptions } from "../model-attribute-form-control/ModelAttributeFormControl";
import styles from "./index.module.css";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import moment from "moment";
import { RadioChangeEvent } from "antd/lib/radio";
import { SelectValue } from "antd/lib/select";
import { computeDateFormat } from "../processors";
import _ from "lodash";
import { CodeEditor } from "@next-libs/code-editor-components";

export interface AddStructModalProps {
  structData?: any;
  attribute: Attribute;
  handleStoreFunction: Function; // eslint-disable-line
  handleCancelFunction: Function; // eslint-disable-line
  visible: boolean;
}
export interface AddStructModalState {
  structData?: any;
  // 格式是否匹配数组
  showError?: boolean[];
}

export class AddStructModal extends React.Component<
  AddStructModalProps,
  AddStructModalState
> {
  constructor(props: AddStructModalProps) {
    super(props);
    const { attribute } = props;
    this.state = {
      showError: new Array(attribute.value.struct_define.length).fill(false),
    };
  }
  componentDidUpdate(prevProps: AddStructModalProps) {
    if (prevProps.visible !== this.props.visible) {
      if (this.props.visible) {
        this.setState({ structData: this.props.structData || {} });
      }
    }
  }
  handleValueChange = (e: SelectValue, define: Structkey) => {
    const structData = this.state.structData;
    structData[define.id] = e;
    this.setState({ structData });
  };
  handleInputValueChange = (
    e:
      | RadioChangeEvent
      | ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
    define: any
  ) => {
    this.handleValueChange(e.target.value, define);
  };
  handleIpValueChange = (
    e: ChangeEvent<HTMLInputElement>,
    define: any,
    index: number
  ) => {
    const value = e.target.value;
    const { showError } = this.state;
    const matched =
      value === "" ||
      /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\[^\\],;\s]{1,100}\]|)$/.test(
        value
      );
    showError[index] = !matched;
    this.setState({
      showError,
    });
    this.handleValueChange(value, define);
  };
  getEnumForm = (define: any, value: string) => {
    let enumForm;
    const { regex } = define;
    if (regex.length < 6) {
      const RadioGroup = Radio.Group;

      enumForm = (
        <RadioGroup
          onChange={(e) => this.handleInputValueChange(e, define)}
          defaultValue={value}
        >
          {regex.map((item: string) => (
            <Radio value={item} key={item}>
              {item}
            </Radio>
          ))}
        </RadioGroup>
      );
    } else {
      const Option = Select.Option;
      enumForm = (
        <Select
          {...(value !== null ? { defaultValue: value } : {})}
          style={{ width: "100%" }}
          onChange={(e: SelectValue) => this.handleValueChange(e, define)}
        >
          {regex.map((item: string) => (
            <Option value={item} key={item}>
              {item}
            </Option>
          ))}
        </Select>
      );
    }
    return enumForm;
  };
  validateJson = (err: any, index: number) => {
    const { showError } = this.state;
    const error = _.some(err, ["type", "error"]);
    showError[index] = error;
    this.setState({ showError });
  };
  getFormType = (define: Structkey, value: any, index: number) => {
    let formType;
    let defaultValue = value ? value[define.id] : null;
    //如果是json类型，数据有可能是字符串、数组或对象等，需要对数据处理
    if (define.type === "json") {
      defaultValue =
        _.isString(defaultValue) || !defaultValue
          ? defaultValue || ""
          : JSON.stringify(defaultValue, null, 2);
    }
    switch (define.type) {
      case "int": {
        formType = (
          <InputNumber
            defaultValue={defaultValue}
            style={{ width: "100%" }}
            precision={0}
            onChange={(e) => this.handleValueChange(e, define)}
          />
        );
        break;
      }
      case "enum": {
        formType = this.getEnumForm(define, defaultValue);
        break;
      }
      case "enums": {
        formType = (
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            onChange={(e: SelectValue) => this.handleValueChange(e, define)}
            {...(defaultValue !== null ? { defaultValue: defaultValue } : {})}
          >
            {define.regex.map((item: string) => (
              <Select.Option value={item} key={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        );
        break;
      }
      case "bool": {
        formType = (
          <Radio.Group
            onChange={(e) => this.handleInputValueChange(e, define)}
            defaultValue={defaultValue}
          >
            {boolOptions.map((item) => (
              <Radio value={item.id} key={item.text}>
                {item.text}
              </Radio>
            ))}
          </Radio.Group>
        );
        break;
      }
      case "arr": {
        formType = (
          <Select
            mode="tags"
            style={{ width: "100%" }}
            {...(defaultValue !== null ? { defaultValue: defaultValue } : {})}
            onChange={(e: SelectValue) => this.handleValueChange(e, define)}
          />
        );
        break;
      }
      case "date":
      case "datetime": {
        const formater = computeDateFormat(define.type, defaultValue);
        formType = (
          <DatePicker
            defaultValue={formater.value}
            showTime={define.type === "datetime"}
            onChange={(e) =>
              this.handleValueChange(
                e.format(
                  define.type === "datetime"
                    ? "YYYY-MM-DD HH:mm:ss"
                    : "YYYY-MM-DD"
                ),
                define
              )
            }
            format={formater.format}
          />
        );
        break;
      }
      case "ip": {
        formType = (
          <div>
            <Input
              defaultValue={defaultValue}
              onChange={(e) => this.handleIpValueChange(e, define, index)}
            />
            <label
              style={{
                display: this.state.showError[index] ? "block" : "none",
                color: "#fc5043",
              }}
            >
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NOT_MEET_REGEX}`)}
            </label>
          </div>
        );
        break;
      }
      case "float": {
        formType = (
          <InputNumber
            defaultValue={defaultValue}
            style={{ width: "100%" }}
            onChange={(e) => this.handleValueChange(e, define)}
          />
        );
        break;
      }
      case "json": {
        formType = (
          <div>
            <CodeEditor
              value={defaultValue}
              mode={"json"}
              maxLines={"Infinity"}
              highlightActiveLine={true}
              onChange={(e: any) => this.handleValueChange(e, define)}
              minLines={3}
              showLineNumbers={true}
              showPrintMargin={false}
              onValidate={(err: any) => this.validateJson(err, index)}
            />
            <label
              style={{
                display: this.state.showError[index] ? "block" : "none",
                color: "#fc5043",
              }}
            >
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NOT_MEET_JSON}`)}
            </label>
          </div>
        );
        break;
      }
      default: {
        formType = (
          <Input
            defaultValue={defaultValue}
            onChange={(e) => this.handleInputValueChange(e, define)}
          />
        );
      }
    }
    return formType;
  };

  // 保存修改
  handleStore = () => {
    this.props.handleStoreFunction(this.state.structData);
  };
  handleCloseModal = () => {
    this.props.handleCancelFunction();
  };
  render() {
    const { attribute, visible, structData } = this.props;
    const structDefine = attribute.value.struct_define;
    return (
      <Modal
        visible={visible}
        onOk={this.handleStore}
        onCancel={this.handleCloseModal}
        okButtonProps={{
          disabled: this.state.showError.includes(true),
          id: "okBtn",
        }}
        okText={i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CONFIRM}`)}
        cancelText={i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CANCEL}`)}
        cancelButtonProps={{ id: "cancelBtn" }}
        destroyOnClose={true}
      >
        {structDefine.map((define, index) => {
          return (
            <div className={styles.formItem} key={define.id}>
              <label className={styles.formLabel}>{define.name}：</label>
              {this.getFormType(define, structData, index)}
            </div>
          );
        })}
      </Modal>
    );
  }
}
