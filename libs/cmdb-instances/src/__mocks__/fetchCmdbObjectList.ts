import { CmdbModels } from "@next-sdk/cmdb-sdk";

import { mockFetchCmdbObjectDetailReturnValue } from "./fetchCmdbObjectDetail";

export const mockFetchCmdbObjectListReturnValue: Partial<CmdbModels.ModelCmdbObject>[] = [
  {
    objectId: "CLUSTER",
    name: "集群",
    attrList: [
      {
        id: "name",
        name: "名称",
        value: {
          type: "str",
        },
      },
      {
        id: "type",
        name: "集群类型",
        value: {
          type: "enum",
          regex: ["0", "1", "2", "3"],
        },
      },
    ],
    relation_list: [
      {
        relation_id: "CLUSTER_deviceList_HOST",
        left_object_id: "CLUSTER",
        left_id: "deviceList",
        left_description: "所属集群",
        left_groups: ["basic_info"],
        right_object_id: "HOST",
        right_id: "_deviceList_CLUSTER",
        right_description: "主机",
        right_groups: [],
      },
    ],
    view: {
      attr_order: [],
      show_key: ["name", "type"],
    },
  },
  mockFetchCmdbObjectDetailReturnValue,
];
