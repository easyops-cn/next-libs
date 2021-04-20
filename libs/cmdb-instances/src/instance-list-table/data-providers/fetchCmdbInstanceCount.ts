import {
  InstanceApi_SearchTotalRequestBody,
  InstanceApi_SearchTotalResponseBody,
  InstanceApi_searchTotal,
} from "@next-sdk/cmdb-sdk";
import { HttpOptions } from "@next-core/brick-http";

export function fetchCmdbInstanceCount(
  objectId: string | number,
  data?: InstanceApi_SearchTotalRequestBody,
  options?: HttpOptions
): Promise<InstanceApi_SearchTotalResponseBody> {
  return InstanceApi_searchTotal(objectId, data, options);
}
