export * from "./searchCmdbInstances";

import { CmdbModels } from "@sdk/cmdb-sdk";

export const HOST: Partial<CmdbModels.ModelCmdbObject> = {
  objectId: "HOST",
  name: "主机",
  icon: "",
  category: "基础设施",
  memo: "",
  protected: false,
  view: {
    attr_order: [
      "ip",
      "_agentStatus",
      "cpu",
      "cpuHz",
      "cpuModel",
      "cpus",
      "diskSize",
      "eth",
      "memSize",
      "memo",
      // "osArchitecture",
      // "osDistro",
      // "osRelease",
      // "osSystem",
      // "osVersion",
      "status",
      "hostname",
      "owner",
      "_deviceList_CLUSTER",
      "deviceId"
    ],
    hide_columns: ["deviceId"],
    relation_view: {
      _deviceList_CLUSTER: ["name"],
      owner: ["name"]
    },
    showHideAttrs: true,
    show_key: ["ip", "hostname"]
  },
  attrList: [
    {
      id: "_agentStatus",
      name: "agent状态",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "enum",
        regex: ["未安装", "异常", "正常"],
        default_type: "",
        default: "未安装",
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "cpu",
      name: "CPU信息",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "struct",
        regex: null,
        default_type: "",
        default: null,
        struct_define: [
          {
            id: "brand",
            name: "型号",
            type: "str",
            regex: null,
            protected: true
          },
          {
            id: "architecture",
            name: "架构",
            type: "str",
            regex: null,
            protected: true
          },
          {
            id: "hz",
            name: "频率",
            type: "str",
            regex: null,
            protected: true
          },
          {
            id: "logical_cores",
            name: "逻辑核数",
            type: "int",
            regex: null,
            protected: true
          },
          {
            id: "physical_cores",
            name: "物理核数",
            type: "int",
            regex: null,
            protected: true
          }
        ],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "cpuHz",
      name: "CPU频率",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "int",
        regex: null,
        default_type: "value",
        default: 0,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "cpuModel",
      name: "CPU型号",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "str",
        regex: null,
        default_type: "value",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "cpus",
      name: "CPU总数",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "int",
        regex: null,
        default_type: "value",
        default: 0,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "deviceId",
      name: "设备ID",
      protected: true,
      custom: "true",
      unique: "true",
      readonly: "true",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "str",
        regex: null,
        default_type: "function",
        default: "guid()",
        struct_define: [],
        mode: "default",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "diskSize",
      name: "磁盘大小",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "int",
        regex: null,
        default_type: "value",
        default: 0,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "eth",
      name: "网卡信息",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "structs",
        regex: null,
        default_type: "",
        default: null,
        struct_define: [
          {
            id: "name",
            name: "网卡",
            type: "str",
            regex: null,
            protected: true
          },
          {
            id: "status",
            name: "状态",
            type: "enum",
            regex: [],
            protected: true
          },
          {
            id: "ip",
            name: "关联IP",
            type: "str",
            regex: null,
            protected: true
          },
          {
            id: "mask",
            name: "子网掩码",
            type: "str",
            regex: null,
            protected: true
          },
          {
            id: "speed",
            name: "速度",
            type: "int",
            regex: null,
            protected: true
          },
          {
            id: "mac",
            name: "MAC",
            type: "str",
            regex: null,
            protected: true
          },
          {
            id: "broadcast",
            name: "广播地址",
            type: "str",
            regex: null,
            protected: true
          }
        ],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "hostname",
      name: "主机名",
      protected: false,
      custom: "false",
      unique: "false",
      readonly: "false",
      required: "true",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "str",
        regex: null,
        default_type: "value",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "ip",
      name: "IP",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "true",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "ip",
        regex:
          "^((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)(\\[[^\\[\\],;\\s]{1,100}\\])?$",
        default_type: "",
        default: null,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "memSize",
      name: "内存大小",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "int",
        regex: null,
        default_type: "value",
        default: 0,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "memo",
      name: "备注",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "str",
        regex: null,
        default_type: "value",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "osArchitecture",
      name: "操作系统架构",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "str",
        regex: null,
        default_type: "value",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "osDistro",
      name: "操作系统发行版本",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "str",
        regex: null,
        default_type: "value",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "osRelease",
      name: "操作系统内核发行版本",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "str",
        regex: null,
        default_type: "value",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "osSystem",
      name: "操作系统类型",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "str",
        regex: null,
        default_type: "value",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "osVersion",
      name: "操作系统",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "str",
        regex: null,
        default_type: "value",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "status",
      name: "运营状态",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "true",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "enum",
        regex: [
          "运营中",
          "故障中",
          "未上线",
          "下线隔离中",
          "开发机",
          "测试机",
          "维修中",
          "报废"
        ],
        default_type: "",
        default: null,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "tag",
      name: "标签",
      protected: false,
      custom: "false",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: [],
      description: "",
      tips: "",
      value: {
        type: "arr",
        regex: null,
        default_type: "",
        default: null,
        struct_define: [],
        mode: "default",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    }
  ],
  relation_groups: [
    {
      id: "_user",
      name: "负责人",
      protected: true
    },
    {
      id: "_relate_connect",
      name: "位置信息",
      protected: true
    },
    {
      id: "basic_info",
      name: "基本属性",
      protected: true
    }
  ],
  relation_list: [
    {
      relation_id: "CLUSTER_deviceList_HOST",
      name: "",
      protected: false,
      left_object_id: "CLUSTER",
      left_id: "deviceList",
      left_description: "所属集群",
      left_name: "主机",
      left_min: 0,
      left_max: -1,
      left_groups: ["_relate_connect"],
      left_tags: [],
      right_object_id: "HOST",
      right_id: "_deviceList_CLUSTER",
      right_description: "主机",
      right_name: "所属集群",
      right_min: 0,
      right_max: -1,
      right_groups: [],
      right_tags: [],
      _version: 0
    },
    {
      relation_id: "HOST_owner_USER",
      name: "",
      protected: false,
      left_object_id: "HOST",
      left_id: "owner",
      left_description: "负责运维的主机",
      left_name: "运维负责人",
      left_min: 0,
      left_max: -1,
      left_groups: ["_user", "basic_info"],
      left_tags: [],
      right_object_id: "USER",
      right_id: "_owner_HOST",
      right_description: "运维负责人",
      right_name: "负责运维的主机",
      right_min: 0,
      right_max: -1,
      right_groups: [],
      right_tags: [],
      _version: 0
    }
  ],
  updateAuthorizers: [],
  deleteAuthorizers: [],
  wordIndexDenied: false,
  _version: 3,
  creator: "",
  modifier: "easyops"
};
