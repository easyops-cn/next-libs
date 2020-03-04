import React from "react";
import { shallow } from "enzyme";
import { InstanceDetail, LegacyInstanceDetail } from "./InstanceDetail";
import * as fetchCmdbObjectDetail from "../data-providers/fetchCmdbObjectDetail";
jest.mock("../data-providers/fetchCmdbObjectDetail");
jest.mock("../data-providers/fetchCmdbInstanceDetail");

const spyFetchCmdbObjectDetail = jest.spyOn(
  fetchCmdbObjectDetail,
  "fetchCmdbObjectDetail"
);
describe("InstanceDetail", () => {
  const wrapper = shallow<LegacyInstanceDetail>(
    <InstanceDetail objectId="HOST" instanceId="abc" />
  );
  const instance = wrapper.instance();

  it("should work", async () => {
    const wrapper2 = shallow<LegacyInstanceDetail>(
      <InstanceDetail
        objectId="HOST"
        instanceId="abc"
        attributeKeys={["name"]}
        actions={[
          {
            label: "编辑",
            url: "instanceId/edit"
          },
          {
            label: "删除",
            event: "read.single.delete"
          },
          {
            label: "编辑",
            type: "dropdown",
            url: "instanceId/edit"
          },
          {
            label: "删除",
            type: "dropdown",
            isDanger: true,
            event: "read.single.delete"
          }
        ]}
      />
    );
    await (global as any).flushPromises();
    wrapper2.update();

    expect(wrapper2.find("Card")).toHaveLength(1);
    wrapper2.setProps({
      showCard: false
    });
    expect(wrapper2.find("Card")).toHaveLength(0);
  });

  it("tests isMarkdownField", () => {
    const data = {
      value: {
        type: "str",
        mode: "markdown"
      }
    };
    expect(instance.isMarkdownField(data)).toBeTruthy();
    expect(instance.isMarkdownField({})).toBeFalsy();
  });

  it("tests isRelation", () => {
    expect(
      instance.isRelation({
        value: {
          type: "FK"
        }
      })
    ).toBeTruthy();
    expect(
      instance.isRelation({
        value: {
          type: "FKs"
        }
      })
    ).toBeTruthy();

    expect(instance.isSpecialDisplayField({})).toBeFalsy();
  });

  it("tests isStruct", () => {
    expect(
      instance.isStruct({
        value: {
          type: "struct"
        }
      })
    ).toBeTruthy();
    expect(
      instance.isStructs({
        value: {
          type: "structs"
        }
      })
    ).toBeTruthy();

    expect(instance.isStruct({})).toBeFalsy();
  });

  it("tests isSpecialDisplayField", () => {
    /*eslint @typescript-eslint/camelcase: ["error", {properties: "never"}]*/
    let data = {
      id: "id",
      left_id: "left_id",
      right_object_id: "right_object_id",
      left_object_id: "left_object_id"
    };
    expect(instance.isSpecialDisplayField(data)).toBeFalsy();
    expect(instance.isSpecialDisplayField({})).toBeFalsy();

    data = {
      id: "name",
      left_id: "name",
      right_object_id: "right_object_id",
      left_object_id: "left_object_id"
    };
    expect(instance.isSpecialDisplayField(data)).toBeFalsy();

    data = {
      id: "name",
      left_id: "name",
      right_object_id: "USER",
      left_object_id: "left_object_id"
    };
    expect(instance.isSpecialDisplayField(data)).toBeTruthy();
  });

  it("test toggleBasicInfoGroupFilter", () => {
    const basicInfoGroupList: any[] = [
      {
        name: "name 1",
        attrList: []
      },
      {
        name: "name 2",
        attrList: [],
        active: true
      }
    ];
    instance.setState({
      basicInfoGroupList
    });
    const basicInfoGroupLabel = wrapper.find(".basicInfoGroupLabel");
    const toggleBasicInfoGroupFilter = jest.spyOn(
      instance,
      "toggleBasicInfoGroupFilter"
    );

    expect(basicInfoGroupLabel.length).toBe(2);
    basicInfoGroupLabel.at(0).simulate("click");
    expect(toggleBasicInfoGroupFilter).toBeCalled();
    expect(instance.state.basicInfoGroupListShow).toEqual([
      {
        name: "name 1",
        attrList: [],
        active: true
      }
    ]);
    basicInfoGroupLabel.at(0).simulate("click");
    expect(toggleBasicInfoGroupFilter).toBeCalled();
    expect(instance.state.basicInfoGroupListShow).toEqual(basicInfoGroupList);
  });

  it("test fieldsByTag", async () => {
    const wrapper2 = shallow<LegacyInstanceDetail>(
      <InstanceDetail
        objectId="HOST"
        instanceId="abc"
        fieldsByTag={[
          {
            name: "基础信息",
            fields: ["name", "ip"]
          },
          {
            name: "agent信息",
            fields: ["status"]
          }
        ]}
      />
    );
    await (global as any).flushPromises();
    wrapper2.update();
  });

  it("test brickConfigList", async () => {
    const wrapper2 = shallow<LegacyInstanceDetail>(
      <InstanceDetail
        objectId="HOST"
        instanceId="abc"
        attributeKeys={["name"]}
        brickConfigList={[
          {
            name: "input",
            label: "输入"
          }
        ]}
      />
    );
    await (global as any).flushPromises();
    wrapper2.update();
  });

  it("test didUpdate", async () => {
    const wrapper = shallow<LegacyInstanceDetail>(
      <InstanceDetail
        objectId="HOST"
        instanceId="abc"
        attributeKeys={["name"]}
      />
    );
    wrapper.setProps({ objectId: "HOST", instanceId: "bbb" });
    expect(spyFetchCmdbObjectDetail).toBeCalled();
  });
});
