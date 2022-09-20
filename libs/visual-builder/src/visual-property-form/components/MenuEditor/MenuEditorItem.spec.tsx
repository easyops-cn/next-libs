import React from "react";
import { mount } from "enzyme";
import { MenuEditorItem } from "./MenuEditorItem";
import { InstanceApi_getDetail } from "@next-sdk/cmdb-sdk";
import { GeneralIcon } from "@next-libs/basic-components";

jest.mock("@next-sdk/cmdb-sdk");

(InstanceApi_getDetail as jest.Mock).mockImplementation(() => ({
  menus: [],
}));

describe("IconSelectFormItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should work", async () => {
    const mockClickFn = jest.fn();

    const wrapper = mount(
      <MenuEditorItem projectId="123" menuSettingClick={mockClickFn} />
    );

    await (global as any).flushPromises();

    expect(InstanceApi_getDetail).toBeCalledTimes(1);

    expect(MenuEditorItem).toBeTruthy();

    wrapper.find(GeneralIcon).at(0).invoke("onClick")(null);

    expect(mockClickFn).toBeCalled();
  });

  it("getDetail not work", () => {
    mount(<MenuEditorItem />);

    expect(InstanceApi_getDetail).toBeCalledTimes(0);
  });
});
