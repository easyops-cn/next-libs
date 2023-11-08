import React from "react";
import { shallow } from "enzyme";
import { FloatDisplayBrick, floatMaxLengthMatch } from "./FloatDisplayBrick";
import { Tooltip } from "antd";

describe("FloatDisplayBrick", () => {
  it.each([
    ["1.02", "1.02"],
    ["2.333322311", "2.3333"],
    ["1234567.1234567", "1234567.1234"],
    ["2.33466", "2.3346"],
    ["-2.33466", "-2.3346"],
    ["-123456.1234567", "-123456.1234"],
    ["", undefined],
  ])("regex should work ", (value, expected) => {
    const result = floatMaxLengthMatch(value);
    expect(result).toBe(expected);
  });
  it("should work", () => {
    const wrapper = shallow(<FloatDisplayBrick floatValue={1.02} />);
    expect(wrapper.find("span").text()).toBe("1.02");
    wrapper.setProps({
      floatValue: 2.999929999,
    });
    wrapper.update();
    expect(wrapper.find(Tooltip).prop("title")).toBe(2.999929999);
    expect(wrapper.find("span").text()).toBe("2.9999");
    wrapper.setProps({
      floatValue: undefined,
    });
    wrapper.update();
    expect(wrapper.find("span").text()).toBeFalsy();
  });
});
