import * as PermissionSdk from "@sdk/permission-sdk";

export function fetchPermissionList(
  permissionSet: string[]
): Promise<Partial<PermissionSdk.PermissionApi.GetPermissionListResponseBody>> {
  return PermissionSdk.PermissionApi.getPermissionList({
    // eslint-disable-next-line @typescript-eslint/camelcase
    action__in: permissionSet.join(",")
  });
}
