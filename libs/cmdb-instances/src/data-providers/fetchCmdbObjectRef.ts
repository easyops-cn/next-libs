import { CmdbObjectApi } from "@sdk/cmdb-sdk";

export function fetchCmdbObjectRef(
  objectId: string
): Promise<CmdbObjectApi.GetObjectRefResponseBody> {
  return CmdbObjectApi.getObjectRef({ ref_object: objectId });
}
