import {
  InstanceApi_PostSearchV3RequestBody,
  InstanceApi_PostSearchV3ResponseBody,
  InstanceApi_postSearchV3,
} from "@next-sdk/cmdb-sdk";

import { http } from "@next-core/brick-http";

export function fetchCmdbInstanceSearch(
  objectId: string,
  params: InstanceApi_PostSearchV3RequestBody,
  sourceId?: string
): Promise<Partial<InstanceApi_PostSearchV3ResponseBody>> {
  return sourceId
    ? http.post(
        "api/gateway/easyops.api.cmdb.topo_center.ProxyPostSearchV3@1.0.1/api/v1/proxy-post-search-v3",
        {
          ...params,
          objectId,
          sourceId,
        }
      )
    : InstanceApi_postSearchV3(objectId, params);
}
