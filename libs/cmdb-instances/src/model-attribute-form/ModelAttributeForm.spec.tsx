import React from "react";
import { mount, shallow } from "enzyme";
import {
  InstanceModelAttributeForm,
  ModelAttributeForm,
} from "./ModelAttributeForm";
import {
  mockFetchCmdbInstanceDetailReturnValue,
  mockFetchCmdbObjectDetailReturnValue,
  mockFetchCmdbObjectListReturnValue,
} from "../__mocks__";
import { Checkbox } from "antd";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
/* eslint-disable  */

describe("ModelAttributeForm", () => {
  const props = {
    attributeFormControlInitialValueMap: mockFetchCmdbInstanceDetailReturnValue,
    basicInfoAttrList: mockFetchCmdbObjectDetailReturnValue.attrList,
    objectId: "HOST",
    disabled: false,
    isCreate: true,
    formItemProps: {
      labelCol: { span: 3 },
      wrapperCol: { span: 17 },
    },
    brickList: [
      {
        name: "console-printer",
        label: "使用示例",
        header: "使用示例（根据“参数说明”自动生成）",
        options: {
          theme: "monokai",
          mode: "yaml",
        },
      },
    ],
    objectList: mockFetchCmdbObjectListReturnValue,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  describe("handleSubmit", () => {
    it("should submit", async () => {
      const values: any = {
        CHECK_IP2: "sdfsdfs",
        check_array: ["24324"],
        check_enum: null,
        check_ip4: "192.168.100.15",
        check_num_readonly: 4,
        name: "sdfsdf",
        check_url2: "[百度哦](http://wwww.baidu.comcc)",
        check_num: 2,
        check_read_only: "0.0.0.0",
        check_string: "sdfdsfsdf",
        check_url: "[null](http://sdfsfdsdfdsf)",
      };

      const newValues: any = {
        CHECK_IP2: "sdfsdfs",
        check_array: ["24324"],
        check_enum: null,
        check_ip4: "192.168.100.15",
        check_num_readonly: 4,
        name: "sdfsdf",
        check_url2: "[百度哦](http://wwww.baidu.comcc)",
        check_num: 2,
        check_read_only: "0.0.0.0",
        check_string: "sdfdsfsdf",
        check_url: "[null](http://sdfsfdsdfdsf)",
      };
      const newProps = Object.assign({}, props, {
        isCreate: true,
        allowContinueCreate: true,
        tagsList: {
          基本信息: ["timeline"],
          默认属性: ["deviceId", "_agentStatus", "_agentHeartBeat"],
        },
      });
      const wrapper = mount(<InstanceModelAttributeForm {...newProps} />);
      const instance = wrapper
        .find(ModelAttributeForm)
        .instance() as ModelAttributeForm;

      const checkBox = wrapper
        .find(ModelAttributeForm)
        .find(Checkbox)
        .find('input[type="checkbox"]');

      checkBox.simulate("change", {
        target: {
          checked: true,
        },
      });
      wrapper.update();

      await new Promise((resolve) => setImmediate(resolve));

      wrapper.update();
      expect(instance.submitBtnText).toBe(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.SAVE}`)
      );
      instance.props.form.validateFields = jest
        .fn()
        .mockImplementation(
          (callback: (err: boolean, value: Record<string, any>) => void) => {
            callback(false, values);
          }
        );

      const submitBtn = wrapper.find("button[type='submit']");

      submitBtn.simulate("submit", {
        preventDefault: jest.fn(),
      });

      expect(instance.state.sending).toBeTruthy();

      await new Promise((resolve) => setImmediate(resolve));
      expect(props.onSubmit).toBeCalledWith({
        continueCreating: true,
        values: newValues,
      });
      expect(instance.state.sending).toBeFalsy();
    });
  });

  it("should work", () => {
    const wrapper = mount(
      <InstanceModelAttributeForm
        {...Object.assign({}, props, {
          isCreate: false,
          fieldsByTag: [
            {
              name: "基本信息",
              fields: ["_agentHeartBeat", "_agentStatus"],
            },
          ],
        })}
      />
    );
    const instance = wrapper
      .find(ModelAttributeForm)
      .instance() as ModelAttributeForm;
    expect(instance.submitBtnText).toBe(
      i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.MODIFICATION}`)
    );
    expect(instance.state.sending).toBeFalsy();

    wrapper.find("Button").at(1).simulate("click");
    expect(props.onCancel).toHaveBeenCalled();
  });

  it("test blackList", () => {
    const form = {
      getFieldDecorator: () => (comp: React.Component) => comp,
      getFieldsValue: () => {},
      validateFields: jest.fn(),
      resetFields: jest.fn(),
      getFieldsError: jest.fn(() => []),
    };
    const wrapper = shallow(
      <ModelAttributeForm
        form={form as any}
        {...Object.assign({}, props, {
          blackList: ["_agentHeartBeat", "_agentStatus"],
          basicInfoAttrList: [
            {
              id: "_agentHeartBeat",
              name: "agent心跳",
              protected: true,
              custom: "true",
              unique: "false",
              readonly: "false",
              required: "false",
              tag: ["默认属性"],
              description: "",
              tips: "",
              value: {
                type: "int",
                regex: null,
                default_type: "value",
                default: -1,
                struct_define: [],
                mode: "",
                prefix: "",
                start_value: 0,
                series_number_length: 0,
              },
              wordIndexDenied: false,
            },
            {
              id: "_agentStatus",
              name: "agent状态",
              protected: true,
              custom: "true",
              unique: "false",
              readonly: "false",
              required: "false",
              tag: ["默认属性"],
              description: "",
              tips: "",
              value: {
                type: "enum",
                regex: ["未安装", "异常", "正常"],
                default_type: "",
                default: "未安装",
                struct_define: [],
                mode: "",
                prefix: "",
                start_value: 0,
                series_number_length: 0,
              },
              wordIndexDenied: false,
            },
            {
              id: "deviceId",
              name: "设备ID",
              protected: true,
              custom: "true",
              unique: "true",
              readonly: "true",
              required: "false",
              tag: ["默认属性"],
              description: "",
              tips: "",
              value: {
                type: "str",
                regex: null,
                default_type: "function",
                default: "guid()",
                struct_define: [],
                mode: "default",
                prefix: "",
                start_value: 0,
                series_number_length: 0,
              },
              wordIndexDenied: false,
            },
          ],
        })}
      />
    );
    expect(
      wrapper.findWhere((n) => n.prop("label") === "agent状态").length
    ).toBe(0);
  });
});
