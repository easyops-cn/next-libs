import {
  PermissionApi_GetPermissionListResponseBody,
  PermissionApi_getPermissionList,
} from "@next-sdk/permission-sdk";

export function fetchPermissionList(
  permissionSet: string[]
): Promise<Partial<PermissionApi_GetPermissionListResponseBody>> {
  return PermissionApi_getPermissionList({
    action__in: permissionSet.join(","),
  });
}
