import React from "react";
import { mount, shallow } from "enzyme";
import { Badge, BadgeProps } from "./Badge";
import { BrickAsComponent } from "@easyops/brick-kit";
import { GeneralIcon } from "./GeneralIcon";

describe("Badge", () => {
  it("should work", () => {
    const wrapper = shallow<BadgeProps>(
      <Badge count={100} overflowCount={99} color="cyan" content={"我的通知"} />
    );
    expect(wrapper.find("span").text()).toBe("我的通知");
  });

  it("should work with content brick", () => {
    const wrapper = shallow<BadgeProps>(
      <Badge
        count={100}
        overflowCount={99}
        color={"cyan"}
        content={{
          useBrick: {
            brick: "div",
            properties: {
              textContent: "用了div构件",
            },
          },
        }}
      />
    );
    expect(wrapper.find(BrickAsComponent).exists());
  });

  it("should work with content brick and transform", () => {
    const wrapper1 = shallow<BadgeProps>(
      <Badge
        count={100}
        overflowCount={99}
        color={"cyan"}
        content={{
          useBrick: {
            brick: "div",
            properties: {
              id: "content-brick",
            },
            transform: {
              textContent: "<% DATA %>",
            },
          },
        }}
        dataSource={"外面用了dataSource"}
      />
    );
    expect(wrapper1.find(BrickAsComponent).prop("data")).toBe(
      "外面用了dataSource"
    );

    const wrapper2 = shallow<BadgeProps>(
      <Badge
        count={100}
        overflowCount={99}
        color={"cyan"}
        content={{
          useBrick: {
            brick: "div",
            properties: {
              id: "content-brick",
            },
            transform: {
              textContent: "<% DATA %>",
            },
          },
          dataSource: "里面用了dataSource",
        }}
      />
    );
    expect(wrapper2.find(BrickAsComponent).prop("data")).toBe(
      "里面用了dataSource"
    );
  });

  it("should work with content icon", () => {
    const wrapper = shallow<BadgeProps>(
      <Badge
        count={100}
        overflowCount={99}
        color={"cyan"}
        contentIcon={{
          lib: "antd",
          type: "notification",
          theme: "outlined",
        }}
      />
    );
    expect(wrapper.find(GeneralIcon).exists());
  });
});
