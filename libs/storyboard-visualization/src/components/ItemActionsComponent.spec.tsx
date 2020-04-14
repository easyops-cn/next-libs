import React from "react";
import { mount } from "enzyme";
import { ItemActionsComponent } from "./ItemActionsComponent";
import { fakeRoutesGraphNodes } from "../fakesForTest";

const actions = [
  {
    brick: "div",
    properties: {
      textContent: "Add View"
    }
  },
  {
    brick: "div",
    properties: {
      textContent: "Edit Route"
    }
  }
];

describe("ItemActionsComponent", () => {
  it("should work", async () => {
    const wrapper = mount(
      <ItemActionsComponent
        item={fakeRoutesGraphNodes()[0].originalData}
        filteredActions={actions}
      />
    );
    wrapper.find("Button").simulate("click");
    wrapper.update();
    expect(wrapper.find("BrickAsComponent").length).toBe(2);
  });
});
