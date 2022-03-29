import React from "react";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";

import {
  CmdbModels,
  InstanceApi_postSearch,
  CmdbObjectApi_getObjectRef,
} from "@next-sdk/cmdb-sdk";
import { CmdbInstancesSelectPanel } from "./CmdbInstancesSelectPanel";
import { InstanceListTable } from "../instance-list-table";
import { InstanceList } from "../instance-list/InstanceList";
import { InstanceListModal } from "../instance-list-modal/InstanceListModal";

jest.mock("@next-sdk/cmdb-sdk");
jest.mock("../instance-list-table", () => {
  return {
    InstanceListTable: jest.fn(() => {
      return <div>Fake InstanceListTable</div>;
    }),
  };
});
jest.mock("../instance-list/InstanceList", () => {
  return {
    InstanceList: jest.fn(() => {
      return <div>Fake InstanceList</div>;
    }),
  };
});

const objectMap: any = {
  APP: {
    objectId: "APP",
    name: "应用",
    attrList: [
      {
        id: "name",
        name: "名称",
        value: {
          type: "str",
        },
      },
    ],
    relation_list: [],
  },
};

(InstanceApi_postSearch as jest.Mock).mockResolvedValue({
  list: [
    { instanceId: "5c6d122b3c85f" },
    { instanceId: "5c6d122b3c85f" },
    { instanceId: "5c6d122b3c85f" },
    { instanceId: "5c6d122b3c85f" },
    { instanceId: "5c6d122b3c85f" },
    { instanceId: "5c6d122b3c85f" },
  ],
});
(CmdbObjectApi_getObjectRef as jest.Mock).mockResolvedValue({
  data: [
    {
      objectId: "APP",
      name: "子系统",
    },
    {
      objectId: "CLUSTER",
      name: "集群",
    },
  ],
});
const RefCmdbInstancesSelectPanel = React.forwardRef(CmdbInstancesSelectPanel);

describe("CmdbInstancesSelectPanel", () => {
  it("should work", async () => {
    const onChange = jest.fn();
    const onFetchedInstances = jest.fn();
    const wrapper = mount(
      <RefCmdbInstancesSelectPanel
        objectId="APP"
        modelData={objectMap["APP"]}
        value={[]}
        onChange={onChange}
        isFilterView={true}
        onFetchedInstances={onFetchedInstances}
      />
    );
    await act(async () => {
      await (global as any).flushPromises();
    });
    wrapper.update();
    expect(wrapper.find(".wrapper").length).toBe(1);
    expect(onFetchedInstances).toHaveBeenCalledTimes(1);
  });

  it("pre selected value should work", async () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <RefCmdbInstancesSelectPanel
        objectId="APP"
        modelData={objectMap["APP"]}
        value={["5c6d122b3c85f"]}
        onChange={onChange}
      />
    );
    await act(async () => {
      await (global as any).flushPromises();
    });
    wrapper.update();
    const selectModal = wrapper.find(InstanceListModal).first();
    expect(selectModal.prop("selectedRowKeys").length).toBe(6);
    expect(wrapper.find(".showAllSelectedInstancesButton").length).toBe(1);

    // open add modal
    const addButton = wrapper.find(".addButton").first();
    await act(async () => {
      addButton.simulate("click");
    });
    wrapper.update();
    const addModal = wrapper.find(InstanceListModal).first();
    expect(addModal.prop("visible")).toBe(true);

    // close add modal
    addModal.invoke("onCancel")();
    const addModal1 = wrapper.find(InstanceListModal).first();
    expect(addModal1.prop("visible")).toBe(false);

    // open preview modal
    const previewLink = wrapper.find(".showAllSelectedInstancesButton").first();
    await act(async () => {
      previewLink.simulate("click");
    });
    wrapper.update();
    const previewModal0 = wrapper.find(InstanceListModal).last();
    expect(previewModal0.prop("visible")).toBe(true);

    // close preview modal
    previewModal0.invoke("onCancel")();
    const previewModal1 = wrapper.find(InstanceListModal).last();
    expect(previewModal1.prop("visible")).toBe(false);
  });

  it("handle selected should work", async () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <RefCmdbInstancesSelectPanel
        objectId="APP"
        modelData={objectMap["APP"]}
        value={["5c6d122b3c85f"]}
        onChange={onChange}
      />
    );
    await act(async () => {
      await (global as any).flushPromises();
    });
    wrapper.update();

    const addModal = wrapper.find(InstanceListModal).first();
    addModal.invoke("onSelected")([]);
  });
});
