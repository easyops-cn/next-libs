import { PermissionItem } from "./permissionItem";
describe("PermissionItem", () => {
  const permission = {
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
  };
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
  it("should call constructor function", () => {
    const item = new PermissionItem(instanceData, permission);
    expect(item.instanceData).toEqual(instanceData);
    expect(item.data).toEqual(permission);
    expect(item.keyAuthorizers).toEqual("deleteAuthorizers");
    expect(item.authorizers).toEqual(["easyops", "06031"]);
    expect(item._whiteListEnabled).toEqual(true);
  });
  it("should return item's _whiteListEnabled", () => {
    const item = new PermissionItem(instanceData, permission);
    expect(item.isWhiteListEnabled()).toEqual(true);
  });
  it("should return the opposite of item's _whiteListEnabled", () => {
    const item = new PermissionItem(instanceData, permission);
    expect(item.isWhiteListDisabled()).toEqual(false);
  });
  it("should enable item's whiteList", () => {
    const item = new PermissionItem(instanceData, permission);
    item.enableWhiteList();
    expect(item.isWhiteListEnabled()).toEqual(true);
  });
  it("should disable item's whiteList", () => {
    const item = new PermissionItem(instanceData, permission);
    item.disableWhiteList();
    expect(item.isWhiteListDisabled()).toEqual(true);
  });
  it("should change nothing when add an existed user", () => {
    const item = new PermissionItem(instanceData, permission);
    item.addUsers(["easyops"]);
    expect(item.authorizers).toEqual(["easyops", "06031"]);
    expect(item.isWhiteListEnabled()).toEqual(true);
  });
  it("should work when add a new user", () => {
    const item = new PermissionItem(instanceData, permission);
    item.addUsers(["new"]);
    expect(item.authorizers).toEqual(["easyops", "06031", "new"]);
    expect(item.isWhiteListEnabled()).toEqual(true);
  });
  it("should work when remove a user", () => {
    const item = new PermissionItem(instanceData, permission);
    item.removeUser("06031");
    expect(item.authorizers).toEqual(["easyops"]);
    expect(item.isWhiteListEnabled()).toEqual(true);
  });
  it("should work when all users are removed", () => {
    const item = new PermissionItem(instanceData, permission);
    item.removeUsers(["easyops", "06031"]);
    expect(item.authorizers).toEqual([]);
    expect(item.isWhiteListDisabled()).toEqual(true);
  });
});
