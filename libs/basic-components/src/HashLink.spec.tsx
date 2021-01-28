import React from "react";
import { shallow } from "enzyme";
import * as kit from "@next-core/brick-kit";
import { HashLink } from "./HashLink";

jest.spyOn(kit, "getHistory").mockReturnValue({
  createHref: () => "/",
  location: {},
} as any);

describe("HashLink", () => {
  it("should work", () => {
    const wrapper = shallow(<HashLink to="#for-example" />);
    wrapper.simulate("click");
    expect(wrapper.prop("href")).toBe("/#for-example");
  });

  it("should trigger onClick", () => {
    const handleClick = jest.fn();
    const wrapper = shallow(
      <HashLink to="#for-example" onClick={handleClick} />
    );
    wrapper.simulate("click");
    expect(handleClick).toBeCalled();
  });
});
