import {
  CmdbObjectApi_GetObjectAllResponseBody,
  CmdbObjectApi_getObjectAll,
} from "@next-sdk/cmdb-sdk";

export function fetchCmdbObjectList(): Promise<CmdbObjectApi_GetObjectAllResponseBody> {
  return CmdbObjectApi_getObjectAll({});
}
