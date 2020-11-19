import React from "react";
import { shallow, mount } from "enzyme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BrickIcon } from "@easyops/brick-icons";
import { GeneralIcon } from "./GeneralIcon";
import { Icon as LegacyIcon } from "@ant-design/compatible";
import Icon from "@ant-design/icons";

describe("GeneralIcon", () => {
  it("should render null if icon is falsy", () => {
    const wrapper = shallow(<GeneralIcon icon={null} />);
    expect(wrapper.html()).toBe("");
  });

  it("should render antd icon", () => {
    const wrapper = shallow(
      <GeneralIcon
        icon={{ lib: "antd", type: "up", theme: "filled", color: "#0071eb" }}
      />
    );
    expect(wrapper.find(LegacyIcon).prop("style")).toEqual({
      color: "#0071eb",
    });
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
      category: "app",
    });
  });

  it("should render null if icon is invalid", () => {
    const wrapper = shallow(<GeneralIcon icon={{ lib: "invalid" } as any} />);
    expect(wrapper.html()).toBe("");
  });

  it("should render Avatar when bg is true", () => {
    const wrapper = shallow(
      <GeneralIcon
        icon={{ lib: "antd", type: "up", theme: "filled", color: "#0071eb" }}
        bg={true}
      />
    );
    expect(wrapper.find("Avatar").length).toBe(1);
    wrapper.setProps({
      icon: {
        lib: "fa",
        icon: "accusoft",
        prefix: "fab",
        color: "green",
      },
    });
    wrapper.update();
    expect(wrapper.find("Avatar").prop("style")).toEqual({
      color: "var(--theme-green-color)",
      background: "var(--theme-green-background)",
      borderColor: "var(--theme-green-border-color)",
    });
  });

  it("should pass onClick property", () => {
    const mockedOnClick = jest.fn();
    const wrapper = shallow(
      <GeneralIcon
        icon={{ lib: "antd", type: "up", theme: "filled", color: "#0071eb" }}
        onClick={mockedOnClick}
      />
    );
    const event = new MouseEvent("click");
    wrapper.find(LegacyIcon).invoke("onClick")(
      (event as unknown) as React.MouseEvent<HTMLElement, MouseEvent>
    );
    expect(mockedOnClick).toBeCalledWith(event);
  });

  it("should pass through style property", () => {
    const style: React.CSSProperties = { marginRight: 8 };
    const wrapper = shallow(
      <GeneralIcon
        icon={{ lib: "antd", type: "up", theme: "filled", color: "#0071eb" }}
        style={style}
      />
    );
    expect(wrapper.find(LegacyIcon).prop("style")).toEqual(
      expect.objectContaining(style)
    );
  });
});
