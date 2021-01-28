import * as PermissionSdk from "@next-sdk/permission-sdk";

export function fetchPermissionList(
  permissionSet: string[]
): Promise<Partial<PermissionSdk.PermissionApi.GetPermissionListResponseBody>> {
  return PermissionSdk.PermissionApi.getPermissionList({
    action__in: permissionSet.join(","),
  });
}
