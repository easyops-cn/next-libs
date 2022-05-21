import React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  InstanceApi_postSearch,
  CmdbObjectApi_getObjectRef,
  CmdbModels,
} from "@next-sdk/cmdb-sdk";
import {
  CmdbInstancesFilterForm,
  CmdbInstancesFilterFormItem,
  CmdbInstancesFilterInstancesType,
} from "./CmdbInstancesFilterForm";
import { FormItemWrapper } from "@next-libs/forms";
import * as utils from "@next-libs/cmdb-utils";
import { mount } from "enzyme";

jest.mock("@next-libs/cmdb-utils");
jest.spyOn(utils, "modifyModelData").mockReturnValue({
  objectId: "HOST",
  __fieldList: [
    {
      __id: "hostname",
      name: "主机名",
      value: { type: "str" },
    },
  ],
});

jest.mock("@next-libs/cmdb-instances", () => ({
  InstanceListModal: jest.fn(() => {
    return "<div>Fake instance list modal loaded!</div>";
  }),
  InstanceListTable: jest.fn(() => {
    return "<div>Fake instance list table loaded!</div>";
  }),
  CmdbInstancesSelectPanel: jest.fn(() => {
    return <div>Fake instance select panel loaded!</div>;
  }),
}));

jest.mock("@next-sdk/cmdb-sdk");

(InstanceApi_postSearch as jest.Mock).mockResolvedValue({
  list: [
    {
      instanceId: "5c6d122b3c85f",
    },
  ],
});

const objectMap: { [objectId: string]: Partial<CmdbModels.ModelCmdbObject> } = {
  HOST: {
    objectId: "HOST",
    name: "主机",
    attrList: [
      {
        id: "hostname",
        name: "主机名",
        value: {
          type: "str",
        },
      },
      {
        id: "int",
        name: "整型",
        value: {
          type: "int",
        },
      },
    ],
    relation_list: [],
    view: {
      attr_order: ["hostname"],
    },
  },
};

describe("CmdbInstancesFilterForm", () => {
  it("should work and autoPullObjectList is true", async () => {
    (CmdbObjectApi_getObjectRef as jest.Mock).mockResolvedValue({
      data: [
        {
          objectId: "HOST",
          name: "主机",
          attrList: [
            {
              id: "hostname",
              name: "主机名",
              value: {
                type: "str",
              },
            },
            {
              id: "int",
              name: "整型",
              value: {
                type: "int",
              },
            },
          ],
          relation_list: [],
          view: {
            attr_order: ["hostname"],
          },
        },
      ],
    });
    const handleChange = jest.fn();
    const wrapper = mount(
      <CmdbInstancesFilterFormItem
        value={{
          objectId: "HOST",
          instances: { type: CmdbInstancesFilterInstancesType.All },
        }}
        autoPullObjectList={true}
        onChange={handleChange}
      />
    );
    await (global as any).flushPromises();
    expect(wrapper.find(".itemWrapper").length).toBe(1);
  });
  it("should work with validate", async () => {
    (CmdbObjectApi_getObjectRef as jest.Mock).mockResolvedValue({
      data: [
        {
          objectId: "HOST",
          name: "主机",
          attrList: [
            {
              id: "hostname",
              name: "主机名",
              value: {
                type: "str",
              },
            },
            {
              id: "int",
              name: "整型",
              value: {
                type: "int",
              },
            },
          ],
          relation_list: [],
          view: {
            attr_order: ["hostname"],
          },
        },
      ],
    });
    const wrapper = mount(
      <CmdbInstancesFilterForm
        // value={{
        //   instances: {
        //     query: {},
        //     type: CmdbInstancesFilterInstancesType.Constant,
        //   },
        // }}
        label={"执行主机"}
        required={true}
        autoPullObjectList={true}
        autoCullNonExistentInstances={true}
      />
    );
    await (global as any).flushPromises();
    expect(
      (wrapper.find(FormItemWrapper).prop("validator") as any).length
    ).toBe(1);
  });
});
