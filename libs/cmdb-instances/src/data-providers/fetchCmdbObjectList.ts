import { CmdbObjectApi } from "@sdk/cmdb-sdk";

export function fetchCmdbObjectList(): Promise<
  CmdbObjectApi.GetObjectAllResponseBody
> {
  return CmdbObjectApi.getObjectAll({});
}
