import { InstanceApi } from "@sdk/cmdb-sdk";
import { HttpOptions } from "@easyops/brick-http";

export function fetchCmdbInstanceAggregateCount(
  objectId: string | number,
  attrId: string | number,
  params?: InstanceApi.AggregateCountV2RequestParams,
  options?: HttpOptions
): Promise<InstanceApi.AggregateCountV2ResponseBody> {
  return InstanceApi.aggregateCountV2(objectId, attrId, params, options);
}
