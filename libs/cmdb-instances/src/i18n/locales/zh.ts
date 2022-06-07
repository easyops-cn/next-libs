import { Locale, K } from "../constants";

const locale: Locale = {
  [K.VALIDATE_MESSAGE_REQUIRED]: "%s 为必填项",
  [K.DYNAMIC_FILTER]: "动态过滤器",
  [K.TIP]: "提示",
  [K.DELETE]: "剔除",
  [K.INVALID_OR_FORBIDDEN_IPS]: "无效 IP 或没有权限的 IP：",
  [K.INVALID]: "无效的",
  [K.SELECT_FROM_CMDB]: "从 CMDB 中筛选",
  [K.IP_PLACEHOLDER]: "例如：192.168.100.1",
  [K.CLICK_TO_SELECT]: "点击选择",
  [K.MATCHING_REGULAR]: "匹配正则 {{regexp}}",
  [K.ADD]: "添加",
  [K.ENTER_MULTIPLE_STRING_WITH_ENTER_KEY_AS_THE_SEPARATOR]:
    "输入多个，以回车间隔",
  [K.UNIQUE_NO_REPEAT]: "{{label}}唯一不能重复",
  [K.TYPE_NO_SUPPORT_EDIT]: "{{type}}类型暂时不支持编辑",
  [K.TEMPORARILY_NOT_CHOOSE]: "暂不选择",
  [K.ENUM_ERROR_TIP]: "请在资源模型管理中添加枚举值, 属性:{{attribute}}",
  [K.STRUCT_ERROR_TIP]: "请在资源模型中添加结构体属性, 属性:{{attribute}}",
  [K.LINK]: "链接：",
  [K.LINK_PLACEHOLDER]: "请输入链接",
  [K.TITLE]: "标题：",
  [K.TITLE_PLACEHOLDER]: "选填，请输入显示的标题",
  [K.CLICK_TO_FILTER]: `点击筛选"{{label}}"`,
  [K.CLICK_TO_CANCEL_FILTER]: `点击取消筛选"{{label}}"`,
  [K.CLICK_TO_HIDDEN]: `点击隐藏"{{label}}"`,
  [K.CLICK_TO_SHOW]: `点击显示"{{label}}"`,
  [K.RELATED_TO_ME]: "与我有关",
  [K.DISPLAY_OMITTED_INFORMATION]: "省略信息",
  [K.CLEAR]: "清空",
  [K.NORMAL_HOST]: "正常主机",
  [K.CURRENT_FILTER_REQUIREMENTS]: "当前筛选条件：",
  [K.ADVANCED_SEARCH]: "高级搜索",
  [K.CHOSEN_OPTIONS]: "已选择 {{count}} 项",
  [K.FUZZY_SEARCH]: "模糊搜索：{{query}}",
  [K.BASIC_INFORMATION]: "基本信息",
  [K.MORE]: "更多",
  [K.DEFAULT_ATTRIBUTE]: "默认属性",
  [K.CANCEL]: "取消",
  [K.CLOSE]: "关闭",
  [K.DISPLAY_SETTINGS]: "显示设置",
  [K.FIELD_SETTINGS]: "字段设置",
  [K.SEARCH_BY_FIELD_NAME]: "按字段名称搜索",
  [K.RESTORE_DEFAULT]: "恢复默认",
  [K.CONFIRM]: "确定",
  [K.ONLY_ONE_INSTANCE_TO_ALLOWED]: "只允许选择一个实例",
  [K.OPERATOR_CONTAIN_DEFINE]: "包含",
  [K.OPERATOR_NOT_CONTAIN_DEFINE]: "不包含",
  [K.OPERATOR_NOT_EQUAL_DEFINE]: "不等于",
  [K.OPERATOR_EQUAL_DEFINE]: "等于",
  [K.OPERATOR_IS_EMPTY_DEFINE]: "为空",
  [K.OPERATOR_IS_NOT_EMPTY_DEFINE]: "不为空",
  [K.OPERATOR_BETWEEN_DEFINE_TEXT]: "范围",
  [K.OPERATOR_BETWEEN_DEFINE_TEXT_TIME]: "在此期间",
  [K.OPERATOR_BETWEEN_DEFINE_TEXT_INT]: "在此区间",
  [K.OPERATOR_BETWEEN_DEFINE_TEXT_THE]: "在此之间",
  [K.SEARCH]: "搜索",
  [K.RESET]: "重置",
  [K.CREATOR]: "创建者",
  [K.CREATION_TIME]: "创建时间",
  [K.MODIFIER]: "修改者",
  [K.LAST_MODIFICATION_TIME]: "修改时间",
  [K.DEVELOPMENT]: "开发",
  [K.VIEW]: "查看",
  [K.ITEM_ADD_IN_BATCHES]: "批量添加{{name}}",
  [K.SAVE]: "保存",
  [K.MODIFICATION]: "修改",
  [K.NOT_MEET_REGEX]: "不满足预设的正则表达式，请修改",
  [K.NOT_MEET_REGEX_DETAIL]: "不满足预设的正则表达式 {{regex}} ，请修改",
  [K.NOT_MEET_JSON]: "请填写正确的 json 语法",
  [K.CREATE_ANOTHER]: "创建另一个",
  [K.DELETE_STRUCT_CONFIRM_MSG]: "确定要删除该结构项吗？",
  [K.DELETE_INSTANCE_CONFIRM_MSG]: "确定要删除该关系吗？",
  [K.OPERATION]: "操作",
  [K.VIEW_ALL_SELECTED_INSTANCES]: "查看所有选择实例",
  [K.CHOOSE_INSTANCE]: "选择实例",
  [K.VIEW_ALL_DATA]: "查看全部{{ count }}条数据",
  [K.FILTER_FROM_CMDB]: "从 CMDB 中筛选{{name}}",
  [K.PAGINATION_TOTAL_TEXT]: "共",
  [K.PAGINATION_TOTAL_UNIT]: "项",
  [K.JUMP_TO]: "跳转到",
  [K.INSTANCE_DETAIL]: "实例详情",
  [K.COPY]: "复制",
  [K.COPY_SUCCESS]: "复制成功",
  [K.FILTER_FROM_CMDB_TYPE]: "从 CMDB 中筛选{{type}}",
  [K.USERS]: "用户",
  [K.USER_GROUPS]: "用户组",
  [K.SWITCH]: "切换{{type}}",
  [K.USERS_RESULT_LABEL]: "用户（仅显示前20项，更多结果请搜索）",
  [K.NO_DATA]: "暂无数据",
  [K.USER_GROUPS_RESULT_LABEL]: "用户组（仅显示前20项，更多结果请搜索）",
  [K.PERMISSION_WHITELIST]: "权限白名单",
  [K.ALL_CLUSTER]: "所有集群",
  [K.FREE_SELECTION]: "自由筛选",
  [K.APP_SELECTION]: "按应用筛选",
  [K.ATTRIBUTE_NAME_REQUIRED]: "{{attribute_name}} 为必填项",
  [K.INSTANCE_SOURCE]: "实例来源",
  [K.INSTANCE_SOURCE_TOOLTIP]: "实例来源于继承当前父模型的普通模型",
  [K.INSTANCE_SOURCE_TAG_TEXT]: '实例来源：等于"{{query}}"',
  [K.COPY_SELECTED_IP]: "复制选中IP",
  [K.SELECT_COPY_DATA]: "请选择需要复制的数据",
  [K.ADVANCE_SEARCH_SINGLE_INPUT_PLACEHOLDER]: "输入关键词，多值用空格隔开",
  [K.NUMBER_INPUT_PLACEHOLDER]: "输入数字",
  [K.FIX_HEADER]: "固定表头",
  [K.CANCEL_FIX_HEADER]: "取消固定表头",
};

export default locale;
