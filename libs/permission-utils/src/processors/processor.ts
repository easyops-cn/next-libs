export const initPermissionOptions = (permissionList: any) => {
  return permissionList.map((perm: any) => ({
    label: perm.remark,
    value: perm.action
  }));
};
