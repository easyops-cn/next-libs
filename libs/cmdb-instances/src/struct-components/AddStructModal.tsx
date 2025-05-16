import React, { useEffect } from "react";
import {
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Form,
} from "antd";
import i18n from "i18next";
import moment from "moment";
import { keyBy, reduce, isString, isNil } from "lodash";
import { CodeEditor } from "@next-libs/code-editor-components";
import { useTranslation } from "react-i18next";

import { Attribute, Structkey, StructDefineType } from "./interfaces";
import { boolOptions } from "../model-attribute-form-control/ModelAttributeFormControl";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";

export interface AddStructModalProps {
  structData?: any;
  attribute: Attribute;
  handleStoreFunction: any;
  handleCancelFunction: () => void;
  visible: boolean;
}

export function AddStructModal(props: AddStructModalProps): React.ReactElement {
  const { t } = useTranslation(NS_LIBS_CMDB_INSTANCES);
  const {
    attribute,
    visible,
    structData,
    handleStoreFunction,
    handleCancelFunction,
  } = props;
  const structDefine = attribute.value.struct_define;
  const structDefineMap = keyBy(structDefine, "id");
  const [form] = Form.useForm();

  const structValue = reduce(
    structData,
    (pre: any, value, key) => {
      let calcValue;
      switch (structDefineMap[key]?.type) {
        case StructDefineType.DATE:
        case StructDefineType.DATETIME:
          calcValue = value && moment(value);
          break;
        case StructDefineType.JSON:
          calcValue =
            isString(value) || !value
              ? value || ""
              : JSON.stringify(value, null, 2);
          break;
        default:
          calcValue = value;
      }
      pre[key] = calcValue;
      return pre;
    },
    {}
  );

  const hasRegex = (regex: any): boolean => !isNil(regex) && regex !== "";
  const hasValue = (value: any): boolean => !isNil(value) && value !== "";

  const handleJsonValidate = (err: any, define: Structkey) => {
    const errors: string[] = [];
    err.some((v: any) => v.type === "error") && errors.push(t(K.NOT_MEET_JSON));
    err.some((v: any) => v.type === "warning") &&
      errors.push(t(K.NOT_MEET_REGEX));
    form.setFields([
      {
        name: define.id,
        errors,
      },
    ]);
  };

  const getFormType = (define: Structkey) => {
    const { name, type, regex } = define;

    switch (type) {
      case StructDefineType.INTEGER: {
        return (
          <InputNumber
            style={{ width: "100%" }}
            precision={0}
            placeholder={t(K.INTEGER_INPUT_PLACEHOLDER)}
          />
        );
      }
      case StructDefineType.FLOAT: {
        return (
          <InputNumber
            style={{ width: "100%" }}
            placeholder={t(K.FLOAT_INPUT_PLACEHOLDER)}
          />
        );
      }
      case StructDefineType.BOOLEAN: {
        return (
          <Radio.Group>
            {boolOptions.map((item) => (
              <Radio value={item.id} key={item.text}>
                {item.text}
              </Radio>
            ))}
          </Radio.Group>
        );
      }
      case StructDefineType.ARR: {
        return (
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder={
              t(K.ENTER_MULTIPLE_STRING_WITH_ENTER_KEY_AS_THE_SEPARATOR, {
                label: name,
              }) +
              (hasRegex(regex)
                ? `${t(K.COMMA)}${t(K.MATCHING_REGULAR, {
                    regexp: regex,
                  })}`
                : "")
            }
          />
        );
      }
      case StructDefineType.ENUM:
      case StructDefineType.ENUMS: {
        if (regex.length < 6 && type === StructDefineType.ENUM) {
          return (
            <Radio.Group>
              {regex.map((item: string) => (
                <Radio value={item} key={item}>
                  {item}
                </Radio>
              ))}
            </Radio.Group>
          );
        } else {
          return (
            <Select
              mode={type === StructDefineType.ENUMS ? "multiple" : undefined}
              style={{ width: "100%" }}
              placeholder={t(K.SELECT_PLACEHOLDER_TPL, { label: name })}
            >
              {regex.map((item: string) => (
                <Select.Option value={item} key={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          );
        }
      }
      case StructDefineType.DATE:
      case StructDefineType.DATETIME: {
        return (
          <DatePicker
            showTime={type === "datetime"}
            placeholder={t(K.CLICK_TO_SELECT)}
          />
        );
      }
      case StructDefineType.IP: {
        return <Input placeholder={t(K.IP_PLACEHOLDER)} />;
      }
      case StructDefineType.JSON: {
        let jsonSchema: any;
        if (hasRegex(regex)) {
          jsonSchema = JSON.parse(regex);
        }
        return (
          <CodeEditor
            mode={"json"}
            maxLines={"Infinity"}
            highlightActiveLine={true}
            minLines={3}
            showLineNumbers={true}
            showPrintMargin={false}
            validateJsonSchemaMode={"error"}
            onValidate={(err: any) => handleJsonValidate(err, define)}
            {...(jsonSchema ? { jsonSchema } : {})}
            theme="tomorrow"
          />
        );
      }
      case StructDefineType.STRING:
      default: {
        return (
          <Input
            placeholder={
              t(K.INPUT_PLACEHOLDER_TPL, { label: name }) +
              (hasRegex(regex)
                ? `${t(K.COMMA)}${t(K.MATCHING_REGULAR, {
                    regexp: regex,
                  })}`
                : "")
            }
          />
        );
      }
    }
  };

  const getFormRules = (define: Structkey) => {
    const rules = [];
    switch (define.type) {
      case StructDefineType.STRING:
      case StructDefineType.IP: {
        hasRegex(define.regex) &&
          rules.push({
            pattern: define.regex,
            message: t(
              define.type === "ip" ? K.NOT_MEET_REGEX : K.NOT_MEET_REGEX_DETAIL,
              {
                regex: define.regex,
              }
            ),
          });
        break;
      }
      case StructDefineType.ARR: {
        const regex = new RegExp(define.regex);
        hasRegex(define.regex) &&
          rules.push({
            validator: (rule: any, value: any, cb: any) => {
              (value ?? []).every((item: any) => regex.test(item))
                ? cb()
                : cb(rule.message);
            },
            message: t(K.NOT_MEET_REGEX_DETAIL, {
              regex: define.regex,
            }),
          });
        break;
      }
      case StructDefineType.INTEGER: {
        const regex = new RegExp(define.regex);
        hasRegex(define.regex) &&
          rules.push({
            validator: (rule: any, value: any, cb: any) => {
              !hasValue(value) || regex.test(value) ? cb() : cb(rule.message);
            },
            message: t(K.NOT_MEET_REGEX_DETAIL, {
              regex: define.regex,
            }),
          });
        break;
      }
    }
    return rules;
  };

  const handleStore = async () => {
    // 校验JSON类型
    const hasErrors = !form.getFieldsError().every((v) => !v.errors.length);
    if (hasErrors) return;
    const values = await form.validateFields();
    const newValues = reduce(
      values,
      (pre: any, value, key) => {
        let realValue;
        switch (structDefineMap[key]?.type) {
          case StructDefineType.DATE: {
            realValue = value?.format("YYYY-MM-DD");
            break;
          }
          case StructDefineType.DATETIME: {
            realValue = value?.format("YYYY-MM-DD HH:mm:ss");
            break;
          }
          default:
            realValue = value;
        }
        pre[key] = realValue;
        return pre;
      },
      {}
    );
    handleStoreFunction(newValues);
    form.resetFields();
  };

  const handleCloseModal = () => {
    handleCancelFunction();
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(structValue);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      onOk={handleStore}
      onCancel={handleCloseModal}
      okButtonProps={{ id: "okBtn" }}
      okText={t(K.CONFIRM)}
      cancelText={t(K.CANCEL)}
      cancelButtonProps={{ id: "cancelBtn" }}
      destroyOnClose={true}
    >
      <Form form={form} layout={"vertical"} initialValues={structValue}>
        {structDefine.map((define) => {
          return (
            <Form.Item
              key={define.id}
              name={define.id}
              label={define.name + "："}
              rules={getFormRules(define)}
            >
              {getFormType(define)}
            </Form.Item>
          );
        })}
      </Form>
    </Modal>
  );
}
