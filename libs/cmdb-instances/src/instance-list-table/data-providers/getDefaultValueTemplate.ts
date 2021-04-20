import {
  InstanceApi_GetDefaultValueTemplateRequestParams,
  InstanceApi_GetDefaultValueTemplateResponseBody,
  InstanceApi_getDefaultValueTemplate,
} from "@next-sdk/cmdb-sdk"; // 获取实例默认值模板

// 获取实例默认值模板
export function getDefaultValueTemplate(
  objectId: string | number,
  params?: InstanceApi_GetDefaultValueTemplateRequestParams
): Promise<InstanceApi_GetDefaultValueTemplateResponseBody> {
  return InstanceApi_getDefaultValueTemplate(objectId, params);
}
