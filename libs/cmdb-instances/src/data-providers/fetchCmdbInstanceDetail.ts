import {
  InstanceApi_GetDetailResponseBody,
  InstanceApi_getDetail,
  InstanceApi_GetDetailRequestParams,
} from "@next-sdk/cmdb-sdk";

export function fetchCmdbInstanceDetail(
  objectId: string,
  instanceId: string
): Promise<Partial<InstanceApi_GetDetailResponseBody>> {
  return InstanceApi_getDetail(objectId, instanceId, {});
}

export function fetchCmdbInstanceDetailByFields(
  objectId: string,
  instanceId: string,
  fields: string
): Promise<Partial<InstanceApi_GetDetailResponseBody>> {
  return InstanceApi_getDetail(objectId, instanceId, {
    fields,
  } as InstanceApi_GetDetailRequestParams);
}
