import { InstanceApi } from "@next-sdk/cmdb-sdk";
import { HttpOptions } from "@next-core/brick-http";

export function fetchCmdbInstanceAggregateCount(
  objectId: string | number,
  attrId: string | number,
  params?: InstanceApi.AggregateCountV2RequestParams,
  options?: HttpOptions
): Promise<InstanceApi.AggregateCountV2ResponseBody> {
  return InstanceApi.aggregateCountV2(objectId, attrId, params, options);
}
