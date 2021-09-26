import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { AddStructModal, AddStructModalProps } from "./AddStructModal";
import {
  DatePicker,
  Input,
  InputNumber,
  Radio,
  Select,
  Modal,
  Form,
} from "antd";
import moment from "moment";
import { attribute, structData, attributeWithRegex } from "./mockData";
import { CodeEditor } from "@next-libs/code-editor-components";
import { act } from "react-dom/test-utils";

const structDataReturn = {
  ...structData,
  json1: `{
  "test": "666"
}`,
};

describe("AddStructModal", () => {
  const handleStoreFunction = jest.fn();
  const handleCancelFunction = jest.fn();
  const props = {
    structData,
    attribute,
    handleStoreFunction,
    handleCancelFunction,
    visible: true,
  };
  let wrapper: ReactWrapper;
  beforeEach(() => {
    wrapper = mount(<AddStructModal {...props} />);
  });

  afterEach(() => {
    handleStoreFunction.mockClear();
    handleCancelFunction.mockClear();
  });

  it("should init addStructModal", () => {
    expect(wrapper).toBeTruthy();
  });

  it("should call the cancel function", () => {
    wrapper.find(Modal).invoke("onCancel")(null);
    expect(handleCancelFunction).toBeCalled();
    expect(handleStoreFunction).not.toBeCalled();
  });

  it("should call the store function", async () => {
    wrapper.find(Modal).invoke("onOk")(null);
    await (global as any).flushPromises();
    expect(handleCancelFunction).not.toBeCalled();
    expect(handleStoreFunction).toBeCalledWith(structDataReturn);
  });

  it.each([
    [
      "str",
      {
        name: "str",
        changeValue: "newString",
        returnValue: "newString",
        component: Input,
      },
    ],
    [
      "int",
      {
        name: "int",
        changeValue: 1234,
        returnValue: 1234,
        component: InputNumber,
      },
    ],
    [
      "enum (length < 6)",
      {
        name: "enum1",
        changeValue: "9",
        returnValue: "9",
        component: Radio.Group,
      },
    ],
    [
      "enum (length >= 6)",
      {
        name: "enum2",
        changeValue: "11",
        returnValue: "11",
        component: Select,
      },
    ],
    [
      "enums",
      {
        name: "enums",
        changeValue: ["1", "3", "9"],
        returnValue: ["1", "3", "9"],
        component: Select,
      },
    ],
    [
      "arr",
      {
        name: "arr",
        changeValue: ["a", "b", "c"],
        returnValue: ["a", "b", "c"],
        component: Select,
      },
    ],
    [
      "date",
      {
        name: "date",
        changeValue: moment("2019-01-01"),
        returnValue: "2019-01-01",
        component: DatePicker,
      },
    ],
    [
      "datetime",
      {
        name: "datetime",
        changeValue: moment("2019-01-01 23:59:59"),
        returnValue: "2019-01-01 23:59:59",
        component: DatePicker,
      },
    ],
    [
      "ip",
      {
        name: "ip",
        changeValue: "192.168.100.119",
        returnValue: "192.168.100.119",
        component: Input,
      },
    ],
    [
      "float",
      {
        name: "float",
        changeValue: 12.345,
        returnValue: 12.345,
        component: InputNumber,
      },
    ],
    [
      "bool",
      {
        name: "bool",
        changeValue: false,
        returnValue: false,
        component: Radio.Group,
      },
    ],
    [
      "json",
      {
        name: "json",
        changeValue: "abcd",
        returnValue: "abcd",
        component: CodeEditor,
      },
    ],
  ])(
    "should work when change the %s value",
    async (type, { name, changeValue, returnValue, component }) => {
      wrapper
        .find(Form.Item)
        .filter({ name })
        .find(component)
        .invoke("onChange")(changeValue);
      wrapper.find(Modal).invoke("onOk")(null);
      await (global as any).flushPromises();
      expect(handleStoreFunction).toBeCalledWith({
        ...structDataReturn,
        [name]: returnValue,
      });
    }
  );
});

describe("AddStructModal test regex", () => {
  const handleStoreFunction = jest.fn();
  const handleCancelFunction = jest.fn();
  const props = {
    attribute: attributeWithRegex,
    handleStoreFunction,
    handleCancelFunction,
    visible: true,
  };
  let wrapper: ReactWrapper;
  beforeEach(() => {
    wrapper = mount(<AddStructModal {...props} />);
  });

  afterEach(() => {
    handleStoreFunction.mockClear();
    handleCancelFunction.mockClear();
  });

  it.each([
    [
      "str",
      {
        name: "str",
        invalidValue: "1245",
        validValue: "abcdd",
        returnValue: "abcdd",
        component: Input,
      },
    ],
    [
      "int",
      {
        name: "int",
        invalidValue: 111,
        validValue: 110,
        returnValue: 110,
        component: InputNumber,
      },
    ],
    [
      "arr",
      {
        name: "arr",
        invalidValue: ["1678", "6782", "6783"],
        validValue: ["6781", "6782", "6783"],
        returnValue: ["6781", "6782", "6783"],
        component: Select,
      },
    ],
    [
      "ip",
      {
        name: "ip",
        invalidValue: "192.168.100",
        validValue: "192.168.100.119",
        returnValue: "192.168.100.119",
        component: Input,
      },
    ],
  ])(
    "regex should work when change the %s value",
    async (
      type,
      { name, invalidValue, validValue, returnValue, component }
    ) => {
      wrapper
        .find(Form.Item)
        .filter({ name })
        .find(component)
        .invoke("onChange")(invalidValue);
      await (global as any).flushPromises();
      const errors = wrapper.find(Form).props().form.getFieldError(name);
      expect(errors.length).not.toBe(0);

      wrapper
        .find(Form.Item)
        .filter({ name })
        .find(component)
        .invoke("onChange")(validValue);
      wrapper.find(Modal).invoke("onOk")(null);
      await (global as any).flushPromises();
      expect(handleStoreFunction).toBeCalledWith({ [name]: returnValue });
    }
  );

  it.each([
    ["enum (length < 6)", { name: "enum1", component: Radio }],
    // ["enum (length >= 6)", { name: "enum2", component: "Option" }],
    // ["enums", { name: "enums", component: "Option" }],
  ])(
    "regex should work when change the %s value",
    async (type, { name, component }) => {
      const options = wrapper.find(Form.Item).filter({ name }).find(component);
      expect(options.length).toBe(
        attributeWithRegex.value.struct_define.find((v) => v.id === name).regex
          .length
      );
    }
  );

  it("JSON schema should work when change the json value", async () => {
    const name = "json";
    wrapper
      .find(Form.Item)
      .filter({ name })
      .find(CodeEditor)
      .invoke("onValidate")([
      {
        column: 0,
        row: 0,
        text: "Unexpected 's'",
        type: "error",
      },
    ]);
    await (global as any).flushPromises();
    const errors = wrapper.find(Form).props().form.getFieldError(name);
    expect(errors.length).not.toBe(0);
  });
});
