/* eslint-disable @typescript-eslint/camelcase */
import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import "snapshot-diff";
import "snapshot-diff/extend-expect";
import { InstanceTreeApi } from "@sdk/cmdb-sdk";
import { CMDBTree } from "./CMDBTree";
import * as kit from "@easyops/brick-kit";

jest.mock("@sdk/cmdb-sdk");

const treeRequestBody: any = { tree: {} };
const q = "";
// eslint-disable-next-line @typescript-eslint/no-empty-function
const handleOnDragStart = (e: any) => {};
// eslint-disable-next-line @typescript-eslint/no-empty-function
const handleOnDragEnd = (e: any) => {};
const iconRenderer = (type: string, y: number) => {
  return <div />;
};
const spyOnHandleHttpError = jest.spyOn(kit, "handleHttpError");

xdescribe("cmdb tree", () => {
  let wrapper: any;
  let component: CMDBTree;

  beforeAll(() => {
    jest.spyOn(InstanceTreeApi, "instanceTreeExpand").mockResolvedValue({
      BUSINESS: [
        {
          _object_id: "BUSINESS",
          instanceId: "business-id-1",
          name: "business-1",
          _sub_system: [
            {
              _object_id: "business",
              instanceId: "business-id-2",
              name: "business-2"
            }
          ],
          _businesses_APP: [
            { _object_id: "APP", instanceId: "app-id", name: "app-1" }
          ]
        }
      ]
    });

    wrapper = shallow(
      <CMDBTree
        treeRequestBody={treeRequestBody}
        q={q}
        handleOnDragEnd={handleOnDragEnd}
        handleOnDragStart={handleOnDragStart}
        iconRenderer={iconRenderer}
        selectedInstanceId="target"
      />
    );
    component = wrapper.instance() as CMDBTree;
  });

  it("should work", () => {
    expect(wrapper).toMatchSnapshot();
  });

  it("searchTree should work", async () => {
    const spy = jest.spyOn(InstanceTreeApi, "instanceTreeSearch");
    spy.mockResolvedValueOnce({} as any);
    spy.mockRejectedValueOnce("error");
    await component.searchTree("");
    expect(spy).not.toBeCalled();

    await component.searchTree("hello");
    expect(spy).toBeCalled();

    await component.searchTree("hello");
    expect(spyOnHandleHttpError).toBeCalledWith("error");
  });

  it("anchorTree should work", async () => {
    const spy = jest
      .spyOn(InstanceTreeApi, "instanceTreeAnchor")
      .mockResolvedValue({});
    await component.anchorTree("", "");
    expect(spy).toBeCalled();

    jest
      .spyOn(InstanceTreeApi, "instanceTreeAnchor")
      .mockRejectedValue("error");
    await component.anchorTree("", "");
    expect(spyOnHandleHttpError).toBeCalledWith("error");
  });

  it("updateTreeNodes should work", () => {
    const spy = jest.spyOn(component, "withHead");

    component.updateTreeNodes({});
    expect(spy).toBeCalledWith([], true);

    component.updateTreeNodes({
      BUSINESS: [
        {
          instanceId: "id-1",
          name: "name-1",
          _object_id: "BUSINESS",
          _sub_system: [
            { instanceId: "id-2", name: "name-2", _object_id: "BUSINESS" }
          ]
        }
      ],
      APP: []
    });
    const expected = [
      expect.objectContaining({
        instanceId: "id-1",
        name: "name-1",
        _object_id: "BUSINESS",
        _sub_system: [
          {
            instanceId: "id-2",
            name: "name-2",
            _object_id: "BUSINESS",
            key: "id-2",
            title: "name-2",
            objectId: "BUSINESS",
            isLeaf: true
          }
        ],
        key: "id-1",
        title: "name-1",
        objectId: "BUSINESS",
        children: [
          {
            instanceId: "id-2",
            name: "name-2",
            _object_id: "BUSINESS",
            key: "id-2",
            title: "name-2",
            objectId: "BUSINESS",
            isLeaf: true
          }
        ],
        isLeaf: false
      })
    ];
    expect(spy).toBeCalledWith(expected, true);
  });

  it("findExpandKeys should work", () => {
    const node: any = {
      key: "0",
      children: [
        { key: "0-0" },
        { key: "0-1", children: [{ key: "0-1-0" }, { key: "target" }] }
      ]
    };

    const result: string[] = [];
    component.findExpandKeys(node, result);
    expect(result).toEqual(["0-1", "0"]);
  });

  it("findAllKeys should work", () => {
    const nodes: any[] = [
      {
        key: "0",
        children: [
          { key: "0-0", children: [{ key: "0-0-1" }] },
          { key: "0-1", children: [{ key: "0-1-0" }, { key: "target" }] }
        ]
      }
    ];

    const result: string[] = [];
    component.findAllKeys(nodes, result);
    expect(result).toEqual(["0", "0-0", "0-1"]);
  });

  describe("renderTitle", () => {
    it("renderTitle should work", () => {
      wrapper = shallow(
        <CMDBTree
          treeRequestBody={treeRequestBody}
          q="o"
          handleOnDragEnd={handleOnDragEnd}
          handleOnDragStart={handleOnDragStart}
          iconRenderer={iconRenderer}
        />
      );

      component = wrapper.instance() as CMDBTree;
      const title = component.renderTitle({} as any);
      expect(title).toMatchSnapshot();
    });
  });

  describe("treeData not empty", () => {
    it("should work", () => {
      const { asFragment, rerender } = render(
        <CMDBTree
          q=""
          treeData={[{ title: "node-1", key: "key-1", children: [] }]}
        />
      );
      const snap = asFragment();
      rerender(
        <CMDBTree
          q="nOdE"
          treeData={[{ title: "node-1", key: "key-1", children: [] }]}
        />
      );
      expect(snap).toMatchDiffSnapshot(asFragment());
    });
  });
});
