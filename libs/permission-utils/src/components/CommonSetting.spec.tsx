import React from "react";
import { shallow, mount } from "enzyme";
import { CommonSetting, CommonSettingPropsDefine } from "./CommonSetting";
import { PermissionCollection } from "../processors";
import {
  PERM_SET_OF_PACKAGE_INSTANCE,
  PERM_PACKAGE_UPDATE,
} from "../constants";
import {
  UserAdminApi_listGroupsIdName,
  UserAdminApi_ListGroupsIdNameResponseBody,
} from "@next-sdk/user-service-sdk";
import * as kit from "@next-core/brick-kit";
// const spyOnHandleHttpError = jest.spyOn(kit, "handleHttpError");
jest.mock("@next-sdk/user-service-sdk");
jest.mock("@next-core/brick-kit", () => ({
  getAuth: () => ({ username: "test" }),
}));
describe("CommonSetting", () => {
  const instanceData = {
    authUsers: "",
    cId: "1",
    category: "",
    conf: "",
    creator: "easyops",
    ctime: "2019-04-01 02:38:45",
    icon: "",
    installPath: "/tmptestpkg1",
    memo: "a",
    mtime: "2019-04-13 23:05:03",
    name: "pkg-1",
    org: "3333",
    packageId: "912cb4643e24c7723091509fa9ad82c4",
    platform: "linux",
    repoId: "",
    repoPath: "/3333/91/2c/b4/643e24c7723091509fa9ad82c4",
    source: "",
    style: "",
    type: "1",
    deleteAuthorizers: ["easyops", "06031"],
    readAuthorizers: ["easyops", "06032"],
    updateAuthorizers: ["easyops", "06034", "group1"],
    testAuthorizers: ["000"],
  };
  const permissionList = [
    {
      action: "deploy:package_delete",
      id: "5b7b87a27e5a2e22bb29bcbf",
      remark: "包删除",
      resource: {
        system: "deploy",
        condition: {
          deleteAuthorizers: "%user",
          name: "package",
          system: "deploy",
        },
      },
      roles: [
        "系统管理员",
        "应用运维",
        "应用测试",
        "应用开发",
        "test",
        "测试角色-没有easyops+系统管理菜单",
      ],
      system: "持续部署",
      user: [
        "willniu123",
        "easyops",
        "qw",
        "qwe",
        "ea",
        "willniu",
        "lightjiao",
        "user3",
      ],
      _actionWeight: 1,
      _category: "a-0",
    },
    {
      action: "deploy:package_update",
      id: "5b7b87a27e5a2e22bb29bcc0",
      remark: "包编辑",
      resource: {
        system: "deploy",
        condition: {
          updateAuthorizers: "%user",
          name: "package",
          system: "deploy",
        },
      },
      roles: [
        "系统管理员",
        "应用运维",
        "应用测试",
        "应用开发",
        "test",
        "测试角色-没有easyops+系统管理菜单",
      ],
      system: "持续部署",
      user: [
        "willniu123",
        "easyops",
        "qw",
        "qwe",
        "ea",
        "willniu",
        "lightjiao",
        "user3",
      ],
      _actionWeight: 2,
      _category: "a-0",
    },
    {
      action: "deploy:package_read",
      id: "5b7b87a27e5a2e22ba29bcc4",
      remark: "包查看",
      resource: {
        system: "deploy",
        condition: {
          readAuthorizers: "%user",
          name: "package",
          system: "deploy",
        },
      },
      roles: [
        "系统管理员",
        "应用运维",
        "应用测试",
        "应用开发",
        "test",
        "测试角色-没有easyops+系统管理菜单",
      ],
      system: "持续部署",
      user: [
        "willniu123",
        "easyops",
        "qw",
        "qwe",
        "ea",
        "willniu",
        "lightjiao",
        "user3",
      ],
      _actionWeight: 100,
      _category: "a-0",
    },
    {
      action: "deploy:package_test",
      id: "5b7b87a27e5a2e22ba29bcc9",
      remark: "包测试",
      resource: {
        system: "deploy",
        condition: {
          testAuthorizers: "%user",
          name: "package",
          system: "deploy",
        },
      },
      roles: [
        "系统管理员",
        "应用运维",
        "应用测试",
        "应用开发",
        "test",
        "测试角色-没有easyops+系统管理菜单",
      ],
      system: "持续部署",
      user: ["data"],
      _actionWeight: 100,
      _category: "a-0",
    },
  ];
  const roleList = [
    {
      permission: [
        "5b7b87737e5a2e22b829bcbd",
        "5b7b87737e5a2e22ba29bcac",
        "5b7b87737e5a2e22b929bcac",
      ],
      role: "系统管理员",
      user: ["easyops", "user3", "group1", "lightjiao"],
      org: 3333,
      id: "5b7b876e7e5a2e22b829bcac",
    },
    {
      permission: ["5c1373157e5a2e9d26040ac3", "5c1373157e5a2e9d24040aa8"],
      role: "应用运维",
      user: ["willniu123", "willniu"],
      org: 3333,
      id: "5b7b876e7e5a2e22b829bcb6",
    },
    {
      permission: [
        "5b7b87797e5a2e22b829bcc0",
        "5b7b87a27e5a2e22ba29bcb9",
        "5b7b87a27e5a2e22ba29bcba",
      ],
      role: "应用测试",
      user: [],
      org: 3333,
      id: "5b7b876e7e5a2e22b829bcb7",
    },
    {
      permission: [
        "5b7b87797e5a2e22b829bcc0",
        "5b7b87a27e5a2e22ba29bcb9",
        "5b7b87a27e5a2e22ba29bcba",
      ],
      role: "应用开发",
      user: [],
      org: 3333,
      id: "5b7b876e7e5a2e22b829bcb8",
    },
    {
      permission: [
        "5b7b87a27e5a2e22ba29bcc4",
        "5b7b87a27e5a2e22bb29bcbe",
        "5b7b87a27e5a2e22bb29bcc0",
      ],
      role: "test",
      user: ["qwe", "group2"],
      org: 3333,
      id: "5c3ee1b37e5a2e3497d23eba",
    },
    {
      permission: [
        "5b7b87797e5a2e22b829bcc0",
        "5b7b877d7e5a2e22b829bcc2",
        "5b7b877d7e5a2e22bb29bcb1",
      ],
      role: "测试角色-没有easyops+系统管理菜单",
      user: ["qw"],
      org: 3333,
      id: "5c10c30d7e5a2e021395c091",
    },
  ];
  const userIdToName = {
    alanname123: "alanname123",
    anntest: "anntest",
    autodiscover: "autodiscover",
    autotool: "autotool",
    lightjiao: "lightjiao",
    luoke01: "luoke01",
    mannyzheng: "这个昵称是用来检测如果内容过于冗长以致于文本换行会是什么效果",
    openapi: "openapi",
    qw: "qw",
    qwe: "qwe",
    reolei: "reolei",
    rfid: "rfid",
    robertma: "robertma",
    shawn: "shawn",
    shijian: "shijian",
    szkingdom: "szkingdom",
    test110: "test110",
    unisims: "unisims",
    user1: "user1",
    user2: "user2",
    user3: "user3",
    user4: "user4",
    willniu: "willniu",
    willniu123: "willniu123",
    yasuo: "yasuo",
    zachary: "zachary",
    zhangxing: "zhangxing",
  };
  const userGroupIdToName = {
    group1: "group1",
    group2: "group2",
    group3: "group3",
    group4: "group4",
  };
  const permissionSet = PERM_SET_OF_PACKAGE_INSTANCE;
  const permissionNameOfEdit = PERM_PACKAGE_UPDATE;
  const updateFunction = jest.fn();
  const onSingleAddUserModelClose = jest.fn();
  const stateTarget = {};
  const props: CommonSettingPropsDefine = {
    instanceData,
    // permissionSet,
    permissionNameOfEdit,
    permissionList,
    roleList,
    // userIdToName,
    // userGroupIdToName,
    updateFunction,
    stateTarget,
  };
  const wrapper = shallow(<CommonSetting {...props} />);
  const instance = wrapper.instance() as CommonSetting;
  it("should work", () => {
    expect(wrapper).toBeTruthy();
  });
  it("componentDidUpdate", async () => {
    const spy = UserAdminApi_listGroupsIdName as jest.Mock;
    spy.mockResolvedValue({} as UserAdminApi_ListGroupsIdNameResponseBody);
    spy.mockRejectedValue("error");
    wrapper.setProps({
      selectedInstances: [{ instanceId: "fake_id", name: "fake_name" }],
    });
    expect(instance.state.temporaryUsers).toEqual(["fake_name"]);
  });

  it("should enable editing when click the modify button", () => {
    wrapper.find("#modifyPermissionBtn").simulate("click");
    expect(instance.state.enableEdit).toEqual(true);
  });
  it("should disable editing when click the modify button", () => {
    wrapper.find("#cancelEditBtn").simulate("click");
    expect(instance.state.enableEdit).toEqual(false);
  });
  it("should call store function and exit editing status when click the store button", () => {
    const mockProps = { ...props, updateFunction: jest.fn() };
    const mockWrapper = shallow(<CommonSetting {...mockProps} />);
    const mockInstance = mockWrapper.instance() as CommonSetting;
    mockInstance.enableEdit();
    const spy = jest.spyOn(mockProps, "updateFunction");
    mockWrapper.find("#storeBtn").simulate("click");
    expect(spy).toHaveBeenCalled();
    expect(mockInstance.state.enableEdit).toEqual(false);
  });
  it("should open the batch add user modal when click the batch add button", () => {
    instance.enableEdit();
    const spy = jest.spyOn(instance, "openBatchSetUserModel");
    wrapper.find("#batchAddBtn").simulate("click");
    expect(spy).toHaveBeenCalled();
    expect(instance.state.showBatchHandleUserModal).toEqual(true);
  });
  it("should join roles when render", () => {
    expect(instance.renderRoles(["系统管理员", "测试角色"])).toEqual(
      "系统管理员、测试角色"
    );
  });
  it("should work roles when renderOption", () => {
    const record = instance.state.collections.permissionList[0];
    expect(instance.renderOperation(true, record)).toBeTruthy();
  });
  it("should work when enable a whiteList", () => {
    const record = instance.state.collections.permissionList[0];
    instance.handleToggleWhiteListEnabled(true, record);
    expect(instance.state.collections.permissionList[0]).toEqual(record);
    wrapper.setProps({
      fillCurrentLoginUser: true,
    });
    const record1 = instance.state.collections.permissionList[3];
    instance.handleToggleWhiteListEnabled(true, record1);
    expect(instance.state.collections.permissionList[3]).toEqual(record1);
  });
  it("should work when batchHandlePermChange is called", () => {
    instance.batchHandlePermChange(["deploy:package_read"]);
    expect(instance.state.temporaryPerms).toEqual(["deploy:package_read"]);
  });
  it("should work when batchHandleUserChange is called", () => {
    instance.setState({
      idMapName: { ":789": "ai" },
    });
    instance.batchHandleUserChange([
      { label: "easyops_111", key: "12345", value: "12345" },
      { label: "ai", key: "789", value: "789" },
    ]);
    expect(instance.state.temporaryUsers).toEqual(["easyops_111", ":789"]);
  });
  it("should work when batch add users", () => {
    instance.setState({
      batchType: "add",
      temporaryPerms: [
        "deploy:package_read",
        "deploy:package_update",
        "deploy:package_delete",
      ],
      temporaryUsers: ["anntest"],
    });
    instance.handleUsersChange();
    const permissionList = instance.state.collections.permissionList;
    const deleteItem = permissionList.find(
      (item: any) => item.keyAuthorizers === "deleteAuthorizers"
    );
    expect(deleteItem.authorizers).toEqual(["easyops", "06031", "anntest"]);
  });
  it("should work when batch remove users", () => {
    instance.setState({
      batchType: "remove",
      temporaryPerms: [
        "deploy:package_read",
        "deploy:package_update",
        "deploy:package_delete",
      ],
      temporaryUsers: ["06031"],
    });
    instance.handleUsersChange();
    const permissionList = instance.state.collections.permissionList;
    const deleteItem = permissionList.find(
      (item: any) => item.keyAuthorizers === "deleteAuthorizers"
    );
    expect(deleteItem.authorizers).toEqual(["easyops", "anntest"]);
  });
  it("should work when close a whiteList", () => {
    const record = instance.state.collections.permissionList[0];
    instance.handleToggleWhiteListEnabled(false, record);
    expect(instance.state.collections.permissionList[0].authorizers).toEqual(
      []
    );
  });
});
