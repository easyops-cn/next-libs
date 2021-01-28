import { InstanceApi } from "@next-sdk/cmdb-sdk";
import { HttpOptions } from "@next-core/brick-http";

export function fetchCmdbInstanceCount(
  objectId: string | number,
  data?: InstanceApi.SearchTotalRequestBody,
  options?: HttpOptions
): Promise<InstanceApi.SearchTotalResponseBody> {
  return InstanceApi.searchTotal(objectId, data, options);
}
