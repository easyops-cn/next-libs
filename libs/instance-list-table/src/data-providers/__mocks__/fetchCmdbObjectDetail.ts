import { CmdbModels } from "@sdk/cmdb-sdk";
/* eslint-disable @typescript-eslint/camelcase */

export const fetchCmdbObjectDetail = jest.fn(() =>
  Promise.resolve({
    name: "主机",
    objectId: "HOST",
    attrList: [
      {
        id: "__pipeline",
        name: "流水线信息",
        protected: true,
        custom: "true",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: ["默认属性"],
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
              name: "名称",
              type: "str",
              regex: null,
              protected: true
            },
            {
              id: "category",
              name: "分类",
              type: "str",
              regex: null,
              protected: true
            },
            {
              id: "flowId",
              name: "流程Id",
              type: "str",
              regex: null,
              protected: true
            },
            {
              id: "flowVersion",
              name: "流程版本",
              type: "int",
              regex: null,
              protected: true
            },
            {
              id: "templateId",
              name: "模板Id",
              type: "str",
              regex: null,
              protected: true
            },
            {
              id: "templateVersion",
              name: "模板版本",
              type: "int",
              regex: null,
              protected: true
            },
            {
              id: "rules",
              name: "rules",
              type: "str",
              regex: null,
              protected: true
            },
            {
              id: "subscribers",
              name: "subscribers",
              type: "arr",
              regex: null,
              protected: true
            },
            {
              id: "subscribedChannel",
              name: "subscribedChannel",
              type: "str",
              regex: null,
              protected: true
            },
            {
              id: "metadata",
              name: "metadata",
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
        id: "_defaultDeployStrategy",
        name: "默认部署策略",
        protected: true,
        custom: "true",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: ["默认属性"],
        description: "",
        tips: "",
        value: {
          type: "structs",
          regex: null,
          default_type: "",
          default: null,
          struct_define: [
            {
              id: "clusterType",
              name: "环境类型",
              type: "str",
              regex: null,
              protected: true
            },
            {
              id: "strategyId",
              name: "策略ID",
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
        id: "_hierarchy",
        name: "应用层级",
        protected: true,
        custom: "true",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: ["默认属性"],
        description: "",
        tips: "",
        value: {
          type: "enum",
          regex: [
            "接入上层",
            "接入中层",
            "接入下层",
            "逻辑上层",
            "逻辑中层",
            "逻辑下层",
            "数据上层",
            "数据中层",
            "数据下层"
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
        id: "_packageList",
        name: "包列表",
        protected: true,
        custom: "true",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: ["默认属性"],
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
              name: "包名称",
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
        id: "struct",
        name: "struct",
        protected: true,
        custom: "true",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: ["默认属性"],
        description: "",
        tips: "",
        value: {
          type: "struct",
          regex: null,
          default_type: "",
          default: null,
          struct_define: [
            {
              id: "name",
              name: "包名称",
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
        id: "_updatable",
        name: "可更新",
        protected: true,
        custom: "true",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: ["默认属性"],
        description: "",
        tips: "",
        value: {
          type: "int",
          regex: "^(0|1)$",
          default_type: "value",
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
        id: "appId",
        name: "应用ID",
        protected: true,
        custom: "true",
        unique: "false",
        readonly: "true",
        required: "false",
        tag: ["默认属性"],
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
        id: "asd",
        name: "momo",
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
      },
      {
        id: "auto_test_attr5266539355",
        name: "auto_test_attr5266539355",
        protected: false,
        custom: "false",
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
        id: "featureEnabled",
        name: "服务特征是否启用",
        protected: false,
        custom: "false",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: [],
        description: "",
        tips: "",
        value: {
          type: "enum",
          regex: ["true", "false"],
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
        id: "featurePriority",
        name: "服务特征优先级",
        protected: false,
        custom: "false",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: [],
        description: "",
        tips: "",
        value: {
          type: "str",
          regex: null,
          default_type: "auto-increment-id",
          default: null,
          struct_define: [],
          mode: "",
          prefix: "",
          start_value: 10,
          series_number_length: 0
        },
        wordIndexDenied: false
      },
      {
        id: "featureRule",
        name: "服务特征规则",
        protected: false,
        custom: "false",
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
              id: "method",
              name: "比较器",
              type: "enum",
              regex: [],
              protected: false
            },
            {
              id: "value",
              name: "值",
              type: "str",
              regex: null,
              protected: false
            },
            {
              id: "key",
              name: "特征ID",
              type: "str",
              regex: null,
              protected: false
            },
            {
              id: "label",
              name: "特征项",
              type: "str",
              regex: null,
              protected: false
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
        id: "hhhd",
        name: "传递函数",
        protected: false,
        custom: "false",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: [],
        description: "",
        tips: "",
        value: {
          type: "str",
          regex: null,
          default_type: "function",
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
        id: "jjjd",
        name: "尔尔测试",
        protected: false,
        custom: "false",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: [],
        description: "",
        tips: "",
        value: {
          type: "datetime",
          regex: null,
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
        id: "memo",
        name: "备注",
        protected: true,
        custom: "true",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: ["默认属性"],
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
        id: "name",
        name: "名称",
        protected: true,
        custom: "true",
        unique: "true",
        readonly: "false",
        required: "true",
        tag: ["默认属性"],
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
        id: "serviceId",
        name: "服务ID",
        protected: false,
        custom: "false",
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
        id: "testadd",
        name: "测试",
        protected: false,
        custom: "false",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: [],
        description: "",
        tips: "",
        value: {
          type: "str",
          regex: null,
          default_type: "function",
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
    relation_list: [
      {
        left_description: "负责备份的主机",
        left_groups: ["_user", "basic_info"],
        left_id: "backupowner",
        left_max: -1,
        left_min: 0,
        left_name: "备份负责人",
        left_object_id: "HOST",
        left_tags: [],
        name: "",
        protected: false,
        relation_id: "HOST_backupowner_USER",
        right_description: "备份负责人",
        right_groups: [],
        right_id: "_backupowner_HOST",
        right_max: -1,
        right_min: 0,
        right_name: "负责备份的主机",
        right_object_id: "USER",
        right_tags: [],
        _version: 0
      }
    ]
  })
);

export const mockFetchCmdbObjectDetailReturnValue: Partial<CmdbModels.ModelCmdbObject> = {
  objectId: "HOST",
  name: "主机",
  icon: "fa fa-hdd-o",
  category: "基础设施",
  memo: "",
  protected: true,
  view: {
    attr_order: ["hostname"],
    hide_columns: ["deviceId", "_deviceList_CLUSTER"],
    show_key: ["hostname"]
  },
  attrList: [
    {
      id: "_agentHeartBeat",
      name: "agent心跳",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: ["默认属性"],
      description: "",
      tips: "",
      value: {
        type: "int",
        regex: null,
        default_type: "value",
        default: -1,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "_agentStatus",
      name: "agent状态s",
      protected: true,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: ["默认属性"],
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
      id: "deviceId",
      name: "设备ID",
      protected: true,
      custom: "true",
      unique: "true",
      readonly: "true",
      required: "false",
      tag: ["默认属性"],
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
    },
    {
      id: "check_url2",
      name: "url2",
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
        regex: "baidu.com",
        default_type: "value",
        default: null,
        struct_define: [],
        mode: "url",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: false
    },
    {
      id: "check_array",
      name: "array",
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
        regex: "[0-9]{1,10}",
        default_type: "",
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
      id: "timeline",
      name: "日期选择",
      protected: false,
      custom: "false",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: ["基本信息"],
      description: "",
      tips: "",
      value: {
        type: "date",
        regex: null,
        default_type: "",
        default: "2019-05-29T16:00:00.000Z",
        struct_define: [],
        mode: "",
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
      left_description: "负责备份的主机",
      left_groups: ["_user", "basic_info"],
      left_id: "backupowner",
      left_max: -1,
      left_min: 0,
      left_name: "备份负责人",
      left_object_id: "HOST",
      left_tags: [],
      name: "",
      protected: false,
      relation_id: "HOST_backupowner_USER",
      right_description: "备份负责人",
      right_groups: [],
      right_id: "_backupowner_HOST",
      right_max: -1,
      right_min: 0,
      right_name: "负责备份的主机",
      right_object_id: "USER",
      right_tags: [],
      _version: 0
    }
  ],
  updateAuthorizers: [],
  deleteAuthorizers: [],
  wordIndexDenied: false,
  _version: 35,
  creator: "",
  modifier: "defaultUser"
};

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

export const _KUBERNETES_CLUSTER: Partial<CmdbModels.ModelCmdbObject> = {
  objectId: "_KUBERNETES_CLUSTER",
  name: "_KUBERNETES_CLUSTER",
  icon: "eo-icon-default",
  category: "平台资源.Kubernetes 集群资源",
  memo: "",
  protected: false,
  system: "container",
  view: {
    attr_order: [
      "name",
      "id",
      "host",
      "environment",
      "authMode",
      "authInfo",
      "tlsConfig"
    ],
    hide_columns: [],
    showHideAttrs: true,
    show_key: ["name"],
    visible: true
  },
  attrList: [
    {
      id: "name",
      name: "集群名称",
      protected: true,
      custom: "false",
      unique: "true",
      readonly: "false",
      required: "true",
      tag: ["基本信息"],
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
      wordIndexDenied: true
    },
    {
      id: "host",
      name: "集群地址",
      protected: false,
      custom: "true",
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
      wordIndexDenied: true
    },
    {
      id: "environment",
      name: "环境类型",
      protected: false,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "true",
      tag: ["基本信息"],
      description: "",
      tips: "",
      value: {
        type: "enum",
        regex: ["0", "1", "2", "3"],
        default_type: "",
        default: null,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: true
    },
    {
      id: "authMode",
      name: "授权模式",
      protected: false,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "true",
      tag: ["基本信息"],
      description: "",
      tips: "",
      value: {
        type: "enum",
        regex: ["basic", "clientCert"],
        default_type: "",
        default: null,
        struct_define: [],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: true
    },
    {
      id: "authInfo",
      name: "管理账号",
      protected: false,
      custom: "true",
      unique: "false",
      readonly: "false",
      required: "false",
      tag: ["基本信息"],
      description: "",
      tips: "",
      value: {
        type: "struct",
        regex: null,
        default_type: "",
        default: null,
        struct_define: [
          {
            id: "username",
            name: "用户名",
            type: "str",
            regex: null,
            protected: false
          },
          {
            id: "password",
            name: "密码",
            type: "str",
            regex: null,
            protected: false
          }
        ],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: true
    },
    {
      id: "tlsConfig",
      name: "证书信息",
      protected: false,
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
            id: "clientCertificate",
            name: "客户端证书",
            type: "str",
            regex: null,
            protected: false
          },
          {
            id: "clientKey",
            name: "客户端Key",
            type: "str",
            regex: null,
            protected: false
          },
          {
            id: "clusterCA",
            name: "集群证书",
            type: "str",
            regex: null,
            protected: false
          }
        ],
        mode: "",
        prefix: "",
        start_value: 0,
        series_number_length: 0
      },
      wordIndexDenied: true
    }
  ],
  relation_groups: [],
  relation_list: [
    {
      relation_id:
        "_KUBERNETES_CLUSTER__KUBERNETES_NAMESPACE__KUBERNETES_CLUSTER__KUBERNETES_NAMESPACE",
      name: "",
      protected: false,
      left_object_id: "_KUBERNETES_CLUSTER",
      left_id: "_KUBERNETES_NAMESPACE",
      left_description: "Kubernetes 集群",
      left_name: "命名空间",
      left_min: 0,
      left_max: -1,
      left_groups: [],
      left_tags: [],
      right_object_id: "_KUBERNETES_NAMESPACE",
      right_id: "_KUBERNETES_CLUSTER",
      right_description: "命名空间",
      right_name: "Kubernetes 集群",
      right_min: 0,
      right_max: 1,
      right_groups: [],
      right_tags: [],
      _version: 1
    },
    {
      relation_id:
        "_RESOURCE_GROUP__KUBERNETES_CLUSTER__RESOURCE_GROUP__KUBERNETES_CLUSTER",
      name: "",
      protected: false,
      left_object_id: "_RESOURCE_GROUP",
      left_id: "_KUBERNETES_CLUSTER",
      left_description: "部署资源组",
      left_name: "Kubernetes 集群",
      left_min: 0,
      left_max: 1,
      left_groups: [],
      left_tags: [],
      right_object_id: "_KUBERNETES_CLUSTER",
      right_id: "_RESOURCE_GROUP",
      right_description: "Kubernetes 集群",
      right_name: "部署资源组",
      right_min: 0,
      right_max: -1,
      right_groups: [],
      right_tags: [],
      _version: 1
    }
  ],
  updateAuthorizers: [],
  deleteAuthorizers: [],
  wordIndexDenied: true,
  _version: 23,
  creator: "defaultUser",
  modifier: "defaultUser"
};
