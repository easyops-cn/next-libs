import { transformConditionsToAq } from "./transformConditionsToAq";
import { Query } from "@next-libs/cmdb-instances";
import { Condition, ConditionOperators } from "./share";
import { HOST } from "../fixtures";
jest.mock("@next-libs/cmdb-instances", () => ({
  LogicalOperators: {
    And: "$and",
    Or: "$or",
  },
  Query: {},
}));
describe("transformConditionsToAq", () => {
  it.each<[string, Condition[], Query[]]>([
    [
      "equal operator",
      [
        {
          field: "ip",
          operator: ConditionOperators.OPERATOR_EQUAL,
          value: "192.168.100.162",
        },
      ],
      [
        {
          $or: [
            {
              ip: {
                $eq: "192.168.100.162",
              },
            },
          ],
        },
      ],
    ],
    [
      "notEqual operator",
      [
        {
          field: "ip",
          operator: ConditionOperators.OPERATOR_NOT_EQUAL,
          value: "192.168.100.162",
        },
      ],
      [
        {
          $and: [
            {
              ip: {
                $ne: "192.168.100.162",
              },
            },
          ],
        },
      ],
    ],
    [
      "contain operator",
      [
        {
          field: "name",
          operator: ConditionOperators.OPERATOR_CONTAIN,
          value: "ly",
        },
      ],
      [
        {
          $or: [
            {
              name: {
                $like: "%ly%",
              },
            },
          ],
        },
      ],
    ],
    [
      "notContain operator",
      [
        {
          field: "name",
          operator: ConditionOperators.OPERATOR_NOT_CONTAIN,
          value: "ly",
        },
      ],
      [
        {
          $and: [
            {
              name: {
                $nlike: "%ly%",
              },
            },
          ],
        },
      ],
    ],
    [
      "isEmpty operator",
      [
        {
          field: "owner",
          operator: ConditionOperators.OPERATOR_IS_EMPTY,
          value: false,
        },
      ],
      [
        {
          owner: {
            $exists: false,
          },
        },
      ],
    ],
    [
      "isNotEmpty operator",
      [
        {
          field: "owner",
          operator: ConditionOperators.OPERATOR_IS_EMPTY,
          value: true,
        },
      ],
      [
        {
          owner: {
            $exists: true,
          },
        },
      ],
    ],
    // 这两个待定
    [
      "in operator",
      [
        {
          field: "owners",
          operator: ConditionOperators.OPERATOR_IN,
          value: "ly",
        },
      ],
      [
        {
          owners: {
            $in: ["ly"],
          },
        },
      ],
    ],
    [
      "notIn operator",
      [
        {
          field: "owners",
          operator: ConditionOperators.OPERATOR_NOT_IN,
          value: "ly",
        },
      ],
      [
        {
          owners: {
            $nin: ["ly"],
          },
        },
      ],
    ],
    [
      "between operator",
      [
        {
          field: "age",
          operator: ConditionOperators.OPERATOR_BETWEEN,
          value: {
            min: 1,
            max: 20,
          },
        },
      ],
      [
        {
          age: {
            $gte: 1,
            $lte: 20,
          },
        },
      ],
    ],
    [
      "mixed",
      [
        {
          field: "ip",
          operator: ConditionOperators.OPERATOR_CONTAIN,
          value: "192",
        },
        {
          field: "memSize",
          operator: ConditionOperators.OPERATOR_IS_NOT_EMPTY,
          value: true,
        },
      ],
      [
        {
          $or: [
            {
              ip: {
                $like: "%192%",
              },
            },
          ],
        },
        {
          memSize: {
            $exists: true,
          },
        },
      ],
    ],
    [
      "arr contain operator",
      [
        {
          field: "tag",
          operator: ConditionOperators.OPERATOR_CONTAIN,
          value: "192",
        },
      ],
      [
        {
          $or: [
            {
              tag: {
                $like: "%192%",
              },
            },
          ],
        },
      ],
    ],
    [
      "arr notContain operator",
      [
        {
          field: "tag",
          operator: ConditionOperators.OPERATOR_NOT_CONTAIN,
          value: "192",
        },
      ],
      [
        {
          $and: [
            {
              tag: {
                $nlike: "%192%",
              },
            },
          ],
        },
      ],
    ],
    [
      "arr equal operator",
      [
        {
          field: "tag",
          operator: ConditionOperators.OPERATOR_EQUAL,
          value: "192",
        },
      ],
      [
        {
          tag: {
            $in: ["192"],
          },
        },
      ],
    ],
    [
      "arr not equal operator",
      [
        {
          field: "tag",
          operator: ConditionOperators.OPERATOR_NOT_EQUAL,
          value: "192",
        },
      ],
      [
        {
          tag: {
            $nin: ["192"],
          },
        },
      ],
    ],
    [
      "struct contain operator",
      [
        {
          field: "cpu",
          operator: ConditionOperators.OPERATOR_CONTAIN,
          value: "162",
        },
      ],
      [
        {
          $or: [
            {
              "cpu.brand": {
                $like: "%162%",
              },
            },
            {
              "cpu.architecture": {
                $like: "%162%",
              },
            },
            {
              "cpu.hz": {
                $like: "%162%",
              },
            },
            {
              "cpu.logical_cores": {
                $like: "%162%",
              },
            },
            {
              "cpu.physical_cores": {
                $like: "%162%",
              },
            },
          ],
        },
      ],
    ],
    [
      "equal operator int",
      [
        {
          field: "cpuHz",
          operator: ConditionOperators.OPERATOR_EQUAL,
          value: "10",
        },
      ],
      [
        {
          $or: [
            {
              cpuHz: {
                $eq: 10,
              },
            },
          ],
        },
      ],
    ],
    [
      "not equal operator int",
      [
        {
          field: "cpuHz",
          operator: ConditionOperators.OPERATOR_NOT_EQUAL,
          value: "10",
        },
      ],
      [
        {
          $and: [
            {
              cpuHz: {
                $ne: 10,
              },
            },
          ],
        },
      ],
    ],
  ])(
    `transformConditionsToAq should work %s`,
    (annotation, conditions, queries) => {
      expect(transformConditionsToAq(conditions, HOST)).toEqual(queries);
    }
  );
});
