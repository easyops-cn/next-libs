import React from "react";
import { mount } from "enzyme";
import { Form } from "antd";
import { SketchPicker } from "react-color";
import {
  ColorEditorItem,
  ColorPick,
  getDefaultPresetColors,
} from "./ColorEditorItem";

jest.mock("react-color");

describe("ColorEditor", () => {
  jest.spyOn(window, "getComputedStyle").mockReturnValue({
    getPropertyValue: () => {
      return "#e8e8e8";
    },
  } as any);

  it("ColorEditorItem should work", () => {
    const wrapper = mount(
      <Form>
        <ColorEditorItem name="color" label="颜色" />
      </Form>
    );

    expect(wrapper.find(".popover").length).toEqual(0);
    wrapper.find(".colorCube").simulate("click");

    wrapper.update();
    expect(wrapper.find(".popover").length).toEqual(1);

    // @ts-ignore
    wrapper.find(SketchPicker).invoke("onChangeComplete")({
      hex: "#e9e9e9",
      rgb: { r: 11, g: 22, b: 33, a: 0.4 },
    });

    expect(wrapper.find(ColorPick).prop("value")).toEqual(
      "rgba( 11, 22, 33, 0.4)"
    );

    wrapper.find(".cover").simulate("click");
    expect(wrapper.find(".popover").length).toEqual(0);
  });

  it("ColorEditorItem should work with editorPresetColors", () => {
    const editorPresetColors = [
      "var(--theme-blue-background)",
      "#4891B0",
      { title: "testColor1", color: "rgba( 20, 25, 30, 0.3)" },
      { title: "testColor2", color: "var(--theme-orange-border-color)" },
    ];

    const wrapper = mount(
      <Form>
        <ColorEditorItem
          name="color"
          label="颜色"
          editorPresetColors={editorPresetColors}
        />
      </Form>
    );

    expect(wrapper.find(".popover").length).toEqual(0);
    wrapper.find(".colorCube").simulate("click");

    wrapper.update();
    expect(wrapper.find(".popover").length).toEqual(1);

    // @ts-ignore
    wrapper.find(SketchPicker).invoke("onChangeComplete")({
      hex: "#e9e9e9",
      rgb: { r: 11, g: 22, b: 33, a: 0.4 },
    });

    expect(wrapper.find(ColorPick).prop("value")).toEqual(
      "rgba( 11, 22, 33, 0.4)"
    );

    wrapper.find(".cover").simulate("click");
    expect(wrapper.find(".popover").length).toEqual(0);
  });
});

describe("getPresetColors", () => {
  jest.spyOn(window, "getComputedStyle").mockReturnValue({
    getPropertyValue: (color: string | number) => {
      const colorMap: Record<string, string> = {
        "--theme-green-color": "#eaf8ec",
        "--theme-green-border-color": "#97e0ad73",
        "--theme-red-border-color": "#fda7a173",
        "--theme-blue-background": "#ebf3fd",
        "--theme-orange-border-color": "#ffd09a73",
      };
      return colorMap[color];
    },
  } as any);
  it("should return color list", () => {
    const colorMap = {
      green: {
        color: "var(--theme-green-color)",
        borderColor: "var(--theme-green-border-color)",
      },
      red: {
        borderColor: "var(--theme-red-border-color)",
      },
      blue: {
        background: "var(--theme-blue-background)",
      },
      orange: {
        borderColor: "var(--theme-orange-border-color)",
      },
      gray: {
        borderColor: "var(--theme-gray-background)",
      },
    } as any;
    const result = getDefaultPresetColors(colorMap);
    expect(result).toEqual([
      { color: "#eaf8ec", title: "var(--theme-green-color)" },
      { color: "#97e0ad73", title: "var(--theme-green-border-color)" },
      { color: "#fda7a173", title: "var(--theme-red-border-color)" },
      { color: "#ebf3fd", title: "var(--theme-blue-background)" },
      { color: "#ffd09a73", title: "var(--theme-orange-border-color)" },
    ]);
  });
});
