import {
  InstanceApi_PostSearchV3RequestBody,
  InstanceApi_PostSearchV3ResponseBody,
  InstanceApi_postSearchV3,
} from "@next-sdk/cmdb-sdk";

export function fetchCmdbInstanceSearch(
  objectId: string,
  params: InstanceApi_PostSearchV3RequestBody
): Promise<Partial<InstanceApi_PostSearchV3ResponseBody>> {
  return InstanceApi_postSearchV3(objectId, params);
}
