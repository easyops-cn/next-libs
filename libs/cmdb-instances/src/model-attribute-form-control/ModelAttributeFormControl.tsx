import React, { Component, ReactNode } from "react";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import { DatePicker, Input, InputNumber, Radio, Select } from "antd";
import { AddStruct } from "../struct-components";
import moment, { Moment } from "moment";
import { AttributeFormControlUrl } from "../attribute-form-control-url/AttributeFormControlUrl";
import { computeDateFormat } from "../processors";
import { clusterMap } from "../instance-list-table/constants";
import { CodeEditor } from "@next-libs/code-editor-components";
import { some } from "lodash";
export interface FormControlSelectItem {
  id: any;
  text: string;
}

export enum ModelAttributeValueType {
  STRING = "str",
  INTEGER = "int",
  ENUM = "enum",
  ENUMS = "enums",
  ARR = "arr",
  DATE = "date",
  DATETIME = "datetime",
  STRUCT = "struct",
  STRUCT_LIST = "structs",
  FOREIGN_KEY = "FK",
  FOREIGN_KEYS = "FKs",
  IP = "ip",
  FLOAT = "float",
  BOOLEAN = "bool",
  JSON = "json",
}

export enum ModelAttributeValueModeType {
  MULTIPLE_LINES = "multiple-lines",
  DEFAULT = "default",
  MARKDOWN = "markdown",
  URL = "url",
}

export enum FormControlTypeEnum {
  TEXT = "text",
  NUMBER = "number",
  SELECT = "select",
  RADIO = "radio",
  TEXTAREA = "textarea",
  DATE = "date",
  DATETIME = "datetime",
  TAGS = "tags",
  STRUCT = "struct",
  /**
   * @deprecated supported for compatibility only
   * @type {string}
   */
  LEGACY_STRUCT = "legacy-struct",
  // fallback to show a plain text span
  _PLAIN_TEXT = "_plain_text",
  MARKDOWN = "markdown",
  URL = "url",
  CODE_EDITOR = "code_editor",
}

export interface FormControl {
  id: string;
  type: FormControlTypeEnum;
  items?: FormControlSelectItem[];
  name: string;
  label?: string;
  required?: boolean;
  readOnly?: boolean;
  unique?: boolean;
  pattern?: RegExp;
  placeholder?: string;
  maxlength?: number; // 结构体数组的最大长度，如果是结构体，就是1,
}

export interface ModelAttributeFormControlProps {
  // ant-design initialValue
  id?: string;
  value?: any;
  isCreate?: boolean;
  onChange?: (value: any) => void;
  attribute: Partial<CmdbModels.ModelObjectAttr>;
  type?: string;
  multiSelect?: boolean;
  className?: string;
  style?: React.CSSProperties;
  objectId?: string;
  jsonValidateCollection?: (err: boolean) => void;
  isSupportMultiStringValue?: boolean;
}

export interface ModelAttributeFormControlState {
  value?: any;
  formControl: FormControl;
  errorMessage: string;
  showError?: boolean;
}

export const boolOptions: FormControlSelectItem[] = [
  {
    id: true,
    text: "true",
  },
  {
    id: false,
    text: "false",
  },
];

export class ModelAttributeFormControl extends Component<
  ModelAttributeFormControlProps,
  ModelAttributeFormControlState
> {
  componentDidUpdate(
    prevProps: Readonly<ModelAttributeFormControlProps>,
    prevState: Readonly<ModelAttributeFormControlState>,
    snapshot?: any
  ): void {
    if (
      this.props.value !== prevProps.value ||
      this.props.type !== prevProps.type ||
      this.props.attribute.id !== prevProps.attribute.id ||
      this.props.attribute.name !== prevProps.attribute.name ||
      this.props.attribute.value.type !== prevProps.attribute.value.type
    ) {
      this.setState({
        value: this.props.value,
        formControl: this.computeFormControl(
          this.props.attribute,
          this.props.id,
          this.props.type,
          this.props.objectId === "CLUSTER" &&
            this.props.attribute.id === "type"
        ),
      });
    }
  }

  constructor(props: ModelAttributeFormControlProps) {
    super(props);
    const { attribute, id, value, type, objectId } = props;
    const is = objectId;
    try {
      this.state = {
        value,
        errorMessage: null,
        formControl: this.computeFormControl(
          attribute,
          id,
          type,
          this.props.objectId === "CLUSTER" &&
            this.props.attribute.id === "type"
        ),
      };
    } catch (error) {
      this.state = {
        errorMessage: error.message,
        formControl: {
          type: FormControlTypeEnum._PLAIN_TEXT,
          name: attribute.name,
          id: "",
        },
      };
    }
  }

  static computePattern(
    attribute: Partial<CmdbModels.ModelObjectAttr>
  ): RegExp | undefined {
    try {
      if (
        attribute.value.type !== ModelAttributeValueType.ENUM &&
        attribute.value.type !== ModelAttributeValueType.ENUMS &&
        attribute.value.regex !== undefined &&
        attribute.value.regex !== null
      ) {
        // todo(jhuang): use `u` flag for compliance until https://github.com/angular/angular/pull/20819 is resolved
        return new RegExp(attribute.value.regex as string, "u");
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  computeFormControlItems(
    attribute: Partial<CmdbModels.ModelObjectAttr>,
    isClusterType?: boolean
  ): FormControlSelectItem[] {
    if (
      attribute.value.type === ModelAttributeValueType.ENUM ||
      attribute.value.type === ModelAttributeValueType.ENUMS
    ) {
      // The backend guys are notorious to use `regex` as enum candidates. 😢
      return (attribute.value.regex as string[])?.map((enumValue) => ({
        id: enumValue,
        text: isClusterType ? clusterMap[enumValue] : enumValue,
      }));
    }
  }

  static computeFormControlType(
    attribute: Partial<CmdbModels.ModelObjectAttr>,
    type?: string,
    isSupportMultiStringValue?: boolean
  ): FormControlTypeEnum {
    switch (attribute.value.type) {
      case ModelAttributeValueType.STRING: {
        if (
          attribute.value.mode === ModelAttributeValueModeType.MULTIPLE_LINES
        ) {
          return FormControlTypeEnum.TEXTAREA;
        }
        if (attribute.value.mode === ModelAttributeValueModeType.MARKDOWN) {
          return FormControlTypeEnum.MARKDOWN;
        }
        if (attribute.value.mode === ModelAttributeValueModeType.URL) {
          return FormControlTypeEnum.URL;
        }
      }
      /* falls through */
      case ModelAttributeValueType.IP:
        if (isSupportMultiStringValue) {
          return FormControlTypeEnum.TAGS;
        }
        return FormControlTypeEnum.TEXT;
      case ModelAttributeValueType.JSON:
        // return FormControlTypeEnum.TEXTAREA;
        return FormControlTypeEnum.CODE_EDITOR;
      case ModelAttributeValueType.ENUM:
        if (
          !attribute.value.regex ||
          (attribute.value.regex as string[]).length === 0
        ) {
          throw new Error(
            // "请在资源模型管理中添加枚举值, 属性: " + attribute.name
            i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ENUM_ERROR_TIP}`, {
              attribute: attribute.name,
            })
          );
        }
        if (
          attribute.value.regex &&
          (attribute.value.regex as string[]).length <= 5 &&
          (!type || type === FormControlTypeEnum.RADIO)
        ) {
          return FormControlTypeEnum.RADIO;
        }
        return FormControlTypeEnum.SELECT;
      case ModelAttributeValueType.INTEGER:
      case ModelAttributeValueType.FLOAT:
        return FormControlTypeEnum.NUMBER;
      case ModelAttributeValueType.DATE:
        return FormControlTypeEnum.DATE;
      case ModelAttributeValueType.DATETIME:
        return FormControlTypeEnum.DATETIME;
      case ModelAttributeValueType.ARR:
        return FormControlTypeEnum.TAGS;
      case ModelAttributeValueType.STRUCT:
        if (attribute.value.struct_define.length === 0) {
          throw new Error(
            // "请在资源模型中添加结构体属性, 属性: " + attribute.name
            i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.STRUCT_ERROR_TIP}`, {
              attribute: attribute.name,
            })
          );
        }
        return FormControlTypeEnum.LEGACY_STRUCT;
      case ModelAttributeValueType.STRUCT_LIST:
        if (attribute.value.struct_define.length === 0) {
          throw new Error(
            // "请在资源模型中添加结构体属性, 属性: " + attribute.name
            i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.STRUCT_ERROR_TIP}`, {
              attribute: attribute.name,
            })
          );
        }
        return FormControlTypeEnum.STRUCT;
      case ModelAttributeValueType.BOOLEAN:
        return FormControlTypeEnum.SELECT;
      case ModelAttributeValueType.ENUMS:
        return FormControlTypeEnum.SELECT;
      default:
        throw new Error(
          i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.TYPE_NO_SUPPORT_EDIT}`, {
            type: attribute.value.type,
          })
        );
    }
  }

  computeFormControl = (
    attribute: Partial<CmdbModels.ModelObjectAttr>,
    id?: string,
    type?: string,
    isClusterType?: boolean
  ): FormControl => {
    const formControlType = ModelAttributeFormControl.computeFormControlType(
      attribute,
      type,
      this.props.isSupportMultiStringValue
    );
    let items = this.computeFormControlItems(attribute, isClusterType);

    if (attribute.value.type === ModelAttributeValueType.BOOLEAN) {
      items = boolOptions;
    }

    const result: FormControl = {
      type: formControlType,
      items,
      id: id || attribute.id,
      name: attribute.id,
      label: attribute.name,
      required: attribute.required === "true",
      readOnly: !this.props.isCreate && attribute.readonly === "true",
      unique: attribute.unique === "true",
      pattern: ModelAttributeFormControl.computePattern(attribute),
    };

    if (result.type === FormControlTypeEnum.STRUCT) {
      result["maxlength"] = 1;
    }
    result["placeholder"] =
      ModelAttributeFormControl.computePlaceholder(result);
    return result;
  };

  static computePlaceholder(formControl: FormControl): string {
    if (formControl.id === "ip" && formControl.name === "ip") {
      return i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.IP_PLACEHOLDER}`);
    }

    const placeholders = [];
    switch (formControl.type) {
      case FormControlTypeEnum.SELECT:
        placeholders.push(
          i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_SELECT}`)
        );
        break;
      case FormControlTypeEnum.DATETIME:
      case FormControlTypeEnum.DATE:
        placeholders.push(
          i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_SELECT}`)
        );
        break;
      case FormControlTypeEnum.TAGS:
        placeholders.push(
          i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.ENTER_MULTIPLE_STRING_WITH_ENTER_KEY_AS_THE_SEPARATOR}`
          )
        );
        break;
      default:
        placeholders.push(
          i18n.t(
            `${NS_LIBS_CMDB_INSTANCES}:${K.ADVANCE_SEARCH_SINGLE_INPUT_PLACEHOLDER}`
          )
        );
    }

    if (formControl.pattern !== undefined) {
      // placeholders.push(`匹配正则 ${formControl.pattern}`);
      placeholders.push(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.MATCHING_REGULAR}`, {
          regexp: formControl.pattern,
        })
      );
    }
    if (formControl.unique) {
      // placeholders.push(`${formControl.label}唯一不能重复`);
      placeholders.push(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.UNIQUE_NO_REPEAT}`, {
          label: formControl.label,
        })
      );
    }
    return placeholders.join("，");
  }

  /*computeFormControlAndCatchError = () => {
    const { attribute, objectId } = this.props;
    try {
      this.setState({
        formControl: this.computeFormControl(attribute, objectId)
      });
    } catch (error) {
      this.setState({
        errorMessage: error.message,
        formControl: {
          type: FormControlTypeEnum._PLAIN_TEXT,
          name: attribute.name,
          id: ""
        }
      });
    }
  };*/

  onChange = (event: any) => {
    let value;
    if (event && event.target) {
      value = event.target.value;
    } else {
      value = event;
    }

    const { onChange } = this.props;
    this.setState({ value });
    onChange && onChange(value);
  };

  handleDateChange = (date: Moment, dateString: string) => {
    this.onChange(dateString || undefined);
  };
  validateJson = (err: any) => {
    const error = some(err, ["type", "error"]);
    this.props.jsonValidateCollection?.(error);
    this.setState({ showError: error });
  };

  FormControlTypeMap = (): ReactNode => {
    const { attribute } = this.props;
    const {
      value,
      formControl: { type, ...restProps },
      errorMessage,
    } = this.state;
    // const unsupportText = `"${type}"类型暂时不支持编辑`;
    // const unsupportText = i18n.t(
    //   `${NS_LIBS_CMDB_INSTANCES}:${K.TYPE_NO_SUPPORT_EDIT}`,
    //   { type }
    // );
    let jsonSchema: any;
    if (attribute?.value?.type === "json" && attribute?.value?.regex) {
      jsonSchema = JSON.parse(attribute?.value?.regex);
    }

    switch (type) {
      case FormControlTypeEnum.TEXT: {
        const { pattern, placeholder, ...props } = restProps;
        return (
          <Input
            value={value}
            type="text"
            {...props}
            placeholder={placeholder}
            onChange={(e) => this.onChange(e)}
            className={this.props.className}
            style={this.props.style}
          />
        );
      }

      case FormControlTypeEnum.URL: {
        const { readOnly, required, placeholder } = restProps;

        return (
          <AttributeFormControlUrl
            readOnly={readOnly}
            required={required}
            placeholder={placeholder}
            value={value}
            onChange={(e) => this.onChange(e)}
          />
        );
      }

      case FormControlTypeEnum.NUMBER: {
        const { pattern, ...props } = restProps;
        return (
          <InputNumber
            value={value}
            {...props}
            onChange={(e: any) => this.onChange(e)}
            className={this.props.className}
            style={this.props.style}
          />
        );
      }
      case FormControlTypeEnum.CODE_EDITOR:
        return (
          <>
            <CodeEditor
              value={value}
              mode={"json"}
              maxLines={"Infinity"}
              highlightActiveLine={true}
              onChange={(e: any) => this.onChange(e)}
              minLines={3}
              showLineNumbers={true}
              showPrintMargin={false}
              validateJsonSchemaMode={"error"}
              {...(jsonSchema ? { jsonSchema: jsonSchema } : {})}
              theme="tomorrow"
              onValidate={(err: any) => this.validateJson(err)}
            />
            <label
              style={{
                display: this.state.showError ? "block" : "none",
                color: "#fc5043",
              }}
            >
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.NOT_MEET_JSON}`)}
            </label>
          </>
        );
      case FormControlTypeEnum.TEXTAREA:
      case FormControlTypeEnum.MARKDOWN: {
        return (
          <Input.TextArea
            value={value}
            {...restProps}
            onChange={(e: any) => this.onChange(e)}
            className={this.props.className}
            style={this.props.style}
            rows={5}
          />
        );
      }

      case FormControlTypeEnum.STRUCT:
      case FormControlTypeEnum.LEGACY_STRUCT:
        return (
          <AddStruct
            isLegacy={type === FormControlTypeEnum.LEGACY_STRUCT}
            attribute={attribute}
            structData={value}
            handleStoreFunction={(formData: any) => this.onChange(formData)}
            className={this.props.className}
            style={this.props.style}
            isCreate={this.props.isCreate}
          />
        );

      case FormControlTypeEnum.RADIO: {
        let { items, required, readOnly } = restProps;

        // NODE: 对非必填单选为空的特殊处理 BY @robertman
        const unselected = {
          id: null as string,
          // text: "暂不选择",
          text: i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.TEMPORARILY_NOT_CHOOSE}`),
        };

        if (!required) {
          items = [...items, unselected];
        }

        return (
          <Radio.Group
            onChange={(e: any) => this.onChange(e)}
            value={value !== undefined ? value : unselected.id}
            className={this.props.className}
            style={this.props.style}
            disabled={readOnly}
          >
            {items.map((item) => (
              <Radio value={item.id} key={String(item.id)}>
                {item.text}
              </Radio>
            ))}
          </Radio.Group>
        );
      }

      case FormControlTypeEnum.TAGS: {
        const { placeholder, readOnly } = restProps;
        return (
          <Select
            allowClear={true}
            mode="tags"
            style={{ ...this.props.style, width: "100%" }}
            disabled={readOnly}
            placeholder={placeholder}
            value={value || []}
            onChange={(e: any) => this.onChange(e)}
            className={this.props.className}
          />
        );
      }

      case FormControlTypeEnum.DATE:
      case FormControlTypeEnum.DATETIME: {
        let dateConfig = {};
        if (type === FormControlTypeEnum.DATETIME) {
          dateConfig = {
            showTime: true,
          };
        }
        const { readOnly, placeholder } = restProps;
        const formater = computeDateFormat(type, value);
        return (
          <DatePicker
            value={formater.value}
            placeholder={placeholder}
            disabled={readOnly}
            format={formater.format}
            {...dateConfig}
            onChange={(date, dateString) =>
              this.handleDateChange(date, dateString)
            }
            className={this.props.className}
            style={this.props.style}
          />
        );
      }

      case FormControlTypeEnum.SELECT: {
        const { readOnly, placeholder } = restProps;
        const newValue =
          typeof value === "boolean" ? value : value ? value : [];
        return (
          <Select
            placeholder={placeholder}
            mode={this.props.multiSelect ? "multiple" : undefined}
            value={newValue}
            onChange={(e: any) => this.onChange(e)}
            disabled={readOnly}
            className={this.props.className}
            style={this.props.style}
          >
            {restProps.items &&
              restProps.items.map(({ id, text }) => (
                <Select.Option value={id} key={id}>
                  {text}
                </Select.Option>
              ))}
          </Select>
        );
      }

      default:
        return (
          // <Input
          //   value={errorMessage}
          //   readOnly
          //   disabled
          //   className={this.props.className}
          //   style={this.props.style}
          // />
          <div
            style={{
              color: "var(--theme-red-color)",
              ...this.props.style,
            }}
          >
            {errorMessage}
          </div>
        );
    }
  };

  render(): ReactNode {
    return <>{this.FormControlTypeMap()}</>;
  }
}
