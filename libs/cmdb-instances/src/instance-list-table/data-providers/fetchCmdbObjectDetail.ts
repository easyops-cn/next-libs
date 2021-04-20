import { CmdbModels, CmdbObjectApi_getDetail } from "@next-sdk/cmdb-sdk";

export function fetchCmdbObjectDetail(
  objectId: string
): Promise<Partial<CmdbModels.ModelCmdbObject>> {
  return CmdbObjectApi_getDetail(objectId, {});
}
