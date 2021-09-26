import { Attribute } from "./interfaces";
export const structData = {
  arr: ["abc", "def"],
  str: "string",
  int: 1000,
  ip: "0.0.0.0",
  enum1: "1",
  enum2: "3",
  date: "2019-05-24",
  datetime: "2019-05-24 12:00:00",
  enums: ["1", "3"],
  float: 100.1,
  json: "666",
  bool: true,
  json1: { test: "666" },
};
export const structData2 = {
  arr: ["ppp"],
  str: "string2",
  int: 100,
  ip: "10.0.0.0",
  enum: "5",
  date: "2019-05-23",
  datetime: "2019-05-24 23:00:00",
  enums: ["1", "3", "5"],
  float: 100.1,
};
export const structList = [structData, structData2];
export const attribute: Attribute = {
  name: "结构体",
  id: "struct",
  value: {
    type: "structs",
    struct_define: [
      {
        id: "arr",
        name: "数组",
        type: "arr",
      },
      {
        id: "str",
        name: "字符串",
        type: "str",
      },
      {
        id: "int",
        name: "整型",
        type: "int",
      },
      {
        id: "ip",
        name: "IP地址",
        type: "ip",
      },
      {
        id: "enum1",
        name: "枚举(<6)",
        type: "enum",
        regex: ["1", "3", "5", "7", "9"],
      },
      {
        id: "enum2",
        name: "枚举(>=6)",
        type: "enum",
        regex: ["1", "3", "5", "7", "9", "11"],
      },
      {
        id: "date",
        name: "日期",
        type: "date",
      },
      {
        id: "datetime",
        name: "时间",
        type: "datetime",
      },
      {
        id: "enums",
        name: "枚举多选",
        type: "enums",
        regex: ["1", "3", "5", "7", "9"],
      },
      {
        id: "float",
        name: "浮点型",
        type: "float",
      },
      {
        id: "bool",
        name: "布尔型",
        type: "bool",
      },
      {
        id: "json",
        name: "json",
        type: "json",
      },
      {
        id: "json1",
        name: "json1",
        type: "json",
      },
    ],
  },
};
export const attributeWithRegex: Attribute = {
  name: "结构体",
  id: "struct",
  value: {
    type: "structs",
    struct_define: [
      {
        id: "arr",
        name: "数组",
        type: "arr",
        regex: "^678",
      },
      {
        id: "str",
        name: "字符串",
        type: "str",
        regex: "^abc",
      },
      {
        id: "int",
        name: "整型",
        type: "int",
        regex: "10$",
      },
      {
        id: "ip",
        name: "IP地址",
        type: "ip",
        regex:
          "^((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)(\\[[^\\[\\],;\\s]{1,100}\\]|)$",
      },
      {
        id: "enum1",
        name: "枚举(<6)",
        type: "enum",
        regex: ["1", "3", "5", "7", "9"],
      },
      {
        id: "enum2",
        name: "枚举(>=6)",
        type: "enum",
        regex: ["1", "3", "5", "7", "9", "11"],
      },
      {
        id: "enums",
        name: "枚举多选",
        type: "enums",
        regex: ["1", "3", "5", "7", "9"],
      },
      {
        id: "json",
        name: "json",
        type: "json",
        regex: JSON.stringify({
          type: "object",
          properties: { city: { type: "string" }, number: { type: "number" } },
        }),
      },
    ],
  },
};
