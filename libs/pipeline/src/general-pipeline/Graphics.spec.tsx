import React from "react";
import { mount, shallow } from "enzyme";
import { Graphics } from "./Graphics";
import { PathData } from "./constants";

const pathData = {
  paths: [],
  pathElements: [],
  d: "M110,105L210,105M210,105L210,205M210,205L252,205Q260,205,260,197L260,155L260,113Q260,105,268,105L310,105",
} as PathData;

describe("Graphics", () => {
  it("should work", () => {
    const wrapper = mount(<Graphics pathData={pathData} />);
    expect(wrapper.find("animateMotion")).toHaveLength(5);
    wrapper.unmount();
  });
});
