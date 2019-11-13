export const mockFetchPermissionListReturnValue = {
  data: [
    {
      action: "cmdb:HOST_instance_update",
      remark: "主机资源实例编辑"
    },
    {
      action: "cmdb:HOST_instance_operate",
      remark: "主机资源实例操作"
    },
    {
      action: "cmdb:HOST_instance_delete",
      remark: "主机资源实例编辑"
    },
    {
      action: "cmdb:HOST_instance_access",
      remark: "主机资源实例编辑"
    }
  ]
};

export const fetchPermissionList = jest.fn(() =>
  Promise.resolve(() => mockFetchPermissionListReturnValue)
);
