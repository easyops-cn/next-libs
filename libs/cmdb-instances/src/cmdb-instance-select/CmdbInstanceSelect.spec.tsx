import React from "react";
import { shallow, mount } from "enzyme";
import { CmdbInstanceSelect, formatUserQuery } from "./CmdbInstanceSelect";
import * as kit from "@next-core/brick-kit";
import { InstanceApi_postSearchV3 } from "@next-sdk/cmdb-sdk";
import { Select } from "antd";
import i18n from "i18next";
import { act } from "react-dom/test-utils";

jest.spyOn(i18n, "t").mockReturnValue("后台搜索");

jest.mock("@next-sdk/cmdb-sdk");
const spyOnHandleHttpError = jest.spyOn(kit, "handleHttpError");

const mockPostSearch = InstanceApi_postSearchV3 as jest.Mock;

afterEach(() => {
  mockPostSearch.mockClear();
});

describe("CmdbInstanceSelect", () => {
  it("should work", () => {
    const wrapper = shallow(
      <CmdbInstanceSelect
        objectId="HOST"
        value="world"
        firstRender={true}
        onChange={jest.fn()}
      />
    );

    wrapper.find(Select).simulate("change", "host");
    wrapper.find(Select).simulate("focus");
    expect(wrapper.find(Select).prop("placeholder")).toEqual(
      "BACKGROUND_SEARCH"
    );
    expect(wrapper.find(Select).children().length).toBe(0);
  });

  it("should execute search action", async () => {
    mockPostSearch.mockResolvedValueOnce({
      list: [
        {
          hostname: "host1",
          instanceId: "abc",
          memo: "abc",
        },

        {
          hostname: "host2",
          instanceId: "bcd",
          memo: "def",
        },

        {
          hostname: "host3",
          instanceId: "efg",
          memo: "bbc",
        },
      ],
    });

    const wrapper = mount(
      <CmdbInstanceSelect
        objectId="HOST"
        placeholder="选择主机"
        value="world"
        firstRender={true}
        extraSearchKey={["memo"]}
        extraFields={["ip"]}
        permission={["read"]}
        sort={[{ key: "_ts", order: -1 }]}
      />
    );

    expect(mockPostSearch.mock.calls[0][1]).toEqual({
      fields: ["instanceId", "hostname", "memo", "ip"],
      permission: ["read"],
      page: 1,
      page_size: 30,
      query: {
        $and: [
          {
            $or: [
              {
                hostname: { $like: "%%" },
              },

              {
                memo: { $like: "%%" },
              },
            ],
          },

          {
            instanceId: {
              $in: ["world"],
            },
          },
        ],
      },
      sort: [
        {
          key: "_ts",
          order: -1,
        },
      ],
    });

    await (global as any).flushPromises();
    wrapper.update();

    wrapper.find(Select).simulate("change", "ack");
    expect(wrapper.find(Select).prop("value")).toEqual("world");
    expect(wrapper.find(Select).prop("children")).toHaveLength(3);
  });

  it("should update value", async () => {
    const wrapper = mount(
      <CmdbInstanceSelect objectId="HOST" value="world" firstRender={true} />
    );

    await act(async () => {
      await (global as any).flushPromises();
    });
    wrapper.update();
    expect(wrapper.find(Select).prop("value")).toEqual("world");

    wrapper.setProps({
      value: "new world",
    });

    await act(async () => {
      await (global as any).flushPromises();
    });
    wrapper.update();
    expect(wrapper.find(Select).prop("value")).toEqual("new world");
  });

  it("should throw error", async () => {
    mockPostSearch.mockRejectedValueOnce(new Error("http error"));

    const wrapper = mount(
      <CmdbInstanceSelect
        objectId="APP"
        placeholder="选择应用"
        value="world"
        firstRender={false}
        mode="multiple"
      />
    );

    await (global as any).flushPromises();
    wrapper.update();

    expect(spyOnHandleHttpError).toBeCalledWith(new Error("http error"));
  });

  it("should render origin label if user set showKeyField is true", async () => {
    const list = [
      {
        hostname: "host1",
        objectId: "HOST",
        instanceId: "abc",
        mem: "主机1",
        "#showKey": ["host1"],
      },

      {
        hostname: "host2",
        instanceId: "bcd",
        objectId: "HOST",
        mem: "主机2",
        "#showKey": ["host2"],
      },

      {
        hostname: "host3",
        instanceId: "efg",
        objectId: "HOST",
        mem: "主机3",
        "#showKey": ["host3"],
      },
    ];

    mockPostSearch.mockResolvedValueOnce({
      list,
    });

    const wrapper = mount(
      <CmdbInstanceSelect
        objectId="HOST"
        placeholder="选择主机"
        value="world"
        firstRender={false}
        showKeyField={true}
        popoverPositionType="parent"
      />
    );

    await (global as any).flushPromises();
    wrapper.update();

    expect(
      (
        wrapper.find(Select).first().prop("children") as React.ReactElement[]
      ).map((child) =>
        mount(child.props.children)
          .find("[data-testid='option-label']")
          .prop("children")
      )
    ).toEqual(list.map((item) => item["#showKey"].join("")));

    const childElement = document.createElement("div");
    const parnetElement = document.createElement("div");

    parnetElement.append(childElement);

    expect(
      wrapper.find(Select).invoke("getPopupContainer")(childElement)
    ).toEqual(parnetElement);
  });

  it("should render origin label if user don't set field props ", async () => {
    const list = [
      {
        hostname: "host1",
        objectId: "HOST",
        instanceId: "abc",
        mem: "主机1",
      },

      {
        hostname: "host2",
        instanceId: "bcd",
        objectId: "HOST",
        mem: "主机2",
      },

      {
        hostname: "host3",
        instanceId: "efg",
        objectId: "HOST",
        mem: "主机3",
      },
    ];

    mockPostSearch.mockResolvedValueOnce({
      list,
    });

    const wrapper = mount(
      <CmdbInstanceSelect
        objectId="HOST"
        placeholder="选择主机"
        value="world"
        firstRender={false}
        popoverPositionType="parent"
      />
    );

    await (global as any).flushPromises();
    wrapper.update();

    expect(
      (
        wrapper.find(Select).first().prop("children") as React.ReactElement[]
      ).map((child) =>
        mount(child.props.children)
          .find("[data-testid='option-label']")
          .prop("children")
      )
    ).toEqual(list.map((item) => item.hostname));

    const childElement = document.createElement("div");
    const parnetElement = document.createElement("div");

    parnetElement.append(childElement);

    expect(
      wrapper.find(Select).invoke("getPopupContainer")(childElement)
    ).toEqual(parnetElement);
  });

  it("should render special label if user  set field props", async () => {
    const list = [
      {
        hostname: "host1",
        objectId: "HOST",
        instanceId: "abc",
        mem: "主机1",
      },

      {
        hostname: "host2",
        instanceId: "bcd",
        objectId: "HOST",
        mem: "主机2",
      },

      {
        hostname: "host3",
        instanceId: "efg",
        objectId: "HOST",
        mem: "主机3",
      },
    ];

    mockPostSearch.mockResolvedValueOnce({
      list,
    });

    const wrapper = mount(
      <CmdbInstanceSelect
        firstRender={true}
        objectId="HOST"
        placeholder="选择主机"
        value="world"
        fields={{ label: "mem", value: "instanceId" }}
      />
    );

    await (global as any).flushPromises();
    wrapper.update();

    expect(
      (
        wrapper.find(Select).first().prop("children") as React.ReactElement[]
      ).map((child) =>
        mount(child.props.children)
          .find("[data-testid='option-label']")
          .prop("children")
      )
    ).toEqual(list.map((item) => item.mem));
  });
  it("should work if user set instanceQuery ", async () => {
    mockPostSearch.mockResolvedValueOnce({
      list: [
        {
          objectId: "_ISSUE",
          instanceId: "59bda0461dd2b",
          name: "MICRO_APP-32",
        },

        {
          objectId: "_ISSUE",
          instanceId: "59bda0461df59",
          name: "DATA_QUALITY",
        },

        {
          objectId: "_ISSUE",
          instanceId: "59bda0461df61",
          name: "DATA",
        },
      ],
    });

    const wrapper = mount(
      <CmdbInstanceSelect
        firstRender={true}
        objectId="_ISSUE"
        placeholder="选择"
        value="59bda0461df59"
        instanceQuery={{
          name: "DATA_QUALITY",
        }}
      />
    );

    expect(mockPostSearch.mock.calls[0][1]).toEqual({
      fields: ["instanceId", "name"],
      page: 1,
      page_size: 30,
      query: {
        $and: [
          {
            $or: [
              {
                name: { $like: "%%" },
              },
            ],
          },

          {
            instanceId: {
              $in: ["59bda0461df59"],
            },
          },

          {
            name: "DATA_QUALITY",
          },
        ],
      },
    });

    await (global as any).flushPromises();
    wrapper.update();
    expect(wrapper.find(Select).prop("children")).toHaveLength(3);
  });
  it("should render special label if user  set field props and field.label is Array", async () => {
    mockPostSearch.mockResolvedValueOnce({
      list: [
        {
          objectId: "_ISSUE",
          instanceId: "59bda0461dd2b",
          name: "MICRO_APP-32",
          title: "123",
        },

        {
          objectId: "_ISSUE",
          instanceId: "59bda0461df59",
          name: "DATA_QUALITY",
          title: "demo",
        },

        {
          objectId: "_ISSUE",
          instanceId: "59bda0461df61",
          name: "DATA",
          title: "edit",
        },
      ],
    });

    const wrapper = mount(
      <CmdbInstanceSelect
        firstRender={true}
        objectId="_ISSUE"
        placeholder="选择"
        value="59bda0461df61"
        fields={{ label: ["name", "title"], value: "instanceId" }}
      />
    );

    expect(mockPostSearch.mock.calls[0][1]).toEqual({
      fields: ["instanceId", "name", "title"],
      page: 1,
      page_size: 30,
      query: {
        $and: [
          {
            $or: [
              {
                name: { $like: "%%" },
              },

              {
                title: { $like: "%%" },
              },
            ],
          },

          {
            instanceId: {
              $in: ["59bda0461df61"],
            },
          },
        ],
      },
    });

    await (global as any).flushPromises();
    wrapper.update();
    expect(wrapper.find(Select).prop("children")).toHaveLength(3);
  });

  it("test onChange", async () => {
    const onChange = jest.fn();
    const list = [
      {
        hostname: "host1",
        objectId: "HOST",
        value: "abc",
        mem: "主机1",
      },

      {
        hostname: "host2",
        value: "bcd",
        objectId: "HOST",
        mem: "主机2",
      },

      {
        hostname: "host3",
        value: "efg",
        objectId: "HOST",
        mem: "主机3",
      },
    ];

    mockPostSearch.mockResolvedValueOnce({
      list,
    });

    const wrapper = mount(
      <CmdbInstanceSelect
        objectId="HOST"
        placeholder="选择主机"
        value="world"
        firstRender={false}
        onChange={onChange}
        mode="multiple"
        fields={{ label: ["mem"], value: "value" }}
      />
    );

    await (global as any).flushPromises();
    wrapper.update();
    wrapper.find(Select).invoke("onChange")(["abc"], null);
    await (global as any).flushPromises();
    expect(onChange).lastCalledWith(
      ["abc"],
      [
        {
          hostname: "host1",
          mem: "主机1",
          objectId: "HOST",
          value: "abc",
          label: ["主机1"],
        },
      ]
    );
  });

  it("test blurAfterValueChanged", async () => {
    const onChange = jest.fn();
    const list = [
      {
        hostname: "host1",
        objectId: "HOST",
        value: "abc",
        mem: "主机1",
      },

      {
        hostname: "host2",
        value: "bcd",
        objectId: "HOST",
        mem: "主机2",
      },

      {
        hostname: "host3",
        value: "efg",
        objectId: "HOST",
        mem: "主机3",
      },
    ];

    mockPostSearch.mockResolvedValueOnce({
      list,
    });

    const wrapper = mount(
      <CmdbInstanceSelect
        objectId="HOST"
        placeholder="选择主机"
        value="world"
        firstRender={false}
        onChange={onChange}
        mode="multiple"
        blurAfterValueChanged={true}
        fields={{ label: ["mem"], value: "value" }}
      />
    );

    await (global as any).flushPromises();
    wrapper.update();
    wrapper.find(Select).invoke("onChange")(["abc"], null);
    await (global as any).flushPromises();
    expect(onChange).lastCalledWith(
      ["abc"],
      [
        {
          hostname: "host1",
          mem: "主机1",
          objectId: "HOST",
          value: "abc",
          label: ["主机1"],
        },
      ]
    );
    wrapper.setProps({
      useBrickVisible: true,
    });
    wrapper.update();
    await (global as any).flushPromises();
    wrapper.find(Select).invoke("onFocus")({} as any);
    wrapper.setProps({
      useBrickVisible: false,
    });
    wrapper.update();
    await (global as any).flushPromises();
  });

  describe("formatUserQuery processor test", () => {
    it("should return empty, if don't set query params", () => {
      const result = formatUserQuery(undefined);

      expect(result).toEqual([]);
    });

    it("should transform to array type if the query is object type", () => {
      const instanceQuery = {
        instanceId: "dsf",
      };

      const result = formatUserQuery(instanceQuery);
      expect(result).toEqual([
        {
          instanceId: "dsf",
        },
      ]);
    });

    it("should keep origin value if the query is array type", () => {
      const instanceQuery = [
        {
          "appId.instanceId": {
            $eq: "vdbv",
          },
        },

        {
          _deployType: {
            $eq: "default",
          },
        },
      ];

      const result = formatUserQuery(instanceQuery);

      expect(result).toEqual([
        {
          "appId.instanceId": {
            $eq: "vdbv",
          },
        },

        {
          _deployType: {
            $eq: "default",
          },
        },
      ]);
    });
  });
});
