import { InstanceApi } from "@next-sdk/cmdb-sdk";

export const searchCmdbInstances = jest.fn(
  (objectId: string, params?: InstanceApi.PostSearchRequestBody) =>
    Promise.resolve(getInstanceListData())
);

export function getInstanceListData(total = 2, page = 1, pageSize = 20) {
  const instanceListData: InstanceApi.PostSearchResponseBody = {
    total: total,
    page: page,
    page_size: pageSize,
    list: [],
  };

  const startIndex = (instanceListData.page - 1) * instanceListData.page_size;
  const maxIndex = instanceListData.total - 1;
  let endIndex = startIndex + instanceListData.page_size - 1;
  if (endIndex > maxIndex) {
    endIndex = maxIndex;
  }

  for (let i = startIndex; i <= endIndex; i++) {
    const isWithinHalfPage =
      (i - startIndex + 1) / instanceListData.page_size < 0.5;
    instanceListData.list.push({
      _agentStatus: "正常",
      _deviceList_CLUSTER: [
        {
          _deployType: "default",
          _kubeContext: null,
          _object_id: "CLUSTER",
          _object_version: 0,
          _packageList: null,
          _resourceLimitCpu: null,
          _resourceLimitMemory: null,
          _resourceRequestCpu: null,
          _resourceRequestMemory: null,
          _ts: 1557901497,
          _version: 1,
          clusterId: "588e7355ed3cd",
          creator: "easyops",
          ctime: "2019-05-15 14:24:57",
          instanceId: "588e7355ed3cd",
          memo: null,
          name: "CLUSTER1",
          org: 8888,
          packageId: null,
          type: "3",
        },
        {
          _deployType: "default",
          _kubeContext: null,
          _object_id: "CLUSTER",
          _object_version: 0,
          _packageList: null,
          _resourceLimitCpu: null,
          _resourceLimitMemory: null,
          _resourceRequestCpu: null,
          _resourceRequestMemory: null,
          _ts: 1554103127,
          _version: 1,
          clusterId: "58572d4d7d28b",
          creator: "easyops",
          ctime: "2019-04-01 15:18:47",
          instanceId: "58572d4d7d28b",
          memo: null,
          name: "CLUSTER2",
          org: 8888,
          packageId: null,
          type: "0",
        },
      ],
      _object_id: "HOST",
      _object_version: 3,
      _order_ip: 192168100162,
      _pre_ts: 1557969925,
      _ts: 1557970526,
      _version: 9123,
      cpu: isWithinHalfPage
        ? {
            architecture: "X86_64",
            brand: "Intel(R) Xeon(R) CPU E5-2620 v3 @ 2.40GHz",
            hz: "2.4000 GHz",
            logical_cores: 24,
            physical_cores: 12,
          }
        : null,
      cpuHz: 2400,
      cpuModel: "Intel(R) Xeon(R) CPU E5-2620 v3 @ 2.40GHz",
      cpus: 12,
      creator: "easyops",
      ctime: "2019-02-22 11:30:56",
      deviceId: "faa9645baae058f117f467dfb958804a",
      diskSize: 513297100,
      eth: isWithinHalfPage
        ? [
            {
              broadcast: "192.168.100.255",
              ip: `192.168.100.${i}`,
              mac: "16:3A:A2:D2:1F:14",
              mask: "255.255.255.0",
              name: "eth0",
              speed: 10000,
              status: "Active",
            },
            {
              ip: "127.0.0.1",
              mac: "00:00:00:00:00:00",
              mask: "255.0.0.0",
              name: "lo",
              speed: 0,
              status: "Active",
            },
          ]
        : null,
      hostname: `HOST${i}`,
      instanceId: `5c6f6cf0d8079${i}`,
      ip: `192.168.100.${i}`,
      memSize: 33554432,
      memo: "",
      modifier: "easyops",
      mtime: "2019-05-16 09:35:26",
      org: 8888,
      osArchitecture: "x86_64",
      osDistro: "CentOS 6.10 Final",
      osRelease: "3.10.0-862.el7.x86_64",
      osSystem: "Linux",
      osVersion: "Linux 3.10.0-862.el7.x86_64",
      owner: [],
      status: "运营中",
      tag: isWithinHalfPage ? ["aaa", "bbb", "ccc"] : null,
    });
  }

  return instanceListData;
}
