import {
  CmdbObjectApi_GetObjectRefResponseBody,
  CmdbObjectApi_getObjectRef,
} from "@next-sdk/cmdb-sdk";

export function fetchCmdbObjectRef(
  objectId: string
): Promise<CmdbObjectApi_GetObjectRefResponseBody> {
  return CmdbObjectApi_getObjectRef({ ref_object: objectId });
}
