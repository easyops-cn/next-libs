import React, { ChangeEvent } from "react";
import { DatePicker, Input, InputNumber, Modal, Radio, Select } from "antd";
import { Attribute, Structkey } from "./interfaces";
import { boolOptions } from "../model-attribute-form-control/ModelAttributeFormControl";
import styles from "./index.module.css";
import moment from "moment";
import { RadioChangeEvent } from "antd/lib/radio";
import { SelectValue } from "antd/lib/select";

export interface AddStructModalProps {
  structData?: any;
  attribute: Attribute;
  handleStoreFunction: Function;
  handleCancelFunction: Function;
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
      showError: new Array(attribute.value.struct_define.length).fill(false)
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
    e: RadioChangeEvent | ChangeEvent<HTMLInputElement>,
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
      showError
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
          onChange={e => this.handleInputValueChange(e, define)}
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
          {...(value !== null? {defaultValue: value}: {})}
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
  getFormType = (define: Structkey, value: any, index: number) => {
    let formType;
    const defaultValue = value ? value[define.id] : null;
    switch (define.type) {
      case "int":
        formType = (
          <InputNumber
            defaultValue={defaultValue}
            style={{ width: "100%" }}
            onChange={e => this.handleValueChange(e, define)}
          />
        );
        break;
      case "enum":
        formType = this.getEnumForm(define, defaultValue);
        break;
      case "enums":
        formType = (
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            onChange={(e: SelectValue) => this.handleValueChange(e, define)}
            {...(defaultValue !== null ? {defaultValue: defaultValue}: {})}
          >
            {define.regex.map((item: string) => (
              <Select.Option value={item} key={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        );
        break;
      case "bool":
        formType = (
          <Radio.Group
            onChange={e => this.handleInputValueChange(e, define)}
            defaultValue={defaultValue}
          >
            {boolOptions.map(item => (
              <Radio value={item.id} key={item.text}>
                {item.text}
              </Radio>
            ))}
          </Radio.Group>
        );
        break;
      case "arr":
        formType = (
          <Select
            mode="tags"
            style={{ width: "100%" }}
            {...(defaultValue !== null ? {defaultValue: defaultValue}: {})}
            onChange={(e: SelectValue) => this.handleValueChange(e, define)}
          />
        );
        break;
      case "date":
      case "datetime":
        formType = (
          <DatePicker
            defaultValue={moment(defaultValue)}
            showTime={define.type === "datetime"}
            onChange={e =>
              this.handleValueChange(
                e.format(
                  define.type === "datetime"
                    ? "YYYY-MM-DD HH:mm:ss"
                    : "YYYY-MM-DD"
                ),
                define
              )
            }
          />
        );
        break;
      case "ip":
        formType = (
          <div>
            <Input
              defaultValue={defaultValue}
              onChange={e => this.handleIpValueChange(e, define, index)}
            />
            <label
              style={{
                display: this.state.showError[index] ? "block" : "none",
                color: "#fc5043"
              }}
            >
              不满足预设的正则表达式，请修改
            </label>
          </div>
        );
        break;
      default:
        formType = (
          <Input
            defaultValue={defaultValue}
            onChange={e => this.handleInputValueChange(e, define)}
          />
        );
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
          id: "okBtn"
        }}
        okText="确定"
        cancelText="取消"
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
