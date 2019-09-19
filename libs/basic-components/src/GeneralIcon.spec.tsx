import React from "react";
import { shallow, mount } from "enzyme";
import { GeneralIcon } from "./GeneralIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

describe("GeneralIcon", () => {
  it("should render null if icon is falsy", () => {
    const wrapper = shallow(<GeneralIcon icon={null} />);
    expect(wrapper.html()).toBe(null);
  });

  it("should render antd icon", () => {
    const wrapper = shallow(
      <GeneralIcon icon={{ lib: "antd", type: "up", theme: "filled" }} />
    );
    expect(wrapper).toMatchInlineSnapshot(`
      <Icon
        theme="filled"
        type="up"
      />
    `);
  });

  it("should render font-awesome icon", () => {
    const wrapper = mount(<GeneralIcon icon={{ lib: "fa", icon: "heart" }} />);
    expect(wrapper.find(FontAwesomeIcon).prop("icon")).toBe("heart");
  });

  it("should render null if icon is invalid", () => {
    const wrapper = shallow(<GeneralIcon icon={{ lib: "invalid" } as any} />);
    expect(wrapper.html()).toBe(null);
  });
});
