import {
  InstanceApi_GetDetailResponseBody,
  InstanceApi_getDetail,
} from "@next-sdk/cmdb-sdk";

export function fetchCmdbInstanceDetail(
  objectId: string,
  instanceId: string
): Promise<Partial<InstanceApi_GetDetailResponseBody>> {
  return InstanceApi_getDetail(objectId, instanceId, {});
}
