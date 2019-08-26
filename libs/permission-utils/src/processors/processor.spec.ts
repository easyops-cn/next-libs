import { initPermissionOptions } from "./processor";
describe("initPermissionOptions", () => {
  it("should work", () => {
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
            system: "deploy"
          }
        },
        roles: [
          "系统管理员",
          "应用运维",
          "应用测试",
          "应用开发",
          "test",
          "测试角色-没有easyops+系统管理菜单"
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
          "user3"
        ],
        _actionWeight: 1,
        _category: "a-0"
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
            system: "deploy"
          }
        },
        roles: [
          "系统管理员",
          "应用运维",
          "应用测试",
          "应用开发",
          "test",
          "测试角色-没有easyops+系统管理菜单"
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
          "user3"
        ],
        _actionWeight: 2,
        _category: "a-0"
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
            system: "deploy"
          }
        },
        roles: [
          "系统管理员",
          "应用运维",
          "应用测试",
          "应用开发",
          "test",
          "测试角色-没有easyops+系统管理菜单"
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
          "user3"
        ],
        _actionWeight: 100,
        _category: "a-0"
      }
    ];
    expect(initPermissionOptions(permissionList)).toEqual([
      { label: "包删除", value: "deploy:package_delete" },
      { label: "包编辑", value: "deploy:package_update" },
      { label: "包查看", value: "deploy:package_read" }
    ]);
  });
});
