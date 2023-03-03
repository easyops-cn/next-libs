import React from "react";
import { Input, Tooltip, Empty, Radio } from "antd";
import { mount, shallow } from "enzyme";
import { typeMatched, VisualPropertyForm } from "./VisualPropertyForm";
import { CodeEditorFormItem } from "./components/CodeEditor/CodeEditorFormItem";
import { act } from "react-dom/test-utils";
import * as brickKit from "@next-core/brick-kit";
import { UnionPropertyType } from "../interfaces";

jest.mock("@next-libs/code-editor-components", () => ({
  CodeEditorItem: function MockEditor(props: any) {
    return <div data-theme={props.theme}>code editor</div>;
  },
}));

jest.mock("@next-libs/forms", () => ({
  IconSelectItem: function MockIconSelect() {
    return <div>icon select editor</div>;
  },
}));

jest.mock("./components/ColorEditor/ColorEditorItem", () => ({
  ColorEditorItem: function ColorEditorItem() {
    return <div>ColorEditorItem</div>;
  },
}));

describe("VisualPropertyForm", () => {
  it("should work", () => {
    const props = {
      brickProperties: {
        name: "lucy",
        palceholder: "<% CTX.placeholder %>",
        age: 123,
        count: "<% CTX.count %>",
        disabled: true,
        required: "<% CTX.required %>",
        value: ["a", "b", "c"],
        fieds: "<%  CTX.fieds %>",
        options: ["a", "b", "c"],
        category: "<% CTX.category %>",
      },
      propertyTypeList: [
        { name: "name", type: "string", description: "名称" },
        { name: "palceholder", type: "string", description: "提示" },
        { name: "count", type: "number", description: "数量" },
        { name: "age", type: "number", description: "年龄" },
        { name: "value", type: "string[]", description: "值" },
        { name: "fieds", type: "string[]", description: "字段" },
        { name: "disabled", type: "boolean", description: "置灰" },
        { name: "required", type: "boolean", description: "必填" },
        { name: "options", type: "OptionProps", description: "下拉选项" },
      ],
      labelIcon: {
        normal: {
          lib: "fa",
          icon: "code",
          prefix: "fas",
          color: "#167be0",
        },
        advanced: {
          lib: "fa",
          icon: "cog",
          prefix: "fas",
          color: "#167be0",
        },
      },
    } as any;

    const wrapper = mount(<VisualPropertyForm {...props} />);

    expect(wrapper.find(Tooltip).at(0).prop("title")).toEqual("名称");
    expect(wrapper.find(Tooltip).at(1).prop("title")).toEqual("提示");
    expect(wrapper.find(Tooltip).at(2).prop("title")).toEqual("数量");
  });

  it("should render empty status", () => {
    const props = {
      brickProperties: {
        name: "lucy",
        palceholder: "<% CTX.placeholder %>",
        age: 123,
        count: "<% CTX.count %>",
        disabled: true,
        required: "<% CTX.required %>",
        value: ["a", "b", "c"],
        fieds: "<%  CTX.fieds %>",
        options: ["a", "b", "c"],
        category: "<% CTX.category %>",
      },
      propertyTypeList: [],
      emptyConfig: {
        description: "no data",
      },
    } as any;

    const wrapper = shallow(<VisualPropertyForm {...props} />);
    expect(wrapper.find(Empty).render().text()).toEqual("no data");
  });

  it("should work with different mode", () => {
    const spyOnUseTheme = jest
      .spyOn(brickKit, "useCurrentTheme")
      .mockReturnValue("dark-v2");
    const props = {
      brickProperties: {
        name: "lucy",
      },
      propertyTypeList: [
        { name: "name", type: "string", description: "名称", group: "basic" },
      ],
      labelIcon: {
        normal: {
          lib: "fa",
          icon: "code",
          prefix: "fas",
          color: "#167be0",
        },
        advanced: {
          lib: "fa",
          icon: "cog",
          prefix: "fas",
          color: "#167be0",
        },
      },
    } as any;

    const wrapper = mount(<VisualPropertyForm {...props} />);

    expect(wrapper.find(Input).length).toEqual(1);
    wrapper.find(".iconContainer").at(0).invoke("onClick")(null);
    expect(wrapper.find(Input).length).toEqual(0);
    expect(wrapper.find("MockEditor").length).toEqual(2);

    wrapper.find(".iconContainer").at(0).invoke("onClick")(null);
    expect(wrapper.find(Input).length).toEqual(1);
    expect(wrapper.find("MockEditor").length).toEqual(1);
    expect(wrapper.find("MockEditor div").prop("data-theme")).toEqual(
      "tomorrow"
    );

    spyOnUseTheme.mockRestore();
  });

  it("should render template params", () => {
    const props = {
      brickProperties: {
        name: "lucy",
      },
      propertyTypeList: [{ name: "name", type: "string", description: "名称" }],
      labelIcon: {
        normal: {
          lib: "fa",
          icon: "code",
          prefix: "fas",
          color: "#167be0",
        },
        advanced: {
          lib: "fa",
          icon: "cog",
          prefix: "fas",
          color: "#167be0",
        },
      },
      brickInfo: {
        type: "template",
      },
    } as any;

    const formRef = React.createRef<any>();

    const wrapper = mount(<VisualPropertyForm {...props} ref={formRef} />);

    wrapper.find(".ant-collapse-header").at(1).simulate("click");
    wrapper.update();

    expect(wrapper.find(CodeEditorFormItem).prop("label")).toEqual(
      "other params"
    );

    wrapper.setProps({
      brickInfo: {
        type: "brick",
      },
    });

    wrapper.update();

    expect(wrapper.find(CodeEditorFormItem).prop("label")).toEqual(
      "other properties"
    );

    act(() => {
      formRef.current.resetPropertyFields();
    });

    expect(wrapper.find(Input).at(0).prop("value")).toEqual("lucy");
  });

  it("should render icon", () => {
    const props = {
      brickProperties: {
        icon: {
          lib: "fa",
          icon: "ad",
          prefix: "fas",
        },
      },
      propertyTypeList: [
        { name: "icon", type: "MenuIcon", description: "图标" },
      ],
      labelIcon: {
        normal: {
          lib: "fa",
          icon: "code",
          prefix: "fas",
          color: "#167be0",
        },
        advanced: {
          lib: "fa",
          icon: "cog",
          prefix: "fas",
          color: "#167be0",
        },
      },
    } as any;

    const wrapper = shallow(<VisualPropertyForm {...props} />);

    expect(wrapper.find("IconSelectFormItem").length).toBe(1);
  });

  it("should render color", () => {
    const props = {
      brickProperties: {
        color: "#e8e8e8",
      },
      propertyTypeList: [{ name: "color", type: "Color", description: "颜色" }],
      labelIcon: {
        normal: {
          lib: "fa",
          icon: "code",
          prefix: "fas",
          color: "#167be0",
        },
        advanced: {
          lib: "fa",
          icon: "cog",
          prefix: "fas",
          color: "#167be0",
        },
      },
    } as any;

    const wrapper = mount(<VisualPropertyForm {...props} />);

    expect(wrapper.find("ColorEditorItem").length).toBe(1);
  });

  it("should render menu", () => {
    const props = {
      brickProperties: [
        {
          menu: "<% APP.getMenu('menu-1') %>",
        },
      ],
      propertyTypeList: [{ name: "menu", type: "Menu", description: "menu" }],
      labelIcon: {
        normal: {
          lib: "fa",
          icon: "code",
          prefix: "fas",
          color: "#167be0",
        },
        advanced: {
          lib: "fa",
          icon: "cog",
          prefix: "fas",
          color: "#167be0",
        },
      },
    } as any;

    const wrapper = mount(<VisualPropertyForm {...props} />);

    expect(wrapper.find("MenuEditorItem").length).toBe(1);
  });

  it("should render color with editor setting", () => {
    const props = {
      brickProperties: {
        color: "#e8e8e8",
      },
      propertyTypeList: [
        {
          name: "color",
          type: "some type",
          description: "颜色",
          editor: "color",
        },
      ],
      labelIcon: {
        normal: {
          lib: "fa",
          icon: "code",
          prefix: "fas",
          color: "#167be0",
        },
        advanced: {
          lib: "fa",
          icon: "cog",
          prefix: "fas",
          color: "#167be0",
        },
      },
    } as any;

    const wrapper = mount(<VisualPropertyForm {...props} />);

    expect(wrapper.find("ColorEditorItem").length).toBe(1);
  });

  it("should render message", () => {
    const props = {
      propertyTypeList: [
        {
          name: "message",
          type: "some ",
          description: "message",
          editor: "message",
        },
      ],
    } as any;

    const wrapper = mount(<VisualPropertyForm {...props} />);

    expect(wrapper.find("MessageEditor").length).toBe(1);
  });

  it("should render radio", () => {
    const props = {
      propertyTypeList: [
        {
          name: "radio",
          type: "some",
          description: "radio",
          editor: "radio",
          editorProps: { options: ["a", "b", "c"] },
        },
      ],
    } as any;

    const wrapper = mount(<VisualPropertyForm {...props} />);

    expect(wrapper.find("Radio").length).toBe(3);
  });

  it("should render radio button", () => {
    const props = {
      propertyTypeList: [
        {
          name: "radio",
          type: "some",
          description: "radio",
          editor: "radio",
          editorProps: {
            optionType: "button",
            options: [
              {
                icon: {
                  lib: "antd",
                  icon: "align-left",
                  theme: "outlined",
                },
                value: "left",
              },
              {
                icon: {
                  lib: "antd",
                  icon: "align-right",
                  theme: "outlined",
                },
                value: "right",
              },
            ],
          },
        },
      ],
    } as any;

    const wrapper = mount(<VisualPropertyForm {...props} />);

    expect(wrapper.find("Radio").length).toBe(2);
    expect(wrapper.find("GeneralIcon").length).toBe(2);
  });

  it("typeMatched should work", () => {
    const result1 = typeMatched("test", {
      type: "string",
    } as UnionPropertyType);
    expect(result1).toBe(true);

    const result2 = typeMatched(123, { type: "string" } as UnionPropertyType);
    expect(result2).toBe(false);
  });
});
