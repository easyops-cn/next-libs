import React from "react";
import { shallow, mount } from "enzyme";
import { BatchSetting } from "./BatchSetting";
import { Button, Modal, Checkbox, Switch, Alert, Radio } from "antd";
import { SelectUserOrGroup } from "./SelectUserOrGroup";
describe("BatchSetting", () => {
  const modelData = { objectId: "APP", name: "应用" };
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
  const instanceIds = [
    "b6c5145b627a11e99f5106e69ba71c45",
    "8d0eb0decf6a34debdb3c5d458df5f98",
    "5a8c4609657c11e985d58e589cd9215b",
  ];
  const updateFunction = (): void => void 0;
  const props = {
    modelData,
    instanceIds,
    permissionList,
    updateFunction,
  };
  const wrapper = shallow(<BatchSetting {...props} />);
  const instance = wrapper.instance() as BatchSetting;

  it("should work", () => {
    expect(wrapper).toBeTruthy();
    expect(instance.state).toEqual({
      visible: false,
      formData: {
        enableWhiteList: false,
        method: "overwrite",
        authorizers: [],
        perm: [],
      },
    });
  });
  it("should work when toggle the white list switch", () => {
    wrapper.find(Switch).prop("onChange");
    expect(instance.state.formData.enableWhiteList).toEqual(false);
  });
  it("should set authorizers", () => {
    instance.handleUsersChange([{ label: "abc", key: "12345" }]);
    expect(instance.state.formData.authorizers).toEqual(["abc"]);
  });
  it("should set action", () => {
    instance.handleChangeAction({ target: { value: "overwrite" } });
    expect(instance.state.formData.method).toEqual("overwrite");
  });
  it("should set perms", () => {
    instance.handleCheckPerm(["deploy:package_delete"]);
    expect(instance.state.formData.perm).toEqual(["deploy:package_delete"]);
  });
});
