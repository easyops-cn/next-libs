import React from "react";
import { mount } from "enzyme";
import { IconSelectItem } from "./IconSelect";
import { Modal, Input, Radio } from "antd";

describe("IconSelect", () => {
  it("should work", async () => {
    const onChange = jest.fn();
    const openModal = jest.fn();
    const handleCancel = jest.fn();
    const wrapper = mount(
      <IconSelectItem
        onChange={onChange}
        visible={false}
        value={{
          lib: "fa",
          icon: "image",
        }}
        openModal={openModal}
        handleCancel={handleCancel}
      />
    );
    expect(wrapper.find("GeneralIcon").length).toBe(1);
    expect(wrapper.find(".colorBox").length).toBe(0);
    wrapper.find("GeneralIcon").simulate("click");
    expect(openModal).toHaveBeenCalled();
    wrapper.setProps({
      visible: true,
    });
    wrapper.update();
    expect(wrapper.find(".deleteWrapper").length).toBe(1);
    expect(wrapper.find("GeneralIcon").length).not.toBeLessThan(2);
    expect(wrapper.find(".colorBox").length).toBe(0);
    wrapper.find(Radio.Group).invoke("onChange")({
      target: {
        value: "antd",
      },
    } as any);
    wrapper.find(Input.Search).invoke("onChange")({
      target: {
        value: "delete",
      },
    } as any);
    wrapper.find(".iconContainer").at(0).simulate("click");
    wrapper.find(Modal).invoke("onOk")(null);
    await (global as any).flushPromises();
    expect(onChange).toHaveBeenCalled();
    wrapper.find(Modal).invoke("onCancel")(null);
    expect(handleCancel).toHaveBeenCalled();
    wrapper.find(".deleteWrapper").at(0).simulate("click");
    wrapper.update();
    expect(wrapper.find(".deleteWrapper").length).toBe(0);
  });
  it("should work with bg and setColor", async () => {
    const onChange = jest.fn();
    const openModal = jest.fn();
    const handleCancel = jest.fn();
    const wrapper = mount(
      <IconSelectItem
        onChange={onChange}
        visible={false}
        value={{
          lib: "fa",
          icon: "image",
        }}
        openModal={openModal}
        handleCancel={handleCancel}
        bg={true}
        setColor={true}
      />
    );
    wrapper.find("GeneralIcon").simulate("click");
    expect(openModal).toHaveBeenCalled();
    wrapper.setProps({
      visible: true,
    });
    wrapper.update();
    expect(wrapper.find(".colorBox").length).toBe(9);
    wrapper.find(".emptyColor").at(0).simulate("click");
    wrapper.find(".colorBox").at(0).simulate("click");
  });
});
