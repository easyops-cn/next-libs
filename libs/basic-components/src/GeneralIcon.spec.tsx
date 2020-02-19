import React from "react";
import { shallow, mount } from "enzyme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BrickIcon } from "@easyops/brick-icons";
import { GeneralIcon } from "./GeneralIcon";

describe("GeneralIcon", () => {
  it("should render null if icon is falsy", () => {
    const wrapper = shallow(<GeneralIcon icon={null} />);
    expect(wrapper.html()).toBe("");
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

  it("should render easyops icon", () => {
    const wrapper = mount(
      <GeneralIcon icon={{ lib: "easyops", icon: "idc", category: "app" }} />
    );
    expect(wrapper.find(BrickIcon).props()).toMatchObject({
      icon: "idc",
      category: "app"
    });
  });

  it("should render null if icon is invalid", () => {
    const wrapper = shallow(<GeneralIcon icon={{ lib: "invalid" } as any} />);
    expect(wrapper.html()).toBe("");
  });
});
