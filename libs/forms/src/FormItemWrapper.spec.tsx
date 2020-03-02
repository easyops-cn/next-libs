import React from "react";
import { shallow } from "enzyme";
import { Form } from "antd";
import {
  FormItemWrapper,
  getRules,
  getCommonEventMap,
  FormItemWrapperProps
} from "./FormItemWrapper";
import { MenuIcon } from "@easyops/brick-types";
import i18n from "i18next";
import { AbstractGeneralFormElement } from "./interfaces";

jest.mock("./i18n");
jest.spyOn(i18n, "t").mockReturnValue("default message");

describe("FormItemWrapper", () => {
  it("should work without formElement", () => {
    const labelTooltip = {
      content: "这是一个 tooltips",
      icon: {
        lib: "antd",
        type: "question-circle-o"
      } as MenuIcon
    };
    const wrapper = shallow(
      <FormItemWrapper
        name="username"
        label="hello"
        labelTooltip={labelTooltip}
      />
    );

    const Label = () =>
      wrapper.find(Form.Item).prop("label") as React.ReactElement;

    const labelWrapper = shallow(<Label />);
    expect(labelWrapper.text()).toEqual("hello <Tooltip />");
    expect(labelWrapper.find("Tooltip").prop("title")).toEqual(
      "这是一个 tooltips"
    );
  });

  it("should work with formElement", () => {
    const formElement = {
      formUtils: {
        getFieldDecorator: jest.fn().mockReturnValue(jest.fn())
      },
      layout: "horizontal",
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 14
      }
    };
    const wrapper = shallow<FormItemWrapperProps>(
      <FormItemWrapper
        formElement={(formElement as unknown) as AbstractGeneralFormElement}
        name="username"
        label="hello"
        required={true}
      />
    );
    expect(wrapper.find(Form.Item).props()).toMatchObject({
      label: "hello",
      colon: true,
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 14
      }
    });

    // without label
    wrapper.setProps({ label: undefined });
    expect(wrapper.find(Form.Item).props()).toMatchObject({
      label: undefined,
      colon: true,
      wrapperCol: {
        span: 14,
        offset: 4
      }
    });

    // with responsive layout
    wrapper.setProps({
      formElement: ({
        ...formElement,
        labelCol: { xs: 24, md: { span: 12 }, xl: { span: 10, offset: 2 } },
        wrapperCol: { xs: 24, md: { span: 12 }, xl: { span: 10, offset: 2 } }
      } as unknown) as AbstractGeneralFormElement
    });
    expect(wrapper.find(Form.Item).props()).toMatchObject({
      label: undefined,
      colon: true,
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        md: { span: 12, offset: 12 },
        xl: { span: 10, offset: 14 }
      }
    });
  });

  describe("getRules test", () => {
    it("validate with message", () => {
      const props = {
        required: true,
        message: {
          required: "为必填项"
        }
      };

      const result = getRules(props);

      expect(result).toEqual([
        {
          required: true,
          message: "为必填项"
        }
      ]);
    });

    it("validate without message", () => {
      const props = {
        min: 8
      };

      const result = getRules(props);

      expect(result).toEqual([
        {
          min: 8,
          message: "default message"
        }
      ]);
    });

    it("validate pattern", () => {
      const props = {
        pattern: "[\\w+]{6}",
        message: {
          pattern: "至少超过6个字符"
        }
      };
      const result = getRules(props);

      expect(result).toEqual([
        {
          message: "至少超过6个字符",
          pattern: /[\w+]{6}/
        }
      ]);
    });

    it("return empty rule if don't support this validated attribute", () => {
      const props = {
        autofocus: true
      };

      const result = getRules(props);

      expect(result).toEqual([]);
    });

    it("should support custom validated rule", () => {
      const validatorFn = (rule: any, value: string, callback: Function) => {
        if (value === "abc") {
          callback("输入错误");
        } else {
          callback();
        }
      };

      const resut = getRules({
        validator: validatorFn
      });

      expect(resut).toEqual([
        {
          validator: validatorFn
        }
      ]);

      const validatorFn2 = (rule: any, value: string, callback: Function) => {
        if (value === "bcd") {
          callback("输入错误");
        } else {
          callback();
        }
      };

      const result2 = getRules({
        required: true,
        message: {
          required: "此项为必填项"
        },
        validator: [
          {
            validator: validatorFn
          },
          {
            validator: validatorFn2
          }
        ]
      });

      expect(result2).toEqual([
        {
          required: true,
          message: "此项为必填项"
        },
        {
          validator: validatorFn
        },
        {
          validator: validatorFn2
        }
      ]);
    });

    describe("getCommonEventMap test", () => {
      it("should add onFocus event", () => {
        const mockFn = jest.fn();
        const props = {
          onKeyDown: mockFn,
          children: {
            props: {}
          }
        };

        const result = getCommonEventMap(props);

        expect(result).toEqual({
          onKeyDown: mockFn
        });
      });

      it("should not add onFocus event if children props exist", () => {
        const mockFn = jest.fn();
        const childrenFn = jest.fn();
        const props = {
          onKeyDown: mockFn,
          children: {
            props: {
              onKeyDown: childrenFn
            }
          }
        };

        const result = getCommonEventMap(props);

        expect(result).toEqual({});
      });
    });
  });
});
