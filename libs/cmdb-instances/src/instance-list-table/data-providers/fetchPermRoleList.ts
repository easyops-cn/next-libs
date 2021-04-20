import {
  RoleApi_getPermissionRoleList,
  RoleApi_GetPermissionRoleListResponseBody,
} from "@next-sdk/permission-sdk";

export function fetchPermRoleList(): Promise<
  Partial<RoleApi_GetPermissionRoleListResponseBody>
> {
  return RoleApi_getPermissionRoleList({});
}
