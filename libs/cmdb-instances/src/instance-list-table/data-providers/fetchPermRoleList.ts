import * as PermissionSdk from "@sdk/permission-sdk";

export function fetchPermRoleList(): Promise<
  Partial<PermissionSdk.RoleApi.GetPermissionRoleListResponseBody>
> {
  return PermissionSdk.RoleApi.getPermissionRoleList({});
}
