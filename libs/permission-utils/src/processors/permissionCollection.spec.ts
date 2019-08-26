import { PermissionCollection } from "./permissionCollection";
import { PermissionItem } from "./permissionItem";
// jest.mock("./permissionCollection");
describe("PermissionCollection", () => {
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
    updateAuthorizers: ["easyops", "06034", "group1"]
  };
  it("should call constructor", () => {
    const collection = new PermissionCollection(instanceData, permissionList);
    expect(collection.permissionList[0]).toEqual(
      new PermissionItem(instanceData, permissionList[0])
    );
  });
  it("should call save function", () => {
    const collection = new PermissionCollection(instanceData, permissionList);
    const spy = jest.spyOn(collection.permissionList[0], "save");
    collection.save();
    expect(spy).toHaveBeenCalled();
  });
  it("should call restore function", () => {
    const collection = new PermissionCollection(instanceData, permissionList);
    const spy = jest.spyOn(collection.permissionList[0], "restore");
    collection.restore();
    expect(spy).toHaveBeenCalled();
  });
  it("should work when call getData function", () => {
    const collection = new PermissionCollection(instanceData, permissionList);
    expect(collection.getData()).toEqual({
      deleteAuthorizers: ["easyops", "06031"],
      readAuthorizers: ["easyops", "06032"],
      updateAuthorizers: ["easyops", "06034", "group1"]
    });
  });
  it("should work when call getCurrentUsers function", () => {
    const collection = new PermissionCollection(instanceData, permissionList);
    expect(collection.getCurrentUsers()).toEqual([
      "easyops",
      "06031",
      "06034",
      "group1",
      "06032"
    ]);
  });
});
