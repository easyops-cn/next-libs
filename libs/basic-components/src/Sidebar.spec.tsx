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
          }
        ]
      }
    ];
    const wrapper = shallow(<Sidebar menuItems={menuItems} />);
    expect(wrapper).toMatchSnapshot();
  });
});
