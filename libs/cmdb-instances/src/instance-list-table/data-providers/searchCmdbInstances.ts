import { InstanceApi } from "@sdk/cmdb-sdk";

export function searchCmdbInstances(
  objectId: string,
  params?: InstanceApi.PostSearchRequestBody
): Promise<InstanceApi.PostSearchResponseBody> {
  return InstanceApi.postSearch(objectId, params);
}
