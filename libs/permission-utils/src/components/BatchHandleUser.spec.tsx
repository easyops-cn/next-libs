import React from "react";
import { shallow, mount } from "enzyme";
import { BatchHandleUser } from "./BatchHandleUser";
import { Checkbox } from "antd";

describe("AddUserModal", () => {
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
  ];
  const props = {
    batchType: "add",
    permissionList,
    currentUsers: ["lightjiao"],
    batchHandleUserChange: jest.fn(),
    batchHandlePermChange: jest.fn(),
  };
  const wrapper = shallow(<BatchHandleUser {...props} />);
  const instance = wrapper.instance() as BatchHandleUser;
  it("should work", () => {
    expect(wrapper).toBeTruthy();
    expect(wrapper.find("SelectUserOrGroup")).toHaveLength(1);
  });
  it("should handleCheckPerm when check a checkbox", () => {
    const batchHandlePermChangeSpy = jest.spyOn(props, "batchHandlePermChange");
    instance.handleCheckPerm(["deploy:package_read"]);
    expect(batchHandlePermChangeSpy).toHaveBeenCalled();
  });
  it("should handleUsersChange when change the Select", () => {
    const batchHandleUserChangeSpy = jest.spyOn(props, "batchHandleUserChange");
    instance.handleUsersChange([
      { label: "easyops", key: "easyops", value: "easyops" },
    ]);
    expect(batchHandleUserChangeSpy).toHaveBeenCalled();
  });
});
