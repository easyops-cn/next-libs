import React, { Component } from "react";
import { CmdbModels, InstanceApi } from "@sdk/cmdb-sdk";
import { Form } from "antd";
import { get } from "lodash";
import { FormComponentProps } from "antd/lib/form";
import { ModelAttributeFormControl } from "../model-attribute-form-control/ModelAttributeFormControl";

import i18n from "i18next";
import { NS_CMDB_INSTANCES, K } from "./i18n/constants";

import { addResourceBundle } from "./i18n";
addResourceBundle();

export interface InstanceAttributeFormProps extends FormComponentProps {
  basicInfoAttrList?: Partial<CmdbModels.ModelObjectAttr>[];
  attributeFormControlInitialValueMap?:
    | InstanceApi.GetDefaultValueTemplateResponseBody
    | Partial<InstanceApi.GetDetailResponseBody>;
}

export class LegacyInstanceAttributeForm extends Component<
  InstanceAttributeFormProps,
  {}
> {
  constructor(Props: InstanceAttributeFormProps) {
    super(Props);
  }

  render(): React.ReactNode {
    const { basicInfoAttrList, form } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    };
    const collapse =
      basicInfoAttrList &&
      basicInfoAttrList.map(attribute => (
        <Form.Item
          label={attribute.name}
          key={attribute.name}
          {...formItemLayout}
        >
          {getFieldDecorator(attribute.id, {
            rules: [{ required: attribute.required !== "false" }],
            initialValue: get(
              this.props.attributeFormControlInitialValueMap,
              attribute.id
            )
          })(<ModelAttributeFormControl attribute={attribute} />)}
        </Form.Item>
      ));
    return <Form>{collapse}</Form>;
  }
}

export const InstanceAttributeForm = Form.create<InstanceAttributeFormProps>({
  name: "instanceAttributeForm",
  validateMessages: {
    required: i18n.t(`${NS_CMDB_INSTANCES}:${K.VALIDATE_MESSAGE_REQUIRED}`)
  }
})(LegacyInstanceAttributeForm);
