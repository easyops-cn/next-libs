import React from "react";
import { shallow } from "enzyme";
import { createHistory } from "@next-core/brick-kit";
import {
  Sidebar,
  initMenuItemAndMatchCurrentPathKeys,
  matchMenuItem,
} from "./Sidebar";
import { SidebarMenuItem, SidebarMenuGroup } from "@next-core/brick-types";

createHistory();

describe("Sidebar", () => {
  it("should work", () => {
    const menuItems: SidebarMenuItem[] = [
      {
        text: "for-good",
        to: "/for/good",
      },
      {
        type: "default",
        text: "for-better",
        to: {
          pathname: "for-better",
          search: "?even-more",
        },
      },
      {
        type: "group",
        title: "grouped",
        items: [
          {
            text: "for-perfect",
            to: "/for/perfect",
          },
          {
            type: "subMenu",
            title: "subMenu",
            icon: {
              lib: "fa",
              icon: "bug",
            },
            items: [
              {
                text: "for-submenu",
                to: "/for/submenu",
              },
            ],
          },
        ],
      },
    ];
    const wrapper = shallow(<Sidebar menuItems={menuItems} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("matchMenuItem exact match should ok", () => {
    const item = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail",
      exact: true,
    };
    const pathname = "/mysql-resource/detail";
    expect(matchMenuItem(item, pathname, "")).toBe(true);
  });

  it("matchMenuItem not exact match should ok", () => {
    const item = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail",
      exact: true,
    };
    const pathname = "/mysql-resource/detail/xxxxx";
    expect(matchMenuItem(item, pathname, "")).toBe(false);
  });

  it("matchMenuItem with activeIncludes", () => {
    const item1 = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail",
      exact: true,
      activeIncludes: ["/home"],
    };
    const item2 = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail",
      exact: true,
      activeIncludes: [{ path: "/home", exact: false }],
    };
    const pathname1 = "/home";
    const pathname2 = "/home/aaa";
    expect(matchMenuItem(item1, pathname1, "")).toBe(true);
    expect(matchMenuItem(item1, pathname2, "")).toBe(false);
    expect(matchMenuItem(item2, pathname2, "")).toBe(true);
  });

  it("matchMenuItem with activeExcludes", () => {
    const item1 = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail",
      exact: false,
      activeExcludes: ["/mysql-resource/detail/monitor"],
    };
    const item2 = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail",
      exact: false,
      activeExcludes: [
        { path: "/mysql-resource/detail/monitor", exact: false },
      ],
    };
    const pathname1 = "/mysql-resource/detail/aaaa";
    const pathname2 = "/mysql-resource/detail/monitor";
    const pathname3 = "/mysql-resource/detail/monitor/xxx";
    expect(matchMenuItem(item1, pathname1, "")).toBe(true);
    expect(matchMenuItem(item1, pathname2, "")).toBe(false);
    expect(matchMenuItem(item1, pathname3, "")).toBe(true);
    expect(matchMenuItem(item2, pathname3, "")).toBe(false);
  });

  it("matchMenuItem with activeMatchSearch", () => {
    const item = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail?appId=abc",
      exact: false,
      activeMatchSearch: true,
    };
    const pathname = "/mysql-resource/detail";
    expect(matchMenuItem(item, pathname, "")).toBe(false);
    expect(matchMenuItem(item, pathname, "?appId=abc")).toBe(true);
    expect(matchMenuItem(item, pathname, "?appId=abc&clusterId=xyz")).toBe(
      true
    );
    expect(matchMenuItem(item, pathname, "?clusterId=xyz")).toBe(false);
  });

  it("initMenuItemAndMatchCurrentPathKeys should ok", () => {
    const menuItems: SidebarMenuItem[] = [
      {
        text: "for-good",
        to: "/for/good",
        activeIncludes: ["/for/good"],
      },
      {
        type: "group",
        title: "grouped",
        items: [
          {
            text: "for-perfect",
            to: "/for/perfect",
            activeExcludes: ["/for/perfect/aaa"],
          },
          {
            type: "subMenu",
            title: "subMenu",
            items: [
              {
                text: "for-submenu",
                to: "/for/submenu",
              },
            ],
          },
        ],
      },
    ];
    const { selectedKeys, openedKeys } = initMenuItemAndMatchCurrentPathKeys(
      menuItems,
      "/for/submenu",
      "",
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
    const { selectedKeys: selectedKeys2, openedKeys: openedKeys2 } =
      initMenuItemAndMatchCurrentPathKeys(
        menuItems,
        "/for/perfect",
        "",
        "prefix"
      );
    expect(selectedKeys2).toEqual(["prefix.1.0"]);
    expect(openedKeys2).toContain("prefix.1");
    expect(openedKeys2).not.toContain("prefix.1.1");
  });
  it("should work and collapsed", () => {
    const menuItems: SidebarMenuItem[] = [
      {
        text: "for-good",
        to: "/for/good",
        activeIncludes: ["/for/good"],
      },
    ];
    const wrapper = shallow(<Sidebar menuItems={menuItems} collapsed={true} />);
    expect(wrapper.props().defaultOpenKeys).toMatchObject([]);
  });

  it("matchMenuItem when activeIncludes has ?", () => {
    const item = {
      text: "mysql资源管理",
      to: "/mysql-resource/detail",
      exact: false,
      activeIncludes: ["/mysql-resource/monitor/xxx?search=true"],
    };
    const pathname = "/mysql-resource/monitor/xxx";
    const pathname2 = "/mysql-resource/detail";
    const pathname3 = "/mysql-resource/other";

    expect(matchMenuItem(item, pathname, "?search=true")).toBe(true);
    expect(matchMenuItem(item, pathname, "?search=false")).toBe(false);
    expect(matchMenuItem(item, pathname2, "?search=false")).toBe(true);
    expect(matchMenuItem(item, pathname3, "?search=true")).toBe(false);
  });

  it("matchMenuItem with activeExcludes with query", () => {
    const item = {
      text: "Test",
      to: "/test?tab=a",
      exact: true,
      activeMatchSearch: true,
      activeIncludes: ["/test?tab=b"],
      activeExcludes: ["/test?system=x"],
    };
    const pathname = "/test";
    expect(matchMenuItem(item, pathname, "")).toBe(false);
    expect(matchMenuItem(item, pathname, "?tab=a")).toBe(true);
    expect(matchMenuItem(item, pathname, "?tab=b")).toBe(true);
    expect(matchMenuItem(item, pathname, "?tab=c")).toBe(false);
    expect(matchMenuItem(item, pathname, "?tab=a&system=x")).toBe(false);
    expect(matchMenuItem(item, pathname, "?tab=a&system=y")).toBe(true);
  });
});
