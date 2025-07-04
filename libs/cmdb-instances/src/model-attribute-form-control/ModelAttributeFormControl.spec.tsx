import React from "react";
import { mount, shallow } from "enzyme";
import i18n from "i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";
import {
  FormControl,
  FormControlTypeEnum,
  ModelAttributeFormControl,
  ModelAttributeFormControlProps,
  ModelAttributeFormControlState,
  ModelAttributeValueType,
} from "./ModelAttributeFormControl";
import {
  mockFetchCmdbInstanceDetailReturnValue,
  mockFetchCmdbObjectDetailReturnValue,
  mockFetchCmdbObjectDetailReturnValueCLuster,
} from "../__mocks__/";
import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { Input, InputNumber, Radio, Select } from "antd";
import { CodeEditor } from "@next-libs/code-editor-components";
import * as kit from "@next-core/brick-kit";

/* eslint-disable @typescript-eslint/naming-convention */
jest.mock("../i18n");
jest.spyOn(i18n, "t").mockReturnValue("");

const flags: Record<string, boolean> = {};
jest.spyOn(kit, "getRuntime").mockReturnValue({
  getFeatureFlags: () => flags,
} as any);

describe("ModelAttributeFormControl", () => {
  const attribute: Partial<CmdbModels.ModelObjectAttr> =
    mockFetchCmdbObjectDetailReturnValue.attrList[0];

  const Props: ModelAttributeFormControlProps = {
    onChange: () => null,
    attribute,
  };
  const wrapper = shallow(<ModelAttributeFormControl {...Props} />);
  const instance = wrapper.instance() as ModelAttributeFormControl;

  describe("test computeFormControlType function", () => {
    const computeFormControlType =
      ModelAttributeFormControl.computeFormControlType;
    it("should return 'text'", () => {
      const result = computeFormControlType({
        value: {
          type: "str",
        },
      });

      expect(result).toEqual(FormControlTypeEnum.TEXT);
    });

    it("should return 'textarea' when type equal 'str' and mode equal 'multiple-lines'", () => {
      const result = computeFormControlType({
        value: {
          type: "str",
          mode: "multiple-lines",
        },
      });

      expect(result).toEqual(FormControlTypeEnum.TEXTAREA);
    });

    it("should return 'url' when type equal 'str' and mode equal 'url'", () => {
      const result = computeFormControlType({
        value: {
          type: "str",
          mode: "url",
        },
      });
      expect(result).toEqual(FormControlTypeEnum.URL);
    });

    it("should return 'textarea' when type equal 'str' and mode equal 'markdown'", () => {
      const result = computeFormControlType({
        value: {
          type: "str",
          mode: "markdown",
        },
      });

      expect(result).toEqual(FormControlTypeEnum.MARKDOWN);
    });

    it("should return 'textarea' when type equal 'str' and mode equal 'xml'", () => {
      const result = computeFormControlType({
        value: {
          type: "str",
          mode: "xml" as any,
        },
      });

      expect(result).toEqual(FormControlTypeEnum.XML_EDITOR);
    });

    it("should return 'number' when type equal 'int'", () => {
      const result = computeFormControlType({
        value: {
          type: "int",
        },
      });

      expect(result).toEqual(FormControlTypeEnum.NUMBER);
    });

    it("should return 'number' when type equal 'float'", () => {
      const result = computeFormControlType({
        value: {
          type: "float",
        },
      });

      expect(result).toEqual(FormControlTypeEnum.NUMBER);
    });

    it("should return 'date'", () => {
      const result = computeFormControlType({
        value: {
          type: "date",
        },
      });

      expect(result).toEqual(FormControlTypeEnum.DATE);
    });

    it("should return 'datetime'", () => {
      const result = computeFormControlType({
        value: {
          type: "datetime",
        },
      });

      expect(result).toEqual(FormControlTypeEnum.DATETIME);
    });

    it("should return 'tags' when type equal 'arr'", () => {
      const result = computeFormControlType({
        value: {
          type: "arr",
        },
      });

      expect(result).toEqual(FormControlTypeEnum.TAGS);
    });

    it("should return 'legacy-struct'", () => {
      const result = computeFormControlType({
        value: {
          type: "struct",
          struct_define: [
            {
              id: "name",
              name: "名称",
              protected: true,
              regex: null,
              type: "str",
            },
          ],
        },
      });

      expect(result).toEqual(FormControlTypeEnum.LEGACY_STRUCT);
    });

    it("should throw error when struct_define is empty array", () => {
      expect(() => {
        computeFormControlType({
          name: "some name",
          value: {
            type: "struct",
            struct_define: [],
          },
        });
      }).toThrowError(
        // new Error("请在资源模型中添加结构体属性, 属性: some name")
        new Error(
          i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.STRUCT_ERROR_TIP}`, {
            attribute: "some name",
          })
        )
      );
    });

    it("should be error when type equal 'enum' and regex equal 'undefined' || 'length===0", () => {
      expect(() => {
        computeFormControlType({
          name: "some name",
          value: {
            type: "enum",
          },
        });
      }).toThrowError(
        // new Error("请在资源模型管理中添加枚举值, 属性: some name")
        new Error(
          i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ENUM_ERROR_TIP}`, {
            attribute: "some name",
          })
        )
      );

      expect(() => {
        computeFormControlType({
          name: "some name",
          value: {
            type: "enum",
            regex: null,
          },
        });
      }).toThrowError(
        // new Error("请在资源模型管理中添加枚举值, 属性: some name")
        new Error(
          i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ENUM_ERROR_TIP}`, {
            attribute: "some name",
          })
        )
      );

      expect(() => {
        computeFormControlType({
          name: "some name",
          value: {
            type: "enum",
            regex: [],
          },
        });
      }).toThrowError(
        // new Error("请在资源模型管理中添加枚举值, 属性: some name")
        new Error(
          i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.ENUM_ERROR_TIP}`, {
            attribute: "some name",
          })
        )
      );
    });

    it("should return 'radio' when type equal 'enum' and regex array length<=5", () => {
      const result = computeFormControlType({
        value: {
          type: "enum",
          regex: ["未安装", "异常", "正常"],
        },
      });
      expect(result).toEqual(FormControlTypeEnum.RADIO);
    });

    it("should return 'select' when type equal 'enum' and regex array length>5", () => {
      const result = computeFormControlType({
        value: {
          type: "enum",
          regex: ["未安装", "异常", "正常", "test", "test2", "test3"],
        },
      });
      expect(result).toEqual(FormControlTypeEnum.SELECT);
    });

    it("should return 'select' when type equal 'enums'", () => {
      const result = computeFormControlType({
        value: {
          type: "enums",
          regex: ["a", "b", "c", "d"],
        },
      });
      expect(result).toEqual(FormControlTypeEnum.SELECT);
    });

    it("should return 'select' when type equal 'bool'", () => {
      const result = computeFormControlType({
        value: {
          type: "bool",
        },
      });
      expect(result).toEqual(FormControlTypeEnum.SELECT);
    });

    it("should return 'struct'", () => {
      const result = computeFormControlType({
        value: {
          type: "structs",
          struct_define: [
            {
              id: "name",
              name: "名称",
              protected: true,
              regex: null,
              type: "str",
            },
          ],
        },
      });

      expect(result).toEqual(FormControlTypeEnum.STRUCT);
    });

    it("should throw error when type equal 'structs' and struct_define is empty array", () => {
      expect(() => {
        computeFormControlType({
          name: "some name",
          value: {
            type: "structs",
            struct_define: [],
          },
        });
      }).toThrowError(
        // new Error("请在资源模型中添加结构体属性, 属性: some name")
        new Error(
          i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.STRUCT_ERROR_TIP}`, {
            attribute: "some name",
          })
        )
      );
    });

    it("should throw error when type not in FormControlTypeEnum", () => {
      expect(() => {
        computeFormControlType({
          value: {
            // @ts-ignore
            type: "test",
          },
        });
      }).toThrowError(
        new Error(
          i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.TYPE_NO_SUPPORT_EDIT}`, {
            type: "test",
          })
        )
      );
    });
  });

  describe("test computeFormControlItems fn", () => {
    it("should return 'FormControlSelectItem[]' when type not equal enum", () => {
      const result = instance.computeFormControlItems(
        mockFetchCmdbObjectDetailReturnValue.attrList[1]
      );
      const data = [
        {
          id: "未安装",
          text: "未安装",
        },
        {
          id: "异常",
          text: "异常",
        },
        {
          id: "正常",
          text: "正常",
        },
      ];
      expect(result).toEqual(data);
    });

    it("should return 'FormControlSelectItem[]' when type not equal enums", () => {
      const result = instance.computeFormControlItems(
        mockFetchCmdbObjectDetailReturnValue.attrList[7]
      );
      const data = [
        {
          id: "a",
          text: "a",
        },
        {
          id: "b",
          text: "b",
        },
        {
          id: "c",
          text: "c",
        },
        {
          id: "d",
          text: "d",
        },
      ];
      expect(result).toEqual(data);
    });

    it("should return 'undefined' when type not equal enum", () => {
      const result = instance.computeFormControlItems(
        mockFetchCmdbObjectDetailReturnValue.attrList[0]
      );

      expect(result).toBeUndefined();
    });

    it("should return 开发/测试/预发布/生产 instead of 0/1/2/3", () => {
      const result = instance.computeFormControlItems(
        mockFetchCmdbObjectDetailReturnValueCLuster.attrList[1],
        true
      );
      const data = [
        {
          id: "0",
          text: "DEV",
        },
        {
          id: "1",
          text: "TEST",
        },
        {
          id: "2",
          text: "PROD",
        },
        {
          id: "3",
          text: "PRE_RELEASE",
        },
      ];
      expect(result).toEqual(data);
    });
  });

  describe("test computePlaceholder fn", () => {
    const computePlaceholder = ModelAttributeFormControl.computePlaceholder;

    it("should return '点击选择' when formControl.type equal 'select'", () => {
      const formControl: FormControl = {
        id: "fake_id",
        type: FormControlTypeEnum.SELECT,
        name: "fake_name",
      };

      const result = computePlaceholder(formControl);
      // expect(result).toEqual("点击选择");
      expect(result).toEqual(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_SELECT}`)
      );
    });

    it("should return '点击选择' when formControl.type equal 'datetime' or 'date'", () => {
      const formControl: FormControl = {
        id: "fake_id",
        type: FormControlTypeEnum.DATETIME,
        name: "fake_name",
      };

      const result = computePlaceholder(formControl);
      // expect(result).toEqual("点击选择");
      expect(result).toEqual(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_SELECT}`)
      );
    });

    it("should return '输入多个，以回车间隔' when formControl.type equal 'tags'", () => {
      const formControl: FormControl = {
        id: "fake_id",
        type: FormControlTypeEnum.TAGS,
        name: "fake_name",
      };

      const result = computePlaceholder(formControl);
      // expect(result).toEqual("输入多个，以回车间隔");
      expect(result).toEqual(
        i18n.t(
          `${NS_LIBS_CMDB_INSTANCES}:${K.ENTER_MULTIPLE_STRING_WITH_ENTER_KEY_AS_THE_SEPARATOR}`
        )
      );
    });

    it("should return '点击选择' when formControl.type equal 'select'", () => {
      const formControl: FormControl = {
        id: "fake_id",
        type: FormControlTypeEnum.SELECT,
        name: "fake_name",
      };

      const result = computePlaceholder(formControl);
      // expect(result).toEqual("点击选择");
      expect(result).toEqual(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLICK_TO_SELECT}`)
      );
    });
    it("should return '例如：192.168.100.1' when formControl.id === 'ip' && formControl.name === 'ip'", () => {
      const formControl: FormControl = {
        id: "ip",
        type: FormControlTypeEnum.TEXT,
        name: "ip",
      };

      const result = computePlaceholder(formControl);
      // expect(result).toEqual("例如：192.168.100.1");
      expect(result).toEqual(
        i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.IP_PLACEHOLDER}`)
      );
    });
  });

  describe("test computeFormControl fn", () => {
    const computeFormControl = instance.computeFormControl;
    const attribute = Object.assign({}, Props.attribute, {
      value: {
        type: "structs",
        struct_define: [
          {
            id: "name",
            name: "名称",
            protected: true,
            regex: null,
            type: "str",
          },
        ],
      },
    });

    it("should return result and result.maxlength equal 1", () => {
      const result = computeFormControl(attribute, "HOST");
      expect(result.maxlength).toBe(1);
    });
  });

  describe("test computePattern fn", () => {
    it("should return regExp ", () => {
      const attribute = Object.assign(Props.attribute, {
        value: {
          regex: ["选中", "未选中"],
        },
      });
      const result = ModelAttributeFormControl.computePattern(attribute);
      const regExp = new RegExp(attribute.value.regex as string, "u");
      expect(result).toEqual(regExp);
    });

    it("should return undefined", () => {
      const attribute = Object.assign(Props.attribute, {
        value: {
          type: ModelAttributeValueType.ENUM,
          regex: ["选中", "未选中"],
        },
      });
      const result = ModelAttributeFormControl.computePattern(attribute);
      expect(result).toBeUndefined();
    });
  });

  /*  describe("test getDerivedStateFromProps fn", () => {
    const nextProps = {};

    it("should return value", () => {
      const nextProps = {
        value: "fake_value"
      };

      const result = ModelAttributeFormControl.getDerivedStateFromProps(
        nextProps
      );
      expect(result).toEqual({ ...new String(nextProps.value) });
    });

    it("should return undefined when value not in nextProps", () => {
      const nextProps = {};
      const result = ModelAttributeFormControl.getDerivedStateFromProps(
        nextProps
      );
      expect(result).toBeNull();
    });
  });*/

  it("should work", () => {
    instance.setState({
      errorMessage: null,
      formControl: instance.computeFormControl(instance.props.attribute),
    });

    expect(instance.props.attribute).toEqual(Props.attribute);
  });

  it("should called onChange fn when formControl.type equal 'string'", async () => {
    const onChange = jest.fn();
    const event = {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      preventDefault() {},
      target: { value: "the-value" },
    };
    const attribute: Partial<CmdbModels.ModelObjectAttr> =
      mockFetchCmdbObjectDetailReturnValue.attrList[2];
    const props = Object.assign(Props, { attribute, onChange });
    const wrapper = shallow(<ModelAttributeFormControl {...props} />);

    const spyOnTextChange = jest.spyOn(
      wrapper.instance() as ModelAttributeFormControl,
      "onChange"
    );
    wrapper.update();
    const inputEl = wrapper.find(Input);
    expect(inputEl.exists()).toBeTruthy();
    inputEl.simulate("change", event);

    expect(spyOnTextChange).toHaveBeenCalledWith(event);
  });

  it("should show tags mode 'Select' when formControl.type equal 'string' and isSupportMultiStringValue is true", async () => {
    const onChange = jest.fn();
    const attribute: Partial<CmdbModels.ModelObjectAttr> =
      mockFetchCmdbObjectDetailReturnValue.attrList[2];
    const props = { attribute, isSupportMultiStringValue: true, onChange };
    const wrapper = shallow(<ModelAttributeFormControl {...props} />);

    const inputEl = wrapper.find(Select);
    expect(inputEl.prop("mode")).toBe("tags");
    const newValue = ["a"];
    inputEl.invoke("onChange")(newValue, { label: "a", value: "a" });

    expect(onChange).toHaveBeenCalledWith(newValue);
  });

  it("should show '<InputNumber>' when formControl.type equal 'number'", () => {
    const value = 2;
    const onChange = jest.fn();
    const event = {
      target: {
        value: "100",
      },
    };
    const attribute: Partial<CmdbModels.ModelObjectAttr> = {
      id: "jjj",
      name: "型号3",
      protected: false,
      custom: "false",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "int",
        regex: null,
        default_type: "value",
        default: 0,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0,
      },
      wordIndexDenied: false,
    };

    const props = Object.assign(Props, { attribute, onChange, value });
    const wrapper = mount(<ModelAttributeFormControl {...props} />);
    const sypOnChange = jest.spyOn(
      wrapper.instance() as ModelAttributeFormControl,
      "onChange"
    );
    wrapper.update();
    const inputNumberEl = wrapper.find(InputNumber);

    expect(inputNumberEl.exists()).toBeTruthy();
    expect(inputNumberEl.props().value).toEqual(value);

    inputNumberEl
      .find("input.ant-input-number-input")
      .at(0)
      .simulate("change", event);
    expect(sypOnChange).toHaveBeenLastCalledWith(100);
  });

  it("should show 'TextArea' when formControl.type equal 'textarea'", () => {
    const value = "fake value";

    const onChange = jest.fn();
    const event = {
      target: {
        value: "test value",
      },
    };

    const attribute: Partial<CmdbModels.ModelObjectAttr> = {
      id: "textareaID",
      name: "textareaMultiple",
      protected: false,
      custom: "false",
      unique: "false",
      readonly: "false",
      required: "true",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "str",
        regex: null,
        default_type: "value",
        default: null,
        struct_define: [],
        mode: "multiple-lines",
        prefix: "",
        start_value: 0,
        series_number_length: 0,
      },
      wordIndexDenied: false,
    };

    const props = Object.assign(Props, { attribute, onChange, value });

    const wrapper = mount(<ModelAttributeFormControl {...props} />);
    const sypOnChange = jest.spyOn(
      wrapper.instance() as ModelAttributeFormControl,
      "onChange"
    );
    wrapper.update();
    const textArea = wrapper.find("textarea[id='textareaID']");

    expect(textArea.exists()).toBeTruthy();
    expect(textArea.props().value).toEqual(value);

    textArea.simulate("change", event);

    expect(sypOnChange).toBeCalled();
  });

  it("should return 'select' when type equal to 'select'", () => {
    const value: any = null;

    const onChange = jest.fn();

    const attribute: Partial<CmdbModels.ModelObjectAttr> = {
      id: "_environment",
      name: "主机环境",
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
        regex: ["无", "开发", "测试", "预发布", "生产", "灾备"],
        default_type: "",
        default: null,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0,
      },
      wordIndexDenied: false,
    };

    const props = Object.assign(Props, { attribute, onChange, value });

    const wrapper = mount(<ModelAttributeFormControl {...props} />);
    const sypOnChange = jest.spyOn(
      wrapper.instance() as ModelAttributeFormControl,
      "onChange"
    );
    wrapper.update();

    const selectNode = wrapper.find(Select);

    expect(selectNode.exists()).toBeTruthy();
    expect(selectNode.props().value).toEqual(value || []);

    selectNode.props().onChange("fake_value", expect.anything());

    expect(sypOnChange).toBeCalled();
  });

  it("should show 'radio' when formControl.type equal 'radio'", async () => {
    const onChange = jest.fn();
    const attribute: Partial<CmdbModels.ModelObjectAttr> =
      mockFetchCmdbObjectDetailReturnValue.attrList[1];
    const value = mockFetchCmdbInstanceDetailReturnValue[attribute.id];

    const props = Object.assign(Props, {
      value,
      attribute,
      onChange,
    });

    const wrapper = mount(<ModelAttributeFormControl {...props} />);
    wrapper.update();
    const radioEl = wrapper.find(Radio);

    expect(radioEl.exists()).toBeTruthy();
    expect(radioEl.at(0).text()).toEqual(value);
    expect(
      radioEl.at(0).find("input[type='radio']").props().checked
    ).toBeTruthy();
    expect(
      radioEl.at(1).find("input[type='radio']").props().checked
    ).toBeFalsy();

    const event: any = {
      target: {
        value: mockFetchCmdbObjectDetailReturnValue.attrList[1].value.regex[1],
      },
    };
    wrapper.find(Radio.Group).props().onChange(event);
    wrapper.update();
    await jest.runAllTimers();

    expect((wrapper.state() as ModelAttributeFormControlState).value).toEqual(
      mockFetchCmdbObjectDetailReturnValue.attrList[1].value.regex[1]
    );
    expect(
      (
        radioEl
          .at(0)
          .find("input[type='radio']")
          .getDOMNode() as HTMLInputElement
      ).checked
    ).toBeFalsy();
    expect(
      (
        radioEl
          .at(1)
          .find("input[type='radio']")
          .getDOMNode() as HTMLInputElement
      ).checked
    ).toBeTruthy();
  });

  describe("test tags", () => {
    it("should show 'tags' when formControl.type equal 'tags'", () => {
      const onChange = jest.fn();
      const attribute: Partial<CmdbModels.ModelObjectAttr> =
        mockFetchCmdbObjectDetailReturnValue.attrList[3];
      const value = mockFetchCmdbInstanceDetailReturnValue[attribute.id];
      const props = Object.assign(Props, {
        value,
        attribute,
        onChange,
      });

      const wrapper = mount(<ModelAttributeFormControl {...props} />);
      wrapper.update();
      const options = wrapper.find("span.ant-select-selection-item");
      const spyOnChange = jest.spyOn(
        wrapper.instance() as ModelAttributeFormControl,
        "onChange"
      );

      // ant select li 默认会多一个li
      expect(options).toHaveLength(value.length);
      wrapper
        .find(Select)
        .props()
        .onChange(["biaoqian", "和东方红"], expect.anything());
      expect(spyOnChange).toBeCalledWith(["biaoqian", "和东方红"]);
    });

    it("should not have 'Option' when props.value tobe null", () => {
      const onChange = jest.fn();
      const attribute: Partial<CmdbModels.ModelObjectAttr> =
        mockFetchCmdbObjectDetailReturnValue.attrList[3];
      const value = "";
      const props = Object.assign(Props, {
        value,
        attribute,
        onChange,
      });

      const wrapper = mount(<ModelAttributeFormControl {...props} />);
      wrapper.update();
      const options = wrapper.find("span.ant-select-selection-item");
      // ant select li 默认会多一个li
      expect(options).toHaveLength(0);
    });
  });

  it("should change cluster type", () => {
    const onChange = jest.fn();
    const attribute: Partial<CmdbModels.ModelObjectAttr> =
      mockFetchCmdbObjectDetailReturnValueCLuster.attrList[1];
    const value = "";
    const props = Object.assign(Props, {
      value,
      attribute,
      onChange,
      objectId: "CLUSTER",
    });

    const wrapper = mount(<ModelAttributeFormControl {...props} />);
    wrapper.update();
    const options = wrapper.find("Radio");
    expect(options).toHaveLength(4);
    expect(options.get(0).props.children).toEqual("DEV");
    expect(options.get(1).props.children).toEqual("TEST");
    expect(options.get(2).props.children).toEqual("PROD");
    expect(options.get(3).props.children).toEqual("PRE_RELEASE");
  });

  it("should works with url", () => {
    const onChange = jest.fn();
    const attribute: Partial<CmdbModels.ModelObjectAttr> =
      mockFetchCmdbObjectDetailReturnValue.attrList[4];
    const value = "";
    const props = Object.assign(Props, {
      value,
      attribute,
      onChange,
      objectId: "HOST",
    });

    const wrapper = mount(<ModelAttributeFormControl {...props} />);
    wrapper.update();
    const items = wrapper.find("AttributeFormControlUrl");
    expect(items).toHaveLength(1);
  });

  it("should works with json", () => {
    const onChange = jest.fn();
    const attribute: Partial<CmdbModels.ModelObjectAttr> =
      mockFetchCmdbObjectDetailReturnValueCLuster.attrList[2];
    const value = "";
    const props = Object.assign(Props, {
      value,
      attribute,
      onChange,
      objectId: "CLUSTER",
    });

    const wrapper = mount(<ModelAttributeFormControl {...props} />);
    wrapper.update();
    const items = wrapper.find("Input");
    expect(items).toHaveLength(0);
  });

  it("should works with date", () => {
    const onChange = jest.fn();
    const attribute: Partial<CmdbModels.ModelObjectAttr> =
      mockFetchCmdbObjectDetailReturnValueCLuster.attrList[3];
    const value = "";
    const props = Object.assign(Props, {
      value,
      attribute,
      onChange,
      objectId: "CLUSTER",
    });

    const wrapper = mount(<ModelAttributeFormControl {...props} />);
    wrapper.update();
    const items = wrapper.find("Picker");
    expect(items).toHaveLength(2);
  });

  it("should works with datetime", () => {
    const onChange = jest.fn();
    const attribute: Partial<CmdbModels.ModelObjectAttr> =
      mockFetchCmdbObjectDetailReturnValueCLuster.attrList[4];
    const value = "";
    const props = Object.assign(Props, {
      value,
      attribute,
      onChange,
      objectId: "CLUSTER",
    });

    const wrapper = mount(<ModelAttributeFormControl {...props} />);
    wrapper.update();
    const items = wrapper.find("Picker");
    expect(items).toHaveLength(2);
  });

  it("should works with struct", () => {
    const onChange = jest.fn();
    const attribute: Partial<CmdbModels.ModelObjectAttr> =
      mockFetchCmdbObjectDetailReturnValueCLuster.attrList[5];
    const value = "";
    const props = Object.assign(Props, {
      value,
      attribute,
      onChange,
      objectId: "CLUSTER",
    });

    const wrapper = mount(<ModelAttributeFormControl {...props} />);
    wrapper.update();
    const items = wrapper.find("AddStruct");
    expect(items).toHaveLength(1);
  });
  it("should works with json validate", () => {
    const jsonValidateCollection = jest.fn();
    const attribute: Partial<CmdbModels.ModelObjectAttr> =
      mockFetchCmdbObjectDetailReturnValueCLuster.attrList[2];
    const value = "";
    const props = Object.assign(Props, {
      value,
      attribute,
      jsonValidateCollection,
      objectId: "CLUSTER",
    });
    const wrapper = mount(<ModelAttributeFormControl {...props} />);
    wrapper.update();
    wrapper.find(CodeEditor).at(0).invoke("onChange")("100");
    wrapper.find(CodeEditor).at(0).invoke("onValidate")([
      {
        column: 0,
        row: 0,
        text: "Unexpected 's'",
        type: "error",
      },
    ]);
    expect(jsonValidateCollection).toBeCalled();
  });
});
