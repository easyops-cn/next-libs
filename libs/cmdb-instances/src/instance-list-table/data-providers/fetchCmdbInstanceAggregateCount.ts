import {
  InstanceApi_AggregateCountV2RequestParams,
  InstanceApi_AggregateCountV2ResponseBody,
  InstanceApi_aggregateCountV2,
} from "@next-sdk/cmdb-sdk";
import { HttpOptions } from "@next-core/brick-http";

export function fetchCmdbInstanceAggregateCount(
  objectId: string | number,
  attrId: string | number,
  params?: InstanceApi_AggregateCountV2RequestParams,
  options?: HttpOptions
): Promise<InstanceApi_AggregateCountV2ResponseBody> {
  return InstanceApi_aggregateCountV2(objectId, attrId, params, options);
}
