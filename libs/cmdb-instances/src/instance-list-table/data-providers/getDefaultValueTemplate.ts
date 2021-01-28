import { InstanceApi } from "@next-sdk/cmdb-sdk";

// 获取实例默认值模板
export function getDefaultValueTemplate(
  objectId: string | number,
  params?: InstanceApi.GetDefaultValueTemplateRequestParams
): Promise<InstanceApi.GetDefaultValueTemplateResponseBody> {
  return InstanceApi.getDefaultValueTemplate(objectId, params);
}
