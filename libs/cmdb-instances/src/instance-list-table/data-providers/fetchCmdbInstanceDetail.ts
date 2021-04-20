import {
  InstanceApi_GetDetailResponseBody,
  InstanceApi_getDetail,
} from "@next-sdk/cmdb-sdk";

export function fetchCmdbInstanceDetail(
  objectId: string,
  instanceId: string,
  params: { fields?: string; get_show_key?: boolean }
): Promise<Partial<InstanceApi_GetDetailResponseBody>> {
  return InstanceApi_getDetail(objectId, instanceId, params);
}
