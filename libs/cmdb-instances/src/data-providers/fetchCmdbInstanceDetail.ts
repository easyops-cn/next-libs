import {
  InstanceApi_GetDetailResponseBody,
  InstanceApi_getDetail,
  InstanceApi_GetDetailRequestParams,
} from "@next-sdk/cmdb-sdk";
import { http } from "@next-core/brick-http";

export function fetchCmdbInstanceDetail(
  objectId: string,
  instanceId: string,
  sourceId?: string
): Promise<Partial<InstanceApi_GetDetailResponseBody>> {
  return sourceId
    ? http
        .post(
          "api/gateway/easyops.api.%20cmdb.topo_center.ProxyGetInstanceDetail@1.0.0/api/v1/proxy-get-instance-detail",
          {
            objectId,
            sourceId,
            instanceId,
          }
        )
        .then((res: InstanceApi_GetDetailResponseBody) => res.data)
    : InstanceApi_getDetail(objectId, instanceId, {});
}

export function fetchCmdbInstanceDetailByFields(
  objectId: string,
  instanceId: string,
  fields: string,
  relation_limit?: number,
  sourceId?: string
): Promise<Partial<InstanceApi_GetDetailResponseBody>> {
  return sourceId
    ? http
        .post(
          "api/gateway/easyops.api.%20cmdb.topo_center.ProxyGetInstanceDetail@1.0.0/api/v1/proxy-get-instance-detail",
          {
            objectId,
            sourceId,
            instanceId,
            fields,
            relation_limit,
          }
        )
        .then((res: InstanceApi_GetDetailResponseBody) => res.data)
    : InstanceApi_getDetail(objectId, instanceId, {
        fields,
        relation_limit,
      } as InstanceApi_GetDetailRequestParams);
}
