import React from "react";
import { shallow } from "enzyme";
import {
  InstanceDetail,
  LegacyInstanceDetail,
  attrFilter,
  getRelationShowKeys,
} from "./InstanceDetail";
import {
  getRelationShowFields,
  reOrderAttrs,
} from "./components/instance-relation-table-show/instance-relation-table-show";
import * as fetchCmdbObjectRef from "../data-providers/fetchCmdbObjectRef";
import {
  fetchCmdbInstanceDetail,
  fetchCmdbInstanceDetailByFields,
} from "../data-providers/fetchCmdbInstanceDetail";
import { Input } from "antd";

jest.mock("../data-providers/fetchCmdbObjectRef");
jest.mock("../data-providers/fetchCmdbInstanceDetail", () => ({
  fetchCmdbInstanceDetail: jest.fn(() => {
    return null;
  }),
  fetchCmdbInstanceDetailByFields: jest.fn(() => {
    return null;
  }),
}));

const spyFetchCmdbObjectList = jest.spyOn(
  fetchCmdbObjectRef,
  "fetchCmdbObjectRef"
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
            url: "instanceId/edit",
          },
          {
            label: "删除",
            event: "read.single.delete",
          },
          {
            label: "编辑",
            type: "dropdown",
            url: "instanceId/edit",
          },
          {
            label: "删除",
            type: "dropdown",
            isDanger: true,
            event: "read.single.delete",
          },
        ]}
        isRelationInstanceDetail={true}
      />
    );
    const instance2 = wrapper2.instance();
    await (global as any).flushPromises();
    wrapper2.update();

    expect(wrapper.state("currentAttr")).toBe(null);
    expect(wrapper2.find("Card")).toHaveLength(1);
    expect(wrapper2.find("Modal")).toHaveLength(1);
    expect(wrapper2.find("Modal").prop("visible")).toBeFalsy();
    expect(wrapper2.find("Modal").prop("title")).toBe(
      "libs-cmdb-instances:VIEW_MORE"
    );
    expect(wrapper2.find(Input.Search).length).toBe(1);
    expect(wrapper2.find("InstanceRelationTableShow")).toHaveLength(1);
    expect(
      wrapper2.find("InstanceRelationTableShow").prop("isPagination")
    ).toBeTruthy();
    expect(wrapper2.find("InstanceRelationTableShow").prop("value")).toEqual(
      expect.arrayContaining([])
    );

    instance2.setState({
      currentAttr: {
        id: "name",
        name: "名称",
        right_description: "名称",
        __id: "name",
      },
      searchValue: "test",
    });
    expect(wrapper2.find("Modal").prop("visible")).toBeTruthy();
    expect(wrapper2.find("Modal").prop("title")).toBe("名称");
    wrapper2.find("Modal").first().simulate("cancel");
    expect(instance2.state.relationTablePagination).toEqual({
      current: 1,
      pageSize: 10,
    });
    expect(instance2.state.searchValue).toBe("");
    expect(wrapper2.find("Modal").prop("visible")).toBeFalsy();
    expect(instance2.state.currentAttr).toBe(null);

    expect(fetchCmdbInstanceDetail).toBeCalled();
    wrapper2.setProps({
      showCard: false,
      showFields: true,
    });
    expect(wrapper2.find("Card")).toHaveLength(0);
    expect(wrapper2.find(".detailCard")).toHaveLength(1);
    expect(spyFetchCmdbObjectList).toBeCalled();
    expect(fetchCmdbInstanceDetailByFields).not.toBeCalled();
  });

  it("tests isMarkdownField", () => {
    const data = {
      value: {
        type: "str",
        mode: "markdown",
      },
    };
    expect(instance.isMarkdownField(data)).toBeTruthy();
    expect(instance.isMarkdownField({})).toBeFalsy();
  });

  it("tests isRelation", () => {
    expect(
      instance.isRelation({
        value: {
          type: "FK",
        },
      })
    ).toBeTruthy();
    expect(
      instance.isRelation({
        value: {
          type: "FKs",
        },
      })
    ).toBeTruthy();

    expect(instance.isSpecialDisplayField({})).toBeFalsy();
  });

  it("tests isStruct", () => {
    expect(
      instance.isStruct({
        value: {
          type: "struct",
        },
      })
    ).toBeTruthy();
    expect(
      instance.isStructs({
        value: {
          type: "structs",
        },
      })
    ).toBeTruthy();

    expect(instance.isStruct({})).toBeFalsy();
  });
  it("tests isUrl", () => {
    expect(
      instance.isUrl({
        value: { mode: "url", type: "str" },
      })
    ).toBeTruthy();

    expect(instance.isUrl({})).toBeFalsy();
  });
  it("tests isFloat", () => {
    expect(
      instance.isFloat({
        value: { type: "float" },
      })
    ).toBeTruthy();

    expect(instance.isUrl({})).toBeFalsy();
  });
  it("tests isSpecialDisplayField", () => {
    let data = {
      id: "id",
      left_id: "left_id",
      right_object_id: "right_object_id",
      left_object_id: "left_object_id",
    };
    expect(instance.isSpecialDisplayField(data)).toBeFalsy();
    expect(instance.isSpecialDisplayField({})).toBeFalsy();

    data = {
      id: "name",
      left_id: "name",
      right_object_id: "right_object_id",
      left_object_id: "left_object_id",
    };
    expect(instance.isSpecialDisplayField(data)).toBeFalsy();

    data = {
      id: "name",
      left_id: "name",
      right_object_id: "USER",
      left_object_id: "left_object_id",
    };
    expect(instance.isSpecialDisplayField(data)).toBeTruthy();
  });

  it("test toggleBasicInfoGroupFilter", () => {
    const basicInfoGroupList = [
      {
        name: "name 1",
        attrList: [] as any[],
      },
      {
        name: "name 2",
        attrList: [] as any[],
        active: true,
      },
    ];
    instance.setState({
      basicInfoGroupList,
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
        active: true,
      },
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
            fields: ["name", "ip"],
          },
          {
            name: "agent信息",
            fields: ["status"],
          },
        ]}
      />
    );
    await (global as any).flushPromises();
    wrapper2.update();
    expect(spyFetchCmdbObjectList).toBeCalled();
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
            label: "输入",
          },
        ]}
      />
    );
    await (global as any).flushPromises();
    wrapper2.update();
    expect(spyFetchCmdbObjectList).toBeCalled();
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
    expect(spyFetchCmdbObjectList).toBeCalled();
  });

  it("tests attrFilter", () => {
    expect(
      attrFilter(
        {
          id: "name",
          name: "名称",
          protected: true,
          tag: ["555"],
          description: "",
          tips: "",
          value: {
            type: "str",
            regex: null,
            default_type: "value",
            default: null,
            struct_define: [],
            mode: "default",
            prefix: "",
            start_value: 0,
            series_number_length: 0,
          },
          __isRelation: false,
          __id: "name",
        },
        {
          attrList: [{ id: "name", name: "名称", tag: ["555"] }],
          objectId: "HOST",
          relation_list: [],
          __fieldList: [
            {
              id: "name",
              name: "名称",
              protected: true,
              tag: ["555"],
              description: "",
              tips: "",
              value: {
                type: "str",
                regex: null,
                default_type: "value",
                default: null,
                struct_define: [],
                mode: "default",
                prefix: "",
                start_value: 0,
                series_number_length: 0,
              },
              __isRelation: false,
              __id: "name",
            },
          ],
          view: {
            attr_category_order: ["名称"],
            hide_columns: [],
          },
        }
      )
    ).toBeTruthy();
    expect(
      attrFilter(
        {
          id: "name",
          name: "名称",
          protected: true,
          tag: ["555"],
          __isRelation: true,
          __id: "name",
          left_tags: [],
        } as any,
        {
          attrList: [],
          objectId: "HOST",
          relation_list: [],
          __fieldList: [],
          view: {
            attr_category_order: ["名称"],
            hide_columns: [],
          },
        }
      )
    ).toBeFalsy();
    expect(
      attrFilter(
        {
          id: "deviceId",
          name: "deviceId",
          __isRelation: false,
          __id: "deviceId",
        } as any,
        {
          objectId: "HOST",
          view: {
            attr_category_order: ["deviceId"],
          },
        }
      )
    ).toBeFalsy();
  });
  it("test getRelationShowKeys", () => {
    const attrIdList = ["hostname", "ip", "_agentStatus", "USER", "APP"];
    const relationDefaultAttrs = {
      USER: ["nickname", "#testApps", "#ownApps", "#developApps"],
    };
    expect(getRelationShowKeys(attrIdList, relationDefaultAttrs)).toEqual([
      "hostname",
      "ip",
      "_agentStatus",
      "USER",
      "APP",
      "USER.testApps",
      "USER.ownApps",
      "USER.developApps",
    ]);
    expect(getRelationShowKeys(attrIdList, {})).toEqual(attrIdList);
  });
  it("test reOrderAttrs", () => {
    const attrIdList = [
      "nickname",
      "id",
      "name",
      "dingding",
      "testApps",
      "developApps",
    ];
    const attr_order = ["id", "name", "testApps"];
    expect(reOrderAttrs(attrIdList, attr_order)).toEqual([
      "id",
      "name",
      "testApps",
      "nickname",
      "dingding",
      "developApps",
    ]);
  });
  it("test getRelationShowFields", () => {
    const attrIdList = ["nickname", "id", "name", "dingding"];
    const relationDefaultAttrs = [
      "nickname",
      "dingding",
      "#testApps",
      "#ownApps",
      "#developApps",
    ];
    expect(getRelationShowFields(relationDefaultAttrs, attrIdList)).toEqual([
      "nickname",
      "dingding",
      "testApps",
      "ownApps",
      "developApps",
    ]);
    expect(getRelationShowFields([], attrIdList)).toEqual(attrIdList);
    expect(getRelationShowFields(undefined, attrIdList)).toEqual(attrIdList);
    expect(
      getRelationShowFields(relationDefaultAttrs, attrIdList, [
        "nickname",
        "developApps",
      ])
    ).toEqual(["nickname", "developApps", "dingding", "testApps", "ownApps"]);
  });
});
