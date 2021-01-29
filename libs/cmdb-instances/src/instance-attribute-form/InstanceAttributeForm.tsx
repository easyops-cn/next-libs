import React, { Component } from "react";
import { CmdbModels, InstanceApi } from "@next-sdk/cmdb-sdk";
import { Form } from "@ant-design/compatible";
import { get, keyBy } from "lodash";
import { FormComponentProps } from "@ant-design/compatible/lib/form";
import {
  ModelAttributeFormControl,
  ModelAttributeValueType,
} from "../model-attribute-form-control/ModelAttributeFormControl";

import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";

import {
  ModifiedModelObjectAttr,
  ModifiedModelObjectRelation,
  ModifiedModelObjectField,
} from "@next-libs/cmdb-utils";

import { ModelRelationForm } from "../model-relation-form/ModelRelationForm";

import { addResourceBundle } from "../i18n";
addResourceBundle();

export interface InstanceAttributeFormProps extends FormComponentProps {
  isCreate?: boolean;
  objectList?: Partial<CmdbModels.ModelCmdbObject>[];
  basicInfoAttrList?: ModifiedModelObjectField[];
  attributeFormControlInitialValueMap?:
    | InstanceApi.GetDefaultValueTemplateResponseBody
    | Partial<InstanceApi.GetDetailResponseBody>;
}

export class LegacyInstanceAttributeForm extends Component<InstanceAttributeFormProps> {
  private modelMap: Record<string, Partial<CmdbModels.ModelCmdbObject>> = {};

  constructor(Props: InstanceAttributeFormProps) {
    super(Props);

    if (this.props.objectList) {
      this.modelMap = keyBy(this.props.objectList, "objectId");
    }
  }

  renderRelationFormControl = (
    relation: Partial<ModifiedModelObjectRelation>
  ) => {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };

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
        {...formItemLayout}
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

  render(): React.ReactNode {
    const { basicInfoAttrList, form } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    const collapse =
      basicInfoAttrList &&
      basicInfoAttrList.map((attribute) =>
        attribute.__isRelation ? (
          this.renderRelationFormControl(attribute)
        ) : (
          <Form.Item
            label={attribute.name}
            key={attribute.name}
            {...formItemLayout}
          >
            {getFieldDecorator(attribute.__id, {
              rules: [
                {
                  required:
                    (attribute as ModifiedModelObjectAttr).required !== "false",
                },
              ],
              initialValue: get(
                this.props.attributeFormControlInitialValueMap,
                attribute.__id
              ),
            })(
              <ModelAttributeFormControl
                isCreate={this.props.isCreate}
                attribute={attribute}
                multiSelect={
                  (attribute as ModifiedModelObjectAttr).value?.type ===
                  ModelAttributeValueType.ENUMS
                }
              />
            )}
          </Form.Item>
        )
      );
    return <Form>{collapse}</Form>;
  }
}

export const InstanceAttributeForm = Form.create<InstanceAttributeFormProps>({
  name: "instanceAttributeForm",
  validateMessages: {
    required: i18n.t(
      `${NS_LIBS_CMDB_INSTANCES}:${K.VALIDATE_MESSAGE_REQUIRED}`
    ),
  },
})(LegacyInstanceAttributeForm);
