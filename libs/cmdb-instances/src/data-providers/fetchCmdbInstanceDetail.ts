import { InstanceApi } from "@next-sdk/cmdb-sdk";

export function fetchCmdbInstanceDetail(
  objectId: string,
  instanceId: string
): Promise<Partial<InstanceApi.GetDetailResponseBody>> {
  return InstanceApi.getDetail(objectId, instanceId, {});
}
