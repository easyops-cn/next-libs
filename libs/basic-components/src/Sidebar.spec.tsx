import React from "react";
import { shallow } from "enzyme";
import { createHistory } from "@easyops/brick-kit";
import {
  Sidebar,
  initMenuItemAndMatchCurrentPathKeys,
  matchMenuItem
} from "./Sidebar";
import { SidebarMenuItem, SidebarMenuGroup } from "@easyops/brick-types";

createHistory();

describe("Sidebar", () => {
  it("should work", () => {
    const menuItems: SidebarMenuItem[] = [
      {
        text: "for-good",
        to: "/for/good"
      },
      {
        type: "default",
        text: "for-better",
        to: {
          pathname: "for-better",
          search: "?even-more"
        }
      },
      {
        type: "group",
        title: "grouped",
        items: [
          {
            text: "for-perfect",
            to: "/for/perfect"
          },
          {
            type: "subMenu",
            title: "subMenu",
            items: [
              {
                text: "for-submenu",
                to: "/for/submenu"
              }
            ]
          }
        ]
      }
    ];
    const wrapper = shallow(<Sidebar menuItems={menuItems} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("matchMenuItem exact match should ok", () => {
    const item = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail",
      exact: true
    };
    const pathname = "/mysql-resource/detail";
    expect(matchMenuItem(item, pathname)).toBeTruthy();
  });

  it("matchMenuItem not exact match should ok", () => {
    const item = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail",
      exact: true
    };
    const pathname = "/mysql-resource/detail/xxxxx";
    expect(matchMenuItem(item, pathname)).toBeFalsy();
  });

  it("matchMenuItem activeIncludes should ok", () => {
    const item = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail",
      exact: true,
      activeIncludes: ["/home", "/home/aaa"]
    };
    const pathname = "/home";
    expect(matchMenuItem(item, pathname)).toBeTruthy();
  });

  it("matchMenuItem activeExcludes should ok", () => {
    const item = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail",
      exact: false,
      activeExcludes: ["/mysql-resource/detail/monitor/xxx"]
    };
    const pathname = "/mysql-resource/detail/aaaa";
    expect(matchMenuItem(item, pathname)).toBeTruthy();
    const pathname2 = "/mysql-resource/detail/monitor/xxx";
    expect(matchMenuItem(item, pathname2)).toBeFalsy();
  });

  it("initMenuItemAndMatchCurrentPathKeys should ok", () => {
    const menuItems: SidebarMenuItem[] = [
      {
        text: "for-good",
        to: "/for/good",
        activeIncludes: ["/for/good"]
      },
      {
        type: "group",
        title: "grouped",
        items: [
          {
            text: "for-perfect",
            to: "/for/perfect",
            activeExcludes: ["/for/perfect/aaa"]
          },
          {
            type: "subMenu",
            title: "subMenu",
            items: [
              {
                text: "for-submenu",
                to: "/for/submenu"
              }
            ]
          }
        ]
      }
    ];
    const { selectedKeys, openedKeys } = initMenuItemAndMatchCurrentPathKeys(
      menuItems,
      "/for/submenu",
      ""
    );
    expect(menuItems[0].key).toBe("0");
    expect(menuItems[1].key).toBe("1");
    expect((menuItems[1] as SidebarMenuGroup).items[0].key).toBe("1.0");
    expect(
      ((menuItems[1] as SidebarMenuGroup).items[1] as SidebarMenuGroup).items[0]
        .key
    ).toBe("1.1.0");
    expect(selectedKeys).toEqual(["1.1.0"]);
    expect(openedKeys).toContain("1");
    expect(openedKeys).toContain("1.1");
    const {
      selectedKeys: selectedKeys2,
      openedKeys: openedKeys2
    } = initMenuItemAndMatchCurrentPathKeys(
      menuItems,
      "/for/perfect",
      "prefix"
    );
    expect(selectedKeys2).toEqual(["prefix.1.0"]);
    expect(openedKeys2).toContain("prefix.1");
    expect(openedKeys2).not.toContain("prefix.1.1");
  });
});
