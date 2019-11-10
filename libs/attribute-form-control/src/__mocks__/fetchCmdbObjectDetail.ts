import { CmdbModels } from "@sdk/cmdb-sdk";

export const mockFetchCmdbObjectDetailReturnValue: Partial<
  CmdbModels.ModelCmdbObject
> = {
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
