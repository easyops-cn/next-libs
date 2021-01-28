import { CmdbModels, CmdbObjectApi } from "@next-sdk/cmdb-sdk";

export function fetchCmdbObjectDetail(
  objectId: string
): Promise<Partial<CmdbModels.ModelCmdbObject>> {
  return CmdbObjectApi.getDetail(objectId, {});
}
