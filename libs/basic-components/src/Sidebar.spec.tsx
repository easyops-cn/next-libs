import React from "react";
import { shallow } from "enzyme";
import { createHistory } from "@easyops/brick-kit";
import { Sidebar } from "./Sidebar";
import { SidebarMenuItem } from "@easyops/brick-types";

createHistory();

describe("Sidebar", () => {
  it("should work", () => {
    const menuItems: SidebarMenuItem[] = [
      {
        text: "for-good",
        to: "/for/good",
        activeIncludes: ["/for/good"]
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
    const wrapper = shallow(<Sidebar menuItems={menuItems} />);
    expect(wrapper).toMatchSnapshot();
  });
});
