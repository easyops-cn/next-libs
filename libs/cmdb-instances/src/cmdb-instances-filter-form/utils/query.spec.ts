import {
  convertConditionsToQuery,
  convertQueryToConditions,
  convertQueryToAdvancedQuery,
} from "./query";

import { QueryOperatorValue } from "../constants/query";

const objectData = {
  objectId: "APP",
  name: "应用",
  attrList: [
    {
      id: "name",
      name: "名称",
      value: {
        type: "str",
      },
    },
  ],
  relation_list: [
    {
      relation_id: "APP_owner_USER",
      left_object_id: "APP",
      left_id: "owner",
      left_description: "负责运维的应用",
      left_groups: ["basic_info"],
      right_object_id: "USER",
      right_id: "_owner_APP",
      right_description: "运维负责人",
      right_groups: [],
    },
  ],
  view: {
    attr_order: ["name"],
  },
  __fieldList: [
    {
      __id: "name",
      __isRelation: false,
      id: "name",
      name: "名称",
      value: {
        type: "str",
      },
    },
    {
      __id: "owner",
      __isRelation: true,
      relation_id: "APP_owner_USER",
      left_object_id: "APP",
      left_id: "owner",
      left_description: "负责运维的应用",
      left_groups: ["basic_info"],
      right_object_id: "USER",
      right_id: "_owner_APP",
      right_description: "运维负责人",
      right_groups: [],
    },
  ],
};

const objectMap = {
  APP: objectData,
  USER: {
    objectId: "USER",
    name: "用户",
    attrList: [
      {
        id: "name",
        name: "名称",
        value: {
          type: "str",
        },
      },
    ],
    relation_list: [
      {
        relation_id: "APP_owner_USER",
        left_object_id: "APP",
        left_id: "owner",
        left_description: "负责运维的应用",
        left_groups: ["basic_info"],
        right_object_id: "USER",
        right_id: "_owner_APP",
        right_description: "运维负责人",
        right_groups: [],
      },
    ],
    view: {
      attr_order: [],
    },
  },
};

describe("convert query and conditions", () => {
  const conditions = [
    {
      fieldId: "name",
      operator: QueryOperatorValue.Contain,
      value: "TEST",
    },
    {
      fieldId: "name",
      operator: QueryOperatorValue.NotContain,
      value: "TEST",
    },
    {
      fieldId: "name",
      operator: QueryOperatorValue.Equal,
      value: "TEST",
    },
    {
      fieldId: "name",
      operator: QueryOperatorValue.NotEqual,
      value: "TEST",
    },
    {
      fieldId: "name",
      operator: QueryOperatorValue.Empty,
    },
    {
      fieldId: "name",
      operator: QueryOperatorValue.NotEmpty,
    },
  ];

  const query = {
    $and: [
      {
        $or: [
          {
            name: {
              $like: "%TEST%",
            },
          },
        ],
      },
      {
        $or: [
          {
            name: {
              $nlike: "%TEST%",
            },
          },
        ],
      },
      {
        $or: [
          {
            name: {
              $eq: "TEST",
            },
          },
        ],
      },
      {
        $or: [
          {
            name: {
              $ne: "TEST",
            },
          },
        ],
      },
      {
        $or: [
          {
            name: {
              $exists: false,
            },
          },
        ],
      },
      {
        $or: [
          {
            name: {
              $exists: true,
            },
          },
        ],
      },
    ],
  };

  it("should convert conditions to query correctly", () => {
    const result = convertConditionsToQuery(objectData.__fieldList, conditions);
    expect(result).toEqual(query);
    expect(convertConditionsToQuery([])).toEqual({});
  });

  it("should convert query to conditions correctly", () => {
    const result = convertQueryToConditions(objectMap, objectData, query);
    expect(result).toEqual(conditions);
  });

  it("should convert empty query to empty conditions correctly", () => {
    const result = convertQueryToConditions(objectMap, objectData, {});
    expect(result).toEqual([]);
  });
});

describe("convert query and conditions with relation", () => {
  const conditions = [
    {
      fieldId: "owner.name",
      operator: QueryOperatorValue.Contain,
      value: "TEST",
    },
    {
      fieldId: "owner.name",
      operator: QueryOperatorValue.NotContain,
      value: "TEST",
    },
    {
      fieldId: "owner.name",
      operator: QueryOperatorValue.Equal,
      value: "TEST",
    },
    {
      fieldId: "owner.name",
      operator: QueryOperatorValue.NotEqual,
      value: "TEST",
    },
    {
      fieldId: "owner",
      operator: QueryOperatorValue.Empty,
    },
    {
      fieldId: "owner",
      operator: QueryOperatorValue.NotEmpty,
    },
  ];

  const query = {
    $and: [
      {
        $or: [
          {
            "owner.name": {
              $like: "%TEST%",
            },
          },
        ],
      },
      {
        $or: [
          {
            "owner.name": {
              $nlike: "%TEST%",
            },
          },
        ],
      },
      {
        $or: [
          {
            "owner.name": {
              $eq: "TEST",
            },
          },
        ],
      },
      {
        $or: [
          {
            "owner.name": {
              $ne: "TEST",
            },
          },
        ],
      },
      {
        $or: [
          {
            owner: {
              $exists: false,
            },
          },
        ],
      },
      {
        $or: [
          {
            owner: {
              $exists: true,
            },
          },
        ],
      },
    ],
  };

  it("should convert conditions to query correctly", () => {
    const result = convertConditionsToQuery(objectData.__fieldList, conditions);
    expect(result).toEqual(query);
    expect(convertConditionsToQuery([])).toEqual({});
  });

  it("should convert query to advanced query correctly", () => {
    expect(convertQueryToAdvancedQuery({})).toEqual([]);
    expect(
      convertQueryToAdvancedQuery({
        $and: [
          {
            $or: [
              {
                hostname: {
                  $like: "%TEST%",
                },
              },
            ],
          },
        ],
      })
    ).toEqual([
      {
        hostname: {
          $like: "%TEST%",
        },
      },
    ]);
    expect(
      convertQueryToAdvancedQuery({
        $and: [
          { $or: [{ _agentStatus: { $eq: "正常" } }] },
          { _agentHeartBeat: { $gte: 0, $lte: 10 } },
        ],
      })
    ).toEqual([
      {
        _agentStatus: { $eq: "正常" },
      },
      {
        _agentHeartBeat: { $gte: 0, $lte: 10 },
      },
    ]);
  });
});
