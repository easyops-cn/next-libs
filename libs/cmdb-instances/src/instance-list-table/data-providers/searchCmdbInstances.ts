import {
  InstanceApi_PostSearchRequestBody,
  InstanceApi_PostSearchResponseBody,
  InstanceApi_postSearch,
} from "@next-sdk/cmdb-sdk";

export function searchCmdbInstances(
  objectId: string,
  params?: InstanceApi_PostSearchRequestBody
): Promise<InstanceApi_PostSearchResponseBody> {
  return InstanceApi_postSearch(objectId, params);
}
