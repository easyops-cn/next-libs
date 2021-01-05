import { InstanceApi } from "@sdk/cmdb-sdk";

export function fetchCmdbInstanceDetail(
  objectId: string,
  instanceId: string,
  params: { fields?: string; get_show_key?: boolean }
): Promise<Partial<InstanceApi.GetDetailResponseBody>> {
  return InstanceApi.getDetail(objectId, instanceId, params);
}
