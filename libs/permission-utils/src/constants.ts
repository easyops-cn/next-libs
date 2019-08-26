export const PERM_SYSTEM_SETTINGS_OPS_AUTOMATION_MENU_MANAGE =
  "system_settings:ops_automation_menu_manage";

// =================
// 权限控制点
// =================

// 包实例权限
export const PERM_APP_PACKAGE_START = "deploy:app_package_start_operation";
export const PERM_APP_PACKAGE_RESTART = "deploy:app_package_restart_operation";
export const PERM_APP_PACKAGE_STOP = "deploy:app_package_stop_operation";
export const PERM_APP_PACKAGE_UNINSTALL =
  "deploy:app_package_uninstall_operation";
export const PERM_APP_PACKAGE_CHECK =
  "deploy:app_package_check_package_operation";
export const PERM_APP_PACKAGE_CLEAR =
  "deploy:app_package_clear_history_operation";

// 工具权限
export const PERM_TOOL_CREATE = "tool:POST:/tools";
export const PERM_TOOL_READ = "tool:GET:/tools/@packageId";
export const PERM_TOOL_EXECUTE = "tool:POST:/tools/execution";
export const PERM_TOOL_EXECUTE_AS_ROOT =
  "tool:POST:/tools/root_execution/@user";
export const PERM_TOOL_UPDATE = "tool:PUT:/tools/@packageId";
export const PERM_TOOL_DELETE = "tool:DELETE:/tools/@packageId";
export const PERM_TOOL_READ_EXECUTION = "tool:GET:/tools/execution_result";
export const PERM_TOOL_APPROVE = "tools:check_tool";

// 流程权限
export const PERM_FLOW_CREATE = "flow:POST:/flows";
export const PERM_FLOW_READ = "flow:GET:/flows/@packageId";
export const PERM_FLOW_EXECUTE = "flow:POST:/flows/execution";
export const PERM_FLOW_UPDATE = "flow:PUT:/flows/@packageId";
export const PERM_FLOW_DELETE = "flow:DELETE:/flows/@packageId";

// 流水线
export const KEY_DEVELOP_PIPELINE_OPERATE_AUTHORIZERS =
  "developPipelineOperateAuthorizers";
export const KEY_TEST_PIPELINE_OPERATE_AUTHORIZERS =
  "testPipelineOperateAuthorizers";
export const KEY_PRODUCTION_PIPELINE_OPERATE_AUTHORIZERS =
  "productionPipelineOperateAuthorizers";

export const defListPipelineOperate = [
  {
    type: "development",
    action: "tools:APP_development_pipeline_operations",
    keyAuthorizers: KEY_DEVELOP_PIPELINE_OPERATE_AUTHORIZERS
  },
  {
    type: "test",
    action: "tools:APP_test_pipeline_operations",
    keyAuthorizers: KEY_TEST_PIPELINE_OPERATE_AUTHORIZERS
  },
  {
    type: "production",
    action: "tools:APP_production_pipeline_operations",
    keyAuthorizers: KEY_PRODUCTION_PIPELINE_OPERATE_AUTHORIZERS
  }
];
const getDefOfPipelineOperate: any = (type: any) =>
  defListPipelineOperate.find(item => item.type === type) ||
  defListPipelineOperate[0];

// 流水线模板
export const PERM_PIPELINE_TEMPLATE_CREATE = "tools:pipeline_template_create";
export const PERM_PIPELINE_TEMPLATE_READ = "tools:pipeline_template_access";
export const PERM_PIPELINE_TEMPLATE_UPDATE = "tools:pipeline_template_update";
export const PERM_PIPELINE_TEMPLATE_DELETE = "tools:pipeline_template_delete";

export const getPermOfPipelineOperate = (type: any) =>
  getDefOfPipelineOperate(type)["action"];

// 运维自动化
export const PERM_OPS_AUTOMATION_MENU_MANAGE =
  "system_settings:ops_automation_menu_manage";

// 包
export const PERM_PACKAGE_CREATE = "deploy:package_create";
export const PERM_PACKAGE_READ = "deploy:package_read";
export const PERM_PACKAGE_UPDATE = "deploy:package_update";
export const PERM_PACKAGE_DELETE = "deploy:package_delete";
export const PERM_PACKAGE_BATCH_ROLLBACK = "deploy:package_batch_rollback";
export const PERM_PACKAGE_BATCH_DEPLOY = "deploy:package_batch_deploy";

// 包版本
export const PERM_PACKAGE_VERSION_CREATE = "deploy:package_version_create";
export const PERM_PACKAGE_VERSION_UPDATE = "deploy:package_version_update";
export const PERM_PACKAGE_VERSION_DELETE = "deploy:package_version_delete";

// 定时任务
export const PERM_SCHEDULER_CREATE = "scheduler:create_task";
export const PERM_SCHEDULER_UPDATE = "scheduler:update_task";
export const PERM_SCHEDULER_DELETE = "scheduler:delete_task";
export const PERM_SCHEDULER_OPERATE = "scheduler:operate_task";

// CMDB 模型
export const PERM_CMDB_MODEL_CREATE = "cmdb:object_create";
export const PERM_CMDB_MODEL_UPDATE = "cmdb:object_update";
export const PERM_CMDB_MODEL_DELETE = "cmdb:object_delete";
export const PERM_CMDB_MODEL_IMPORT = "cmdb:object_import";
export const PERM_CMDB_MODEL_EXPORT = "cmdb:object_export";

// DASHBOARD 权限控制
export const PERM_DASHBOARD_ACCESS = "dc_console:dashboard:access";
export const PERM_DASHBOARD_CREATE = "dc_console:dashboard:create";
export const PERM_DASHBOARD_UPDATE = "dc_console:dashboard:update";
export const PERM_DASHBOARD_DELETE = "dc_console:dashboard:delete";

// 私有仓库
export const PERM_REPOSITORY_CREATE = "EasyKube:Repository:Create";
export const PERM_REPOSITORY_UPDATE = "EasyKube:Repository:Update";
export const PERM_REPOSITORY_DELETE = "EasyKube:Repository:Delete";

// 部署编排
export const PERM_ORCHESTRATION_PROPOSAL_ACCESS = "flow_task:proposal:access";
export const PERM_ORCHESTRATION_PROPOSAL_CREATE = "flow_task:proposal:create";
export const PERM_ORCHESTRATION_PROPOSAL_UPDATE = "flow_task:proposal:update";
export const PERM_ORCHESTRATION_PROPOSAL_DELETE = "flow_task:proposal:delete";
export const PERM_ORCHESTRATION_PLAN_CREATE = "flow_task:plan:create";
export const PERM_ORCHESTRATION_TEMPLATE_SAVE = "flow_task:template:save";
export const PERM_ORCHESTRATION_TEMPLATE_ACCESS = "flow_task:template:access";
export const PERM_ORCHESTRATION_TEMPLATE_CREATE = "flow_task:template:create";
export const PERM_ORCHESTRATION_TEMPLATE_UPDATE = "flow_task:template:update";
export const PERM_ORCHESTRATION_TEMPLATE_DELETE = "flow_task:template:delete";

// CMDB 实例
const getPermOfCmdbInstance = (objectId: string, action: string) =>
  `cmdb:${objectId}_instance_${action}`;
export const getPermOfCmdbInstanceCreate = (objectId: string) =>
  getPermOfCmdbInstance(objectId, "create");
export const getPermOfCmdbInstanceUpdate = (objectId: string) =>
  getPermOfCmdbInstance(objectId, "update");
export const getPermOfCmdbInstanceDelete = (objectId: string) =>
  getPermOfCmdbInstance(objectId, "delete");
export const getPermOfCmdbInstanceRead = (objectId: string) =>
  getPermOfCmdbInstance(objectId, "access");

// CMDB 其它
export const PERM_CMDB_AGENT_INSTALL = "cmdb:agent_install";
export const PERM_CMDB_API_KEY_MANAGE = "cmdb:apikey_manage";
export const PERM_CMDB_CLOUD_KEY_MANAGE = "cmdb:cloud_key_pair_admin";
export const PERM_CMDB_USER_INVITE = "cmdb:user_invite";

// export const getPermOfCmdbModel = (objectId, action) => getPermOfCmdb(objectId, "object", action);
// export const getPermOfCmdbModelUpdate = (objectId) => getPermOfCmdbModel(objectId, "update");
// export const getPermOfCmdbModelDelete = (objectId) => getPermOfCmdbModel(objectId, "delete");

// 各类型集群操作
export const getPermOfClusterOperate = (type: string) =>
  `deploy:${type}_cluster_operate`;
const PERM_DEVELOP_CLUSTER_OPERATE = getPermOfClusterOperate("develop");
const PERM_TEST_CLUSTER_OPERATE = getPermOfClusterOperate("test");
const PERM_PRERELEASE_CLUSTER_OPERATE = getPermOfClusterOperate("prerelease");
const PERM_PRODUCTION_CLUSTER_OPERATE = getPermOfClusterOperate("production");

// =================
// 实例权限白名单
// =================

// 白名单字段
export const KEY_CREATE_AUTHORIZERS = "createAuthorizers";
export const KEY_READ_AUTHORIZERS = "readAuthorizers";
export const KEY_EXECUTE_AUTHORIZERS = "executeAuthorizers";
export const KEY_EXECUTE_AS_ROOT_AUTHORIZERS = "rootExecuteAuthorizers";
export const KEY_UPDATE_AUTHORIZERS = "updateAuthorizers";
export const KEY_DELETE_AUTHORIZERS = "deleteAuthorizers";
export const KEY_OPERATE_AUTHORIZERS = "operateAuthorizers";
export const KEY_READ_EXECUTION_AUTHORIZERS = "readExecutionResultAuthorizers";
export const KEY_DEVELOP_CLUSTER_OPERATE_AUTHORIZERS =
  "developClusterOperateAuthorizers";
export const KEY_TEST_CLUSTER_OPERATE_AUTHORIZERS =
  "testClusterOperateAuthorizers";
export const KEY_PRERELEASE_CLUSTER_OPERATE_AUTHORIZERS =
  "prereleaseClusterOperateAuthorizers";
export const KEY_PRODUCTION_CLUSTER_OPERATE_AUTHORIZERS =
  "productionClusterOperateAuthorizers";
export const KEY_APP_PACKAGE_START_AUTHORIZERS = "appPackageStartAuthorizers";
export const KEY_APP_PACKAGE_RESTART_AUTHORIZERS =
  "appPackageRestartAuthorizers";
export const KEY_APP_PACKAGE_STOP_AUTHORIZERS = "appPackageStopAuthorizers";
export const KEY_APP_PACKAGE_UNINSTALL_AUTHORIZERS =
  "appPackageUninstallAuthorizers";
export const KEY_APP_PACKAGE_CHECK_AUTHORIZERS =
  "appPackageCheckPackageAuthorizers";
export const KEY_APP_PACKAGE_CLEAR_AUTHORIZERS =
  "appPackageClearHistoryAuthorizers";

// 根据权限控制点获取对应的白名单字段的映射
export const KEY_AUTHORIZERS_OF_PERM: any = {};

// =================
// 数据权限控制点集合
// =================

// 包实例权限集合
export const PERM_SET_OF_APP_INSTANCE = [
  PERM_APP_PACKAGE_START,
  PERM_APP_PACKAGE_RESTART,
  PERM_APP_PACKAGE_STOP,
  PERM_APP_PACKAGE_UNINSTALL,
  PERM_APP_PACKAGE_CHECK,
  PERM_APP_PACKAGE_CLEAR
];
KEY_AUTHORIZERS_OF_PERM[
  PERM_APP_PACKAGE_START
] = KEY_APP_PACKAGE_START_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[
  PERM_APP_PACKAGE_RESTART
] = KEY_APP_PACKAGE_RESTART_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[
  PERM_APP_PACKAGE_STOP
] = KEY_APP_PACKAGE_STOP_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[
  PERM_APP_PACKAGE_UNINSTALL
] = KEY_APP_PACKAGE_UNINSTALL_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[
  PERM_APP_PACKAGE_CHECK
] = KEY_APP_PACKAGE_CHECK_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[
  PERM_APP_PACKAGE_CLEAR
] = KEY_APP_PACKAGE_CLEAR_AUTHORIZERS;

// 工具数据权限集合
export const PERM_SET_OF_TOOL_INSTANCE = [
  PERM_TOOL_DELETE,
  PERM_TOOL_UPDATE,
  PERM_TOOL_READ,
  PERM_TOOL_EXECUTE,
  PERM_TOOL_EXECUTE_AS_ROOT,
  PERM_TOOL_READ_EXECUTION
];
KEY_AUTHORIZERS_OF_PERM[PERM_TOOL_READ] = KEY_READ_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_TOOL_UPDATE] = KEY_UPDATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_TOOL_DELETE] = KEY_DELETE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_TOOL_EXECUTE] = KEY_EXECUTE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[
  PERM_TOOL_EXECUTE_AS_ROOT
] = KEY_EXECUTE_AS_ROOT_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[
  PERM_TOOL_READ_EXECUTION
] = KEY_READ_EXECUTION_AUTHORIZERS;

// 流程数据权限集合
export const PERM_SET_OF_FLOW_INSTANCE = [
  PERM_FLOW_DELETE,
  PERM_FLOW_UPDATE,
  PERM_FLOW_READ,
  PERM_FLOW_EXECUTE
];
KEY_AUTHORIZERS_OF_PERM[PERM_FLOW_READ] = KEY_READ_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_FLOW_UPDATE] = KEY_UPDATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_FLOW_DELETE] = KEY_DELETE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_FLOW_EXECUTE] = KEY_EXECUTE_AUTHORIZERS;

// 流水线数据权限集合
defListPipelineOperate.forEach(def => {
  KEY_AUTHORIZERS_OF_PERM[def.action] = def.keyAuthorizers;
});

// 流水线模板数据权限集合
export const PERM_SET_OF_PIPELINE_TEMPLATE_INSTANCE = [
  PERM_PIPELINE_TEMPLATE_DELETE,
  PERM_PIPELINE_TEMPLATE_UPDATE,
  PERM_PIPELINE_TEMPLATE_READ
];
KEY_AUTHORIZERS_OF_PERM[PERM_PIPELINE_TEMPLATE_READ] = KEY_READ_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_PIPELINE_TEMPLATE_UPDATE] = KEY_UPDATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_PIPELINE_TEMPLATE_DELETE] = KEY_DELETE_AUTHORIZERS;

// 包数据权限集合
export const PERM_SET_OF_PACKAGE_INSTANCE = [
  PERM_PACKAGE_DELETE,
  PERM_PACKAGE_UPDATE,
  PERM_PACKAGE_READ
];
KEY_AUTHORIZERS_OF_PERM[PERM_PACKAGE_UPDATE] = KEY_UPDATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_PACKAGE_DELETE] = KEY_DELETE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_PACKAGE_READ] = KEY_READ_AUTHORIZERS;

// 包版本数据权限集合
export const PERM_SET_OF_PACKAGE_VERSION_INSTANCE = [
  PERM_PACKAGE_VERSION_DELETE,
  PERM_PACKAGE_VERSION_UPDATE
];
KEY_AUTHORIZERS_OF_PERM[PERM_PACKAGE_VERSION_UPDATE] = KEY_UPDATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_PACKAGE_VERSION_DELETE] = KEY_DELETE_AUTHORIZERS;

// 定时任务数据权限集合
export const PERM_SET_OF_SCHEDULER_INSTANCE = [
  PERM_SCHEDULER_DELETE,
  PERM_SCHEDULER_UPDATE,
  PERM_SCHEDULER_OPERATE
];
KEY_AUTHORIZERS_OF_PERM[PERM_SCHEDULER_UPDATE] = KEY_UPDATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_SCHEDULER_DELETE] = KEY_DELETE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_SCHEDULER_OPERATE] = KEY_OPERATE_AUTHORIZERS;

// 私有仓库数据权限集合
export const PERM_SET_OF_REPOSITORY_INSTANCE = [
  PERM_REPOSITORY_UPDATE,
  PERM_REPOSITORY_DELETE
];
KEY_AUTHORIZERS_OF_PERM[PERM_REPOSITORY_UPDATE] = KEY_UPDATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_REPOSITORY_DELETE] = KEY_DELETE_AUTHORIZERS;

// CMDB 实例数据权限集合
export const getPermSetOfCmdbInstance = (objectId: string) => {
  const set = [
    getPermOfCmdbInstanceDelete(objectId),
    getPermOfCmdbInstanceUpdate(objectId),
    getPermOfCmdbInstanceRead(objectId)
  ];
  if (objectId === "HOST") {
    // 主机包括操作权限
    set.push(getPermOfCmdbInstance(objectId, "operate"));
  } else if (objectId === "APP") {
    // 应用包括各类型集群操作权限
    set.push(
      ...[
        PERM_DEVELOP_CLUSTER_OPERATE,
        PERM_TEST_CLUSTER_OPERATE,
        PERM_PRERELEASE_CLUSTER_OPERATE,
        PERM_PRODUCTION_CLUSTER_OPERATE
      ],
      ...defListPipelineOperate.map(def => def.action),
      ...PERM_SET_OF_APP_INSTANCE
    );
  }
  return set;
};

// 各类型集群操作
KEY_AUTHORIZERS_OF_PERM[
  PERM_DEVELOP_CLUSTER_OPERATE
] = KEY_DEVELOP_CLUSTER_OPERATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[
  PERM_TEST_CLUSTER_OPERATE
] = KEY_TEST_CLUSTER_OPERATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[
  PERM_PRERELEASE_CLUSTER_OPERATE
] = KEY_PRERELEASE_CLUSTER_OPERATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[
  PERM_PRODUCTION_CLUSTER_OPERATE
] = KEY_PRODUCTION_CLUSTER_OPERATE_AUTHORIZERS;

const cmdbActToKeyAuthorizers: any = {
  create: KEY_CREATE_AUTHORIZERS,
  delete: KEY_DELETE_AUTHORIZERS,
  update: KEY_UPDATE_AUTHORIZERS,
  access: KEY_READ_AUTHORIZERS,
  operate: KEY_OPERATE_AUTHORIZERS
};

export const getKeyAuthorizersOfPerm = (action: string) => {
  // CMDB 的权限点不是固定的，需要解析权限点中的动作
  const [, cmdbAct] = (action.match(
    /^cmdb:(?:.+)_instance_(create|update|delete|access|operate)$/
  ) || []) as any;
  if (cmdbAct) {
    return cmdbActToKeyAuthorizers[cmdbAct];
  }
  return KEY_AUTHORIZERS_OF_PERM[action];
};

// CMDB 模型数据权限集合
export const PERM_SET_OF_CMDB_MODEL = [
  PERM_CMDB_MODEL_DELETE,
  PERM_CMDB_MODEL_UPDATE
];
KEY_AUTHORIZERS_OF_PERM[PERM_CMDB_MODEL_UPDATE] = KEY_UPDATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_CMDB_MODEL_DELETE] = KEY_DELETE_AUTHORIZERS;

// dashboard权限集合
export const PERM_SET_OF_DASHBOARD = [
  PERM_DASHBOARD_ACCESS,
  PERM_DASHBOARD_UPDATE,
  PERM_DASHBOARD_DELETE
];
KEY_AUTHORIZERS_OF_PERM[PERM_DASHBOARD_ACCESS] = KEY_READ_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_DASHBOARD_UPDATE] = KEY_UPDATE_AUTHORIZERS;
KEY_AUTHORIZERS_OF_PERM[PERM_DASHBOARD_DELETE] = KEY_DELETE_AUTHORIZERS;

/**
 * @example
 * import { FALLBACK_TO_SYSTEM_ADMIN_PERMISSIONS } from '../constants/cmdb'
 * @name FALLBACK_TO_SYSTEM_ADMIN_PERMISSIONS
 * @description 原本 CMDB-P 有这些权限点，但是后来放弃了，fallback 到系统管理员来执行
 */
export const FALLBACK_TO_SYSTEM_ADMIN_PERMISSIONS = [
  getPermOfCmdbInstanceCreate("USER"),
  getPermOfCmdbInstanceUpdate("USER"),
  getPermOfCmdbInstanceDelete("USER"),
  getPermOfCmdbInstanceCreate("USER_GROUP"),
  getPermOfCmdbInstanceUpdate("USER_GROUP"),
  getPermOfCmdbInstanceDelete("USER_GROUP")
];

export const isProtectedRole = (role: string) => role === "系统管理员";

export const LIST_OF_RELATIVE_PERM = [
  {
    action: PERM_ORCHESTRATION_PROPOSAL_CREATE,
    relativeActions: [
      PERM_ORCHESTRATION_PROPOSAL_ACCESS,
      PERM_FLOW_READ,
      PERM_FLOW_CREATE,
      PERM_FLOW_EXECUTE,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ
    ],
    relativeAuthorizers: [
      PERM_ORCHESTRATION_PROPOSAL_ACCESS,
      PERM_FLOW_READ,
      PERM_FLOW_CREATE,
      PERM_FLOW_EXECUTE,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ
    ]
  },
  {
    action: PERM_ORCHESTRATION_TEMPLATE_CREATE,
    relativeActions: [
      PERM_ORCHESTRATION_TEMPLATE_ACCESS,
      PERM_FLOW_READ,
      PERM_FLOW_CREATE,
      PERM_FLOW_EXECUTE,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ
    ],
    relativeAuthorizers: [
      PERM_ORCHESTRATION_TEMPLATE_ACCESS,
      PERM_FLOW_READ,
      PERM_FLOW_CREATE,
      PERM_FLOW_EXECUTE,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ
    ]
  },
  {
    action: PERM_ORCHESTRATION_TEMPLATE_SAVE,
    relativeActions: [
      PERM_ORCHESTRATION_PROPOSAL_ACCESS,
      PERM_ORCHESTRATION_TEMPLATE_CREATE,
      PERM_ORCHESTRATION_TEMPLATE_ACCESS,
      PERM_FLOW_READ,
      PERM_FLOW_CREATE,
      PERM_FLOW_EXECUTE,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ
    ],
    relativeAuthorizers: [
      PERM_ORCHESTRATION_PROPOSAL_ACCESS,
      PERM_ORCHESTRATION_TEMPLATE_CREATE,
      PERM_ORCHESTRATION_TEMPLATE_ACCESS,
      PERM_FLOW_READ,
      PERM_FLOW_CREATE,
      PERM_FLOW_EXECUTE,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ
    ]
  },
  {
    action: PERM_ORCHESTRATION_PROPOSAL_ACCESS,
    relativeActions: [PERM_FLOW_READ],
    relativeAuthorizers: [PERM_FLOW_READ]
  },
  {
    action: PERM_ORCHESTRATION_TEMPLATE_ACCESS,
    relativeActions: [PERM_FLOW_READ],
    relativeAuthorizers: [PERM_FLOW_READ]
  },
  {
    action: PERM_ORCHESTRATION_PROPOSAL_UPDATE,
    relativeActions: [
      PERM_FLOW_UPDATE,
      PERM_FLOW_READ,
      PERM_FLOW_EXECUTE,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ,
      PERM_ORCHESTRATION_PROPOSAL_ACCESS
    ],
    relativeAuthorizers: [
      PERM_FLOW_UPDATE,
      PERM_FLOW_READ,
      PERM_FLOW_EXECUTE,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ,
      PERM_ORCHESTRATION_PROPOSAL_ACCESS
    ]
  },
  {
    action: PERM_ORCHESTRATION_TEMPLATE_UPDATE,
    relativeActions: [
      PERM_FLOW_UPDATE,
      PERM_FLOW_READ,
      PERM_FLOW_EXECUTE,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ,
      PERM_ORCHESTRATION_TEMPLATE_ACCESS
    ],
    relativeAuthorizers: [
      PERM_FLOW_UPDATE,
      PERM_FLOW_READ,
      PERM_FLOW_EXECUTE,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ,
      PERM_ORCHESTRATION_TEMPLATE_ACCESS
    ]
  },
  {
    action: PERM_ORCHESTRATION_PROPOSAL_DELETE,
    relativeActions: [PERM_FLOW_DELETE, PERM_ORCHESTRATION_PROPOSAL_ACCESS],
    relativeAuthorizers: [PERM_FLOW_DELETE, PERM_ORCHESTRATION_PROPOSAL_ACCESS]
  },
  {
    action: PERM_ORCHESTRATION_TEMPLATE_DELETE,
    relativeActions: [PERM_FLOW_DELETE, PERM_ORCHESTRATION_TEMPLATE_ACCESS],
    relativeAuthorizers: [PERM_FLOW_DELETE, PERM_ORCHESTRATION_TEMPLATE_ACCESS]
  },
  {
    action: PERM_ORCHESTRATION_PLAN_CREATE,
    relativeActions: [
      PERM_ORCHESTRATION_PROPOSAL_ACCESS,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ,
      PERM_TOOL_READ_EXECUTION,
      PERM_FLOW_READ,
      PERM_FLOW_EXECUTE,
      PERM_TEST_CLUSTER_OPERATE,
      PERM_DEVELOP_CLUSTER_OPERATE,
      PERM_PRERELEASE_CLUSTER_OPERATE,
      PERM_PRODUCTION_CLUSTER_OPERATE,
      getPermOfCmdbInstanceRead("CLUSTER"),
      getPermOfCmdbInstanceRead("HOST"),
      getPermOfCmdbInstance("HOST", "operate")
    ],
    relativeAuthorizers: [
      PERM_ORCHESTRATION_PROPOSAL_ACCESS,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_EXECUTE_AS_ROOT,
      PERM_TOOL_READ,
      PERM_TOOL_READ_EXECUTION,
      PERM_FLOW_READ,
      PERM_FLOW_EXECUTE,
      PERM_TEST_CLUSTER_OPERATE,
      PERM_DEVELOP_CLUSTER_OPERATE,
      PERM_PRERELEASE_CLUSTER_OPERATE,
      PERM_PRODUCTION_CLUSTER_OPERATE,
      getPermOfCmdbInstanceRead("CLUSTER"),
      getPermOfCmdbInstanceRead("HOST"),
      getPermOfCmdbInstance("HOST", "operate")
    ]
  },
  {
    action: PERM_DASHBOARD_CREATE,
    relativeActions: [PERM_DASHBOARD_ACCESS],
    relativeAuthorizers: [PERM_DASHBOARD_ACCESS]
  },
  {
    action: PERM_TOOL_EXECUTE,
    relativeActions: [
      PERM_TOOL_READ,
      PERM_TOOL_READ_EXECUTION,
      getPermOfCmdbInstance("HOST", "operate")
    ],
    relativeAuthorizers: [PERM_TOOL_READ, PERM_TOOL_READ_EXECUTION]
  },
  {
    action: PERM_TOOL_EXECUTE_AS_ROOT,
    relativeActions: [
      PERM_TOOL_EXECUTE,
      PERM_TOOL_READ,
      PERM_TOOL_READ_EXECUTION,
      getPermOfCmdbInstance("HOST", "operate")
    ],
    relativeAuthorizers: [
      PERM_TOOL_EXECUTE,
      PERM_TOOL_READ,
      PERM_TOOL_READ_EXECUTION
    ]
  },
  {
    action: PERM_FLOW_EXECUTE,
    relativeActions: [
      PERM_FLOW_READ,
      PERM_TOOL_READ,
      PERM_TOOL_EXECUTE,
      PERM_TOOL_READ_EXECUTION,
      getPermOfCmdbInstance("HOST", "operate")
    ],
    relativeAuthorizers: [PERM_FLOW_READ]
  }
];

// 开发版本的工具不能在这些环境的主机执行
export const ENV_PRODUCTION_FOR_TOOL_AGENTS = ["生产"];
