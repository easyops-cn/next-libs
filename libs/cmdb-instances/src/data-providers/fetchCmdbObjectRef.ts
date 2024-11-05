import {
  CmdbObjectApi_GetObjectRefResponseBody,
  CmdbObjectApi_getObjectRef,
} from "@next-sdk/cmdb-sdk";
import { http } from "@next-core/brick-http";

export function fetchCmdbObjectRef(
  objectId: string,
  sourceId?: string
): Promise<CmdbObjectApi_GetObjectRefResponseBody> {
  return sourceId
    ? http.post(
        "api/gateway/easyops.api.cmdb.topo_center.ProxyGetObjectRef@1.0.0/api/v1/proxy-get-object-ref",
        {
          ref_object: objectId,
          sourceId,
        }
      )
    : CmdbObjectApi_getObjectRef({ ref_object: objectId });
}
