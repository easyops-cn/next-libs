import { formatAttrValue } from "./formatAttrValue";
import { getRuntime } from "@next-core/brick-kit";

jest.mock("@next-core/brick-kit");

(getRuntime as jest.Mock).mockReturnValue({
  getFeatureFlags: () => {
    return {
      "config-show-key": true,
    };
  },
});

describe("formatAttrValue", () => {
  const cases: [any, any, string, any][] = [
    [
      "123",
      {
        id: "agentVersion",
        name: "agent版本",
        protected: true,
        custom: "false",
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
          series_number_length: 0,
        },
        wordIndexDenied: false,
      },
      "HOST",
      "123",
    ],
    [
      [
        {
          device: "1",
          fstype: "1",
          mountpoint: "1",
          provider: "1",
          size: 1,
        },
      ],
      {
        id: "disk",
        name: "磁盘信息",
        protected: true,
        custom: "false",
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
              id: "device",
              name: "磁盘",
              type: "str",
              regex: null,
              protected: true,
            },
            {
              id: "fstype",
              name: "文件系统类型",
              type: "str",
              regex: null,
              protected: true,
            },
            {
              id: "mountpoint",
              name: "挂载点",
              type: "str",
              regex: null,
              protected: true,
            },
            {
              id: "size",
              name: "容量（KB）",
              type: "int",
              regex: null,
              protected: true,
            },
            {
              id: "provider",
              name: "网络挂载",
              type: "str",
              regex: null,
              protected: true,
            },
          ],
          mode: "",
          prefix: "",
          start_value: 0,
          series_number_length: 0,
        },
        wordIndexDenied: false,
      },
      "HOST",
      '[{"device":"1","fstype":"1","mountpoint":"1","provider":"1","size":1}]',
    ],
    [
      "未安装",
      {
        id: "_agentStatus",
        name: "agent状态",
        protected: true,
        custom: "false",
        unique: "false",
        readonly: "false",
        required: "false",
        tag: ["默认属性"],
        description: "",
        tips: "",
        value: {
          type: "enum",
          regex: ["未安装", "异常", "正常", "已卸载"],
          default_type: "",
          default: "未安装",
          struct_define: [],
          mode: "",
          prefix: "",
          start_value: 0,
          series_number_length: 0,
        },
        wordIndexDenied: false,
      },
      "HOST",
      "未安装",
    ],
    [
      1024,
      {
        id: "memSize",
        name: "内存大小",
        protected: true,
        custom: "false",
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
          default: null,
          struct_define: [],
          mode: "",
          prefix: "",
          start_value: 0,
          series_number_length: 0,
        },
        wordIndexDenied: false,
      },
      "HOST",
      "1 MB",
    ],
    [
      [1, 2, 3],
      {
        id: "arr",
        value: {
          type: "arr",
        },
      },
      "APP",
      "1; 2; 3",
    ],
    [
      [
        {
          value: 1,
        },
        {
          value: 2,
        },
        {
          value: 3,
        },
      ],
      {
        id: "enum",
        value: {
          type: "enum",
        },
      },
      "APP",
      "1 | 2 | 3",
    ],
    [
      [
        {
          k: "2",
        },
      ],
      {
        id: "FK",
        // relation_view: "k",
        value: {
          type: "FK",
          rule: {
            obj: "k",
          },
        },
        view: {
          visibleExternals: "k",
        },
      },
      "APP",
      "(2)",
    ],
    [
      [
        {
          k: "2",
          v: "3",
        },
      ],
      {
        id: "FK",
        relation_view: ["k", "v"],
        value: {
          type: "FK",
          rule: {
            obj: "k",
          },
          external: "v",
        },
        view: {
          visibleExternals: "k",
        },
      },
      "APP",
      "2(3)",
    ],
    [
      {
        k: "2",
        v: "3",
      },
      {
        id: "FK",
        relation_view: ["k", "v"],
        value: {
          type: "FK",
          rule: {
            obj: "k",
          },
          external: "v",
        },
        view: {
          visibleExternals: "k",
        },
        relation_id: "app",
      },
      "APP",
      "2; 3",
    ],
    [
      [
        {
          k: "1",
        },
        {
          k: "2",
        },
      ],
      {
        id: "FKs",
        relation_view: ["item", "v"],
        value: {
          type: "FKs",
          rule: {
            obj: "k",
          },
          external: "k",
        },
        view: {
          visibleExternals: "k",
        },
      },
      "APP",
      "1; 2",
    ],
    [
      [],
      {
        id: "struct",
        value: {
          type: "struct",
        },
      },
      "APP",
      "",
    ],
    [
      "123",
      {
        id: "struct",
        value: {
          type: "struct",
        },
      },
      "APP",
      "123",
    ],
    [
      [{ a: "a" }],
      {
        id: "app",
        value: {
          type: "json",
        },
      },
      "APP",
      JSON.stringify([{ a: "a" }]),
    ],
    [
      undefined,
      {
        id: "app",
        value: {
          type: "str",
        },
      },
      undefined,
      "",
    ],
  ];

  it.each(cases)(
    "formatAttrValue(%s, %s, %s) should return '%s'",
    (value, attr, objectId, expected) => {
      expect(formatAttrValue(value, attr, objectId)).toBe(expected);
    }
  );
});
