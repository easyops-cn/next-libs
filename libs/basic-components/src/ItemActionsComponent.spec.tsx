import React from "react";
import { mount } from "enzyme";
import { ItemActionsComponent } from "./ItemActionsComponent";

const actions = [
  {
    brick: "div",
    properties: {
      textContent: "Add View",
    },
  },
  {
    brick: "div",
    properties: {
      textContent: "Edit Route",
    },
  },
];

describe("ItemActionsComponent", () => {
  it("should work", async () => {
    const wrapper = mount(
      <ItemActionsComponent
        item={{ id: 1, name: 1 }}
        filteredActions={actions}
      />
    );
    wrapper.find("Button").simulate("click");
    wrapper.update();
    expect(wrapper.find("BrickAsComponent").length).toBe(2);
  });
});
