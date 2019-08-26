import React, { Component, FormEvent } from "react";
import { Button, Checkbox, Collapse, Form } from "antd";
import { CmdbModels, InstanceApi } from "@sdk/cmdb-sdk";
import { FormComponentProps, ValidationRule } from "antd/lib/form";
import {
  FormControlTypeEnum,
  ModelAttributeFormControl,
  ModelAttributeValueType
} from "../model-attribute-form-control/ModelAttributeFormControl";
import { AttributeFormControlUrl } from "../attribute-form-control-url/AttributeFormControlUrl";

export interface ModelAttributeFormChildren {
  header: string;
  name: string;
  label: string;
  options?: { [key: string]: any };
}

interface ModelAttributeFormProps extends FormComponentProps {
  isCreate?: boolean;
  disabled?: boolean;
  objectId?: string;
  allowContinueCreate?: boolean;
  brickList?: ModelAttributeFormChildren[];
  tagsList?: { [s: string]: string[] };
  onSubmit(data: any): Promise<any>;
  basicInfoAttrList?: Partial<CmdbModels.ModelObjectAttr>[];
  attributeFormControlInitialValueMap:
    | InstanceApi.GetDefaultValueTemplateResponseBody
    | Partial<InstanceApi.GetDetailResponseBody>;
}

interface ModelAttributeFormState {
  sending: boolean;
  attrListGroupByTag: { [s: string]: Partial<CmdbModels.ModelObjectAttr>[] };
  continueCreating: boolean;
}

export class ModelAttributeForm extends Component<
  ModelAttributeFormProps,
  ModelAttributeFormState
> {
  constructor(props: ModelAttributeFormProps) {
    super(props);

    let AttrListGroupByTag: Record<string, any> = {};

    props.basicInfoAttrList.forEach(basicInfoAttr => {
      const groupTag = basicInfoAttr.tag[0] || "默认属性";

      const basicInfoMapGroup = AttrListGroupByTag[groupTag];
      if (basicInfoMapGroup) {
        basicInfoMapGroup.push(basicInfoAttr);
      } else {
        AttrListGroupByTag[groupTag] = [basicInfoAttr];
      }
    });

    if (props.tagsList) {
      AttrListGroupByTag = ModelAttributeForm.sortAttributeList(
        AttrListGroupByTag,
        props.tagsList
      );
    }

    this.state = {
      sending: false,
      attrListGroupByTag: AttrListGroupByTag,
      continueCreating: false
    };
  }

  static sortAttributeList(
    attributeList: { [s: string]: Partial<CmdbModels.ModelObjectAttr>[] },
    tagList: { [s: string]: string[] }
  ): { [s: string]: Partial<CmdbModels.ModelObjectAttr>[] } {
    const store: { [s: string]: Partial<CmdbModels.ModelObjectAttr>[] } = {};

    for (const tag in tagList) {
      if (!store[tag]) {
        store[tag] = [];
      }

      tagList[tag].forEach(prop => {
        const result = attributeList[tag].find(v => v.id === prop);
        store[tag].push(result);
      });
    }

    return store;
  }

  handleFormErrors(fieldsError: Record<string, string[] | undefined>) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  }

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        // NODE: 对单选为空的特殊处理 BY @robertman
        for (const key in values) {
          if (values[key] === "-%none%-") {
            values[key] = null;
            break;
          }
        }

        this.setState({ sending: true });
        const result = await this.props.onSubmit({
          continueCreating: this.state.continueCreating,
          values
        });
        if (result !== "error") {
          this.props.form.resetFields();
        }
        this.setState({ sending: false });
      }
    });
  };

  get disabled(): boolean {
    const { sending } = this.state;
    const { getFieldsError } = this.props.form;
    return this.handleFormErrors(getFieldsError()) || sending;
  }

  get submitBtnText() {
    return this.props.isCreate ? "保存" : "修改";
  }

  static tagsValidator(
    attribute: Partial<CmdbModels.ModelObjectAttr>
  ): (rule: any, value: string[], callback: (msg?: string) => void) => void {
    return (rule: any, value: string[], callback: (msg?: string) => void) => {
      if (!Array.isArray(value)) {
        return callback("不满足预设的正则表达式，请修改");
      }

      const isValidAll = value.every(v =>
        ModelAttributeFormControl.computePattern(attribute).test(v)
      );

      isValidAll ? callback() : callback("不满足预设的正则表达式，请修改");
    };
  }

  static urlValidator(
    attribute: Partial<CmdbModels.ModelObjectAttr>
  ): (rule: any, value: string, callback: (msg?: string) => void) => void {
    return (rule: any, value: string, callback: (msg?: string) => void) => {
      const { url } = AttributeFormControlUrl.breakDownValue(value);
      ModelAttributeFormControl.computePattern(attribute).test(url)
        ? callback()
        : callback("不满足预设的正则表达式，请修改");
    };
  }

  rules(attribute: Partial<CmdbModels.ModelObjectAttr>): ValidationRule[] {
    // historical issues：  如果是INTEGER和URL类型暂时不用正则表达式验证
    const required = { required: attribute.required !== "false", message: " " };
    const type = ModelAttributeFormControl.computeFormControlType(attribute);
    if (
      attribute.value.regex === null ||
      attribute.value.type === ModelAttributeValueType.INTEGER
    ) {
      return [required];
    }

    if (type === FormControlTypeEnum.URL) {
      return [
        required,
        { validator: ModelAttributeForm.urlValidator(attribute) }
      ];
    }

    if (type === FormControlTypeEnum.TAGS) {
      return [
        required,
        { validator: ModelAttributeForm.tagsValidator(attribute) }
      ];
    }

    return [
      required,
      {
        pattern: ModelAttributeFormControl.computePattern(attribute),
        message: "不满足预设的正则表达式，请修改"
      }
    ];
  }

  handleCheckContinueCreating = (e: any) => {
    this.setState({ continueCreating: e.target.checked });
  };

  render(): React.ReactNode {
    const Panel = Collapse.Panel;
    const {
      form,
      attributeFormControlInitialValueMap,
      brickList,
      allowContinueCreate
    } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    };

    const tagArray = Object.keys(this.state.attrListGroupByTag);

    let defaultActiveKey = tagArray;
    if (Array.isArray(brickList)) {
      defaultActiveKey = [...tagArray, ...brickList.map(brick => brick.name)];
    }

    const collapse = this.state.attrListGroupByTag && (
      <Collapse bordered={false} defaultActiveKey={defaultActiveKey}>
        {tagArray.map(tag => (
          <Panel header={tag} key={tag}>
            {this.state.attrListGroupByTag[tag].map(attribute => (
              <Form.Item
                label={attribute.name}
                key={attribute.name}
                {...formItemLayout}
              >
                {getFieldDecorator(attribute.id, {
                  rules: this.rules(attribute),
                  initialValue:
                    attributeFormControlInitialValueMap[attribute.id]
                })(<ModelAttributeFormControl attribute={attribute} />)}
              </Form.Item>
            ))}
          </Panel>
        ))}

        {brickList &&
          brickList.map(brick => (
            <Panel header={brick.header} key={brick.name}>
              <Form.Item
                label={brick.label}
                key={brick.name}
                {...formItemLayout}
              >
                <brick.name
                  ref={(element: any) => {
                    element &&
                      ((element["value"] = this.props.form.getFieldsValue()),
                      (element["options"] = brick.options));
                  }}
                />
              </Form.Item>
            </Panel>
          ))}
      </Collapse>
    );

    const submitContainer = (
      <div className="ant-collapse-content">
        <div className="ant-collapse-content-box">
          <Form.Item>
            <div className="ant-col ant-col-6 " />
            {allowContinueCreate && (
              <Checkbox onChange={this.handleCheckContinueCreating}>
                创建另一个
              </Checkbox>
            )}
            <Button type="primary" htmlType="submit" disabled={this.disabled}>
              {this.submitBtnText}
            </Button>
          </Form.Item>
        </div>
      </div>
    );

    return (
      <Form onSubmit={e => this.handleSubmit(e)}>
        {collapse}
        {submitContainer}
      </Form>
    );
  }
}

export const InstanceModelAttributeForm = Form.create<
  ModelAttributeFormProps
>()(ModelAttributeForm);
