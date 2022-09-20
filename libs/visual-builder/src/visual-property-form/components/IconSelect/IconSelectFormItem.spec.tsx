import React from "react";
import { shallow } from "enzyme";
import { IconSelectFormItem } from "./IconSelectFormItem";
import { IconSelectItem } from "@next-libs/forms";

describe("IconSelectFormItem", () => {
  it("should work", () => {
    const wrapper = shallow(<IconSelectFormItem visible={false} />);

    wrapper.find(IconSelectItem).invoke("openModal")();
    wrapper.update();
    expect(wrapper.find(IconSelectItem).prop("visible")).toEqual(true);

    wrapper.find(IconSelectItem).invoke("handleCancel")();
    wrapper.update();
    expect(wrapper.find(IconSelectItem).prop("visible")).toEqual(false);

    wrapper.find(IconSelectItem).invoke("onChange")({
      lib: "antd",
      icon: "test",
    });
    wrapper.update();
    expect(wrapper.find(IconSelectItem).prop("visible")).toEqual(false);
  });
});
