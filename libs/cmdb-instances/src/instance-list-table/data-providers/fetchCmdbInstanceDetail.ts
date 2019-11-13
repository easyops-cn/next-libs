import { InstanceApi } from "@sdk/cmdb-sdk";

export function fetchCmdbInstanceDetail(
  objectId: string,
  instanceId: string
): Promise<Partial<InstanceApi.GetDetailResponseBody>> {
  return InstanceApi.getDetail(objectId, instanceId);
}
