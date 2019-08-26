import React from "react";
import { mount } from "enzyme";
import {
  InstanceModelAttributeForm,
  ModelAttributeForm
} from "./ModelAttributeForm";
import {
  mockFetchCmdbInstanceDetailReturnValue,
  mockFetchCmdbObjectDetailReturnValue
} from "../__mocks__";
import { Checkbox } from "antd";

/* eslint-disable  */

describe("ModelAttributeForm", () => {
  const props = {
    attributeFormControlInitialValueMap: mockFetchCmdbInstanceDetailReturnValue,
    basicInfoAttrList: mockFetchCmdbObjectDetailReturnValue.attrList,
    objectId: "HOST",
    disabled: false,
    isCreate: true,
    brickList: [
      {
        name: "console-printer",
        label: "使用示例",
        header: "使用示例（根据“参数说明”自动生成）",
        options: {
          theme: "monokai",
          mode: "yaml"
        }
      }
    ],
    onSubmit: jest.fn()
  };

  describe("handleSubmit", () => {
    it("should submit", async () => {
      const values = {
        CHECK_IP2: "sdfsdfs",
        check_array: ["24324"],
        check_enum: "-%none%-",
        check_ip4: "192.168.100.15",
        check_num_readonly: 4,
        name: "sdfsdf",
        check_url2: "[百度哦](http://wwww.baidu.comcc)",
        check_num: 2,
        check_read_only: "0.0.0.0",
        check_string: "sdfdsfsdf",
        check_url: "[null](http://sdfsfdsdfdsf)"
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
        check_url: "[null](http://sdfsfdsdfdsf)"
      };
      const newProps = Object.assign({}, props, {
        isCreate: true,
        allowContinueCreate: true,
        tagsList: {
          基本信息: ["timeline"],
          默认属性: ["deviceId", "_agentStatus", "_agentHeartBeat"]
        }
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
          checked: true
        }
      });
      wrapper.update();

      await new Promise(resolve => setImmediate(resolve));

      wrapper.update();
      expect(instance.submitBtnText).toBe("保存");
      instance.props.form.validateFields = jest
        .fn()
        .mockImplementation(
          (callback: (err: boolean, value: Record<string, any>) => void) => {
            callback(false, values);
          }
        );

      const submitBtn = wrapper.find("button[type='submit']");

      submitBtn.simulate("submit", {
        preventDefault: jest.fn()
      });

      expect(instance.state.sending).toBeTruthy();

      await new Promise(resolve => setImmediate(resolve));
      expect(props.onSubmit).toBeCalledWith({
        continueCreating: true,
        values: newValues
      });
      expect(instance.state.sending).toBeFalsy();
    });
  });

  it("should work", () => {
    const wrapper = mount(
      <InstanceModelAttributeForm
        {...Object.assign({}, props, { isCreate: false })}
      />
    );
    const instance = wrapper
      .find(ModelAttributeForm)
      .instance() as ModelAttributeForm;
    expect(instance.submitBtnText).toBe("修改");
    expect(instance.state.sending).toBeFalsy();
  });
});
