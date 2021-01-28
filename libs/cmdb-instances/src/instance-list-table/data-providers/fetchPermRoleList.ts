import * as PermissionSdk from "@next-sdk/permission-sdk";

export function fetchPermRoleList(): Promise<
  Partial<PermissionSdk.RoleApi.GetPermissionRoleListResponseBody>
> {
  return PermissionSdk.RoleApi.getPermissionRoleList({});
}
