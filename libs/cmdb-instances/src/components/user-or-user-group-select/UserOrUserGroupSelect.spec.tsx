import React from "react";
import { UserOrUserGroupSelect } from "./UserOrUserGroupSelect";
import { act } from "@testing-library/react";
import { InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";
import { mount } from "enzyme";
import { Select } from "antd";

const mockPostSearch = InstanceApi_postSearch as jest.Mock;
jest.mock("@next-sdk/cmdb-sdk");

jest.mock("@next-libs/cmdb-instances", () => ({
  InstanceListModal: jest.fn(() => {
    return "<div>Fake instance list modal loaded!</div>";
  }),
}));

describe("UserOrUserGroupSelect", () => {
  it("should work", async () => {
    mockPostSearch.mockResolvedValue({
      list: [
        {
          instanceId: "instanceId",
          name: "easyops",
          nickname: "uwin",
        },
      ],
    });
    const onChange = jest.fn();
    let wrapper: any;
    await act(async () => {
      wrapper = mount(
        <UserOrUserGroupSelect
          onChange={onChange}
          objectMap={{
            USER: {
              view: {
                show_key: ["name", "nickname"],
              },
            },

            USER_GROUP: {
              view: {
                show_key: ["name"],
              },
            },
          }}
          value={{
            selectedUser: ["easyops"],
          }}
        />
      );

      await (global as any).flushPromises();
    });
    wrapper.find(Select).invoke("onChange")([
      { key: "easyops1", label: "easyops(uwin1)" },
    ]);

    expect(wrapper.find(Select).prop("value")).toEqual([
      { key: "easyops1", label: "easyops(uwin1)" },
    ]);

    await act(async () => {
      wrapper.setProps({
        value: {
          selectedUser: ["easyops"],
        },
      });

      await (global as any).flushPromises();
    });
    wrapper.update();
    expect(wrapper.find(Select).prop("value")).toEqual([
      {
        key: "easyops",
        label: "easyops(uwin)",
      },
    ]);

    wrapper.find(Select).invoke("onChange")([]);
    await (global as any).flushPromises();
    expect(onChange).toBeCalledWith(null);
  });
  it("should work and query", async () => {
    mockPostSearch.mockResolvedValue({
      list: [
        {
          instanceId: "59eea4ad40bf8",
          name: "easyops",
          nickname: "uwin",
        },
        {
          instanceId: "59eea4ad40bw2",
          name: "test",
          nickname: "xxx",
        },
      ],
    });
    const onChange = jest.fn();
    let wrapper: any;
    await act(async () => {
      wrapper = mount(
        <UserOrUserGroupSelect
          onChange={onChange}
          objectMap={{
            USER: {
              view: {
                show_key: ["name", "nickname"],
              },
            },
            USER_GROUP: {
              view: {
                show_key: ["name"],
              },
            },
          }}
          optionsMode="user"
          query={{
            instanceId: { $in: ["59eea4ad40bf8", "59eea4ad40bw2"] },
          }}
          staticList={["easyops"]}
        />
      );
      await (global as any).flushPromises();
    });
    wrapper.find(Select).invoke("onChange")({
      key: "test",
      label: "test(xxx)",
    });
    expect(wrapper.find(Select).prop("value")).toEqual(["test", "test(xxx)"]);
    await act(async () => {
      wrapper.setProps({
        optionsMode: "group",
      });
      await (global as any).flushPromises();
    });
    wrapper.update();
  });
});
