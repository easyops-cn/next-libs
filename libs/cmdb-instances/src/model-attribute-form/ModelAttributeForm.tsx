import React, { Component, FormEvent } from "react";
import { Button, Checkbox, Collapse, Form } from "antd";
import { ButtonType } from "antd/lib/button";
import { CmdbModels, InstanceApi } from "@sdk/cmdb-sdk";
import {
  FormComponentProps,
  ValidationRule,
  FormItemProps
} from "antd/lib/form";
import {
  FormControlTypeEnum,
  ModelAttributeFormControl,
  ModelAttributeValueType
} from "../model-attribute-form-control/ModelAttributeFormControl";
import { AttributeFormControlUrl } from "../attribute-form-control-url/AttributeFormControlUrl";
import { isNil, keyBy, get } from "lodash";

import { ModelRelationForm } from "../model-relation-form/ModelRelationForm";
import {
  ModifiedModelObjectAttr,
  ModifiedModelObjectRelation,
  ModifiedModelObjectField,
  ModifiedModelCmdbObject,
  modifyModelData
} from "@libs/cmdb-utils";

export interface ModelAttributeFormChildren {
  header: string;
  name: string;
  label: string;
  options?: { [key: string]: any };
}

export interface FieldsByTag {
  name: string;
  fields: string[];
}

interface ModelAttributeFormProps extends FormComponentProps {
  isCreate?: boolean;
  disabled?: boolean;
  objectId?: string;
  allowContinueCreate?: boolean;
  blackList?: string[]; // 黑名单
  brickList?: ModelAttributeFormChildren[];
  fieldsByTag?: FieldsByTag[];
  formItemProps?: FormItemProps;
  onSubmit(data: any): Promise<any>;
  basicInfoAttrList?: Partial<CmdbModels.ModelObjectAttr>[];
  objectList?: Partial<CmdbModels.ModelCmdbObject>[];
  attributeFormControlInitialValueMap:
    | InstanceApi.GetDefaultValueTemplateResponseBody
    | Partial<InstanceApi.GetDetailResponseBody>;
  showCancelButton?: boolean;
  cancelText?: string;
  cancelType?: ButtonType;
  onCancel?(): void;
}

export type attributesFieldsByTag = [string, ModifiedModelObjectField[]];

interface ModelAttributeFormState {
  sending: boolean;
  attrListGroupByTag: attributesFieldsByTag[];
  continueCreating: boolean;
}

export class ModelAttributeForm extends Component<
  ModelAttributeFormProps,
  ModelAttributeFormState
> {
  private modelMap: Record<string, Partial<CmdbModels.ModelCmdbObject>> = {};
  private modelData: Partial<CmdbModels.ModelCmdbObject> = null;

  static defaultProps = {
    showCancelButton: true,
    cancelText: "取消",
    cancelType: "default" as ButtonType
  };

  formItemProps: FormItemProps = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  };

  constructor(props: ModelAttributeFormProps) {
    super(props);

    if (this.props.objectList) {
      this.modelMap = keyBy(this.props.objectList, "objectId");
      this.modelData = modifyModelData(this.modelMap[this.props.objectId]);
    }

    let AttrListGroupByTag: attributesFieldsByTag[] = [];

    if (props.formItemProps) {
      this.formItemProps = props.formItemProps;
    }
    if (props.fieldsByTag) {
      AttrListGroupByTag = ModelAttributeForm.getFieldsByTag(
        this.props.basicInfoAttrList,
        props.fieldsByTag,
        this.modelData
      );
    } else {
      props.basicInfoAttrList.forEach(basicInfoAttr => {
        const groupTag = basicInfoAttr.tag[0] || "默认属性";

        const attrs = AttrListGroupByTag.find(([key]) => key === groupTag);
        // 判断是否为黑名单内的属性
        if (
          isNil(props.blackList) ||
          !props.blackList.includes(basicInfoAttr.id)
        ) {
          if (attrs) {
            attrs[1].push(basicInfoAttr);
          } else {
            AttrListGroupByTag.push([groupTag, [basicInfoAttr]]);
          }
        }
      });
    }

    this.state = {
      sending: false,
      attrListGroupByTag: AttrListGroupByTag,
      continueCreating: false
    };
  }

  static getFieldsByTag(
    attributeList: Partial<CmdbModels.ModelObjectAttr>[],
    fieldsByTag: FieldsByTag[],
    modelData?: Partial<ModifiedModelCmdbObject>
  ): attributesFieldsByTag[] {
    const map = new Map<string, Partial<CmdbModels.ModelObjectAttr>[]>([]);

    fieldsByTag.forEach(({ name, fields }) => {
      if (!map.has(name)) {
        map.set(name, []);
        fields.forEach(field => {
          map.set(name, [
            ...map.get(name),
            modelData
              ? modelData.__fieldList.find(__field => __field.__id === field)
              : attributeList.find(({ id }) => id === field)
          ]);
        });
      }
    });

    return Array.from(map);
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

  renderRelationFormControl = (
    relation: Partial<ModifiedModelObjectRelation>
  ) => {
    const InitialRelationValue = get(
      this.props.attributeFormControlInitialValueMap,
      relation.left_id
    );
    const initialValue = InitialRelationValue
      ? InitialRelationValue.map((instanceData: any) => instanceData.instanceId)
      : [];

    return (
      <Form.Item
        label={relation.left_description}
        key={relation.left_id}
        {...this.formItemProps}
      >
        {this.props.form.getFieldDecorator(relation.left_id, { initialValue })(
          <ModelRelationForm
            modelMap={this.modelMap}
            relation={relation}
            instanceListData={
              this.props.attributeFormControlInitialValueMap[relation.left_id]
            }
          />
        )}
      </Form.Item>
    );
  };

  handleCancel = () => {
    this.props.onCancel?.();
  };

  render(): React.ReactNode {
    const Panel = Collapse.Panel;
    const {
      form,
      attributeFormControlInitialValueMap,
      brickList,
      allowContinueCreate,
      showCancelButton,
      cancelText,
      cancelType
    } = this.props;
    const { getFieldDecorator } = form;

    let defaultActiveKey = this.state.attrListGroupByTag.map(([key]) => key);

    if (Array.isArray(brickList)) {
      defaultActiveKey = [
        ...defaultActiveKey,
        ...brickList.map(brick => brick.name)
      ];
    }

    const collapse = this.state.attrListGroupByTag && (
      <Collapse bordered={false} defaultActiveKey={defaultActiveKey}>
        {this.state.attrListGroupByTag.map(([tag, list]) => (
          <Panel header={tag} key={tag}>
            {list.map((attribute: Partial<ModifiedModelObjectAttr>) =>
              attribute.__isRelation ? (
                this.renderRelationFormControl(attribute)
              ) : (
                <Form.Item
                  label={attribute.name}
                  key={attribute.name}
                  {...this.formItemProps}
                >
                  {getFieldDecorator(attribute.id, {
                    rules: this.rules(attribute),
                    initialValue:
                      attributeFormControlInitialValueMap[attribute.id]
                  })(<ModelAttributeFormControl attribute={attribute} />)}
                </Form.Item>
              )
            )}
          </Panel>
        ))}

        {brickList &&
          brickList.map(brick => (
            <Panel header={brick.header} key={brick.name}>
              <Form.Item
                label={brick.label}
                key={brick.name}
                {...this.formItemProps}
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
      <div className="ant-collapse-content" style={{ borderTop: "none" }}>
        <div className="ant-collapse-content-box">
          <Form.Item>
            <div
              className={[
                "ant-col",
                `ant-col-${this.formItemProps.labelCol.span}`
              ].join(" ")}
            />
            {allowContinueCreate && (
              <Checkbox onChange={this.handleCheckContinueCreating}>
                创建另一个
              </Checkbox>
            )}
            <Button type="primary" htmlType="submit" disabled={this.disabled}>
              {this.submitBtnText}
            </Button>

            {showCancelButton && (
              <Button
                type={cancelType}
                style={{ marginLeft: 8 }}
                onClick={this.handleCancel}
              >
                {cancelText}
              </Button>
            )}
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
