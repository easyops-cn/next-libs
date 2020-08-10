import React from "react";
import { mount, ReactWrapper } from "enzyme";
import Icon from "@ant-design/icons";
import { ZoomPanel } from "./ZoomPanel";

describe("ZoomPanel", () => {
  let wrapper: ReactWrapper;

  it("zoom in click should work", () => {
    const onChange = jest.fn();
    wrapper = mount(
      <ZoomPanel
        scale={1.45}
        range={[0.5, 1.5]}
        step={0.05}
        notifyScaleChange={onChange}
      />
    );

    const zoomInIcon = wrapper.find(Icon).at(1);
    zoomInIcon.simulate("click");
    expect(onChange).toBeCalledWith(1.5);
    zoomInIcon.simulate("click");
    expect(onChange).toBeCalledTimes(1);
  });

  it("zoom in click should work", () => {
    const onChange = jest.fn();
    wrapper = mount(
      <ZoomPanel
        scale={0.55}
        range={[0.5, 1.5]}
        step={0.05}
        notifyScaleChange={onChange}
      />
    );

    const zoomOutIcon = wrapper.find(Icon).at(2);
    zoomOutIcon.simulate("click");
    expect(onChange).toBeCalledWith(0.5);
    zoomOutIcon.simulate("click");
    expect(onChange).toBeCalledTimes(1);
  });
});
