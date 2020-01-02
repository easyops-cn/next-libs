import React from "react";
import { shallow } from "enzyme";
import { GeneralEditor } from "./GeneralEditor";

describe("GeneralEditor", () => {
  it("should work", () => {
    const wrapper = shallow(<GeneralEditor value="{}" />);
    expect(wrapper.prop("value")).toBe("{}");
    expect(wrapper.prop("mode")).toBe("json");
  });

  it("should work for yaml", () => {
    const wrapper = shallow(<GeneralEditor value="a: b" useYaml />);
    expect(wrapper.prop("mode")).toBe("yaml");
  });
});
