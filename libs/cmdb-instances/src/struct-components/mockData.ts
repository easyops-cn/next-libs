import { Attribute } from "./interfaces";
export const structData = {
  arr: ["abc", "def"],
  str: "string",
  int: 1000,
  ip: "0.0.0.0",
  enum: "1",
  date: "2019-05-24",
  datetime: "2019-05-24 12:00:00",
  enums: ["1", "3"],
  float: 100.1,
  json: "666",
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
        name: "数组",
        type: "int",
      },
      {
        id: "ip",
        name: "IP地址",
        type: "ip",
      },
      {
        id: "enum",
        name: "枚举",
        type: "enum",
        regex: ["1", "3", "5", "7", "9"],
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
