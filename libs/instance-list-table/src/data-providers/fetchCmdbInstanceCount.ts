import { InstanceApi } from "@sdk/cmdb-sdk";
import { HttpOptions } from "@easyops/brick-http";

export function fetchCmdbInstanceCount(
  objectId: string | number,
  data?: InstanceApi.SearchTotalRequestBody,
  options?: HttpOptions
): Promise<InstanceApi.SearchTotalResponseBody> {
  return InstanceApi.searchTotal(objectId, data, options);
}
