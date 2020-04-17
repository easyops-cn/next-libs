import React from "react";
import { shallow, mount, ReactWrapper } from "enzyme";
import { ZoomPanel } from "./ZoomPanel";
// import { CustomIcon } from "../../icons/CustomIcon";

describe("ZoomPanel", () => {
  let wrapper: ReactWrapper;

  it("should work", () => {
    wrapper = mount(<ZoomPanel scale={1} range={[0.5, 1.5]} step={0.05} />);
    expect(wrapper).toMatchSnapshot();
  });

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

    const zoomInIcon = wrapper.find(CustomIcon).at(0);
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

    const zoomOutIcon = wrapper.find(CustomIcon).at(1);
    zoomOutIcon.simulate("click");
    expect(onChange).toBeCalledWith(0.5);
    zoomOutIcon.simulate("click");
    expect(onChange).toBeCalledTimes(1);
  });
});
