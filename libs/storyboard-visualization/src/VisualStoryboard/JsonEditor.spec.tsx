import React from "react";
import { shallow } from "enzyme";
import { JsonEditor } from "./JsonEditor";

describe("JsonEditor", () => {
  it("should work", () => {
    const wrapper = shallow(<JsonEditor value="{}" />);
    expect(wrapper.prop("value")).toBe("{}");
  });
});
