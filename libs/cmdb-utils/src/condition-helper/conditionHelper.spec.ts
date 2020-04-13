import { isConditionSatisfied } from "./conditionHelper";

import { LogicalOperator, ConditionOperator } from "./constants";

describe("conditionHelp", () => {
  it("check condition satisfied with single value correctly", () => {
    expect(isConditionSatisfied(1, 1)).toEqual(true);
    expect(isConditionSatisfied(1, 2)).toEqual(false);

    expect(
      isConditionSatisfied(1, {
        [LogicalOperator.and]: [
          1,
          {
            $ne: 2
          }
        ]
      })
    ).toEqual(true);
    expect(
      isConditionSatisfied(1, {
        [LogicalOperator.and]: [
          1,
          {
            $eq: 2
          }
        ]
      })
    ).toEqual(false);

    expect(
      isConditionSatisfied(1, {
        [LogicalOperator.or]: [1]
      })
    ).toEqual(true);
    expect(
      isConditionSatisfied(1, {
        [LogicalOperator.or]: [
          2,
          {
            $eq: 1
          }
        ]
      })
    ).toEqual(true);

    expect(
      isConditionSatisfied(1, {
        [ConditionOperator.eq]: 1
      })
    ).toEqual(true);
    expect(
      isConditionSatisfied(1, {
        [ConditionOperator.eq]: 2
      })
    ).toEqual(false);

    expect(
      isConditionSatisfied(1, {
        fake: 1
      })
    ).toEqual(false);
  });

  it("check condition satisfied with multi value correctly", () => {
    const data = {
      a: 1,
      b: 2
    };

    expect(isConditionSatisfied(data, 1)).toEqual(false);

    expect(
      isConditionSatisfied(data, {
        [LogicalOperator.and]: [
          {
            a: 1
          },
          {
            b: {
              [ConditionOperator.gte]: 2
            }
          }
        ]
      })
    ).toEqual(true);
    expect(
      isConditionSatisfied(data, {
        [LogicalOperator.and]: [
          {
            a: 1
          },
          {
            b: {
              [ConditionOperator.gt]: 2
            }
          }
        ]
      })
    ).toEqual(false);

    expect(
      isConditionSatisfied(data, {
        [LogicalOperator.or]: [
          {
            a: 2
          },
          {
            b: {
              [ConditionOperator.lte]: 2
            }
          }
        ]
      })
    ).toEqual(true);
    expect(
      isConditionSatisfied(data, {
        [LogicalOperator.or]: [
          {
            a: 2
          },
          {
            b: {
              [ConditionOperator.lt]: 2
            }
          }
        ]
      })
    ).toEqual(false);

    expect(
      isConditionSatisfied(data, {
        [LogicalOperator.or]: [
          {
            a: 2
          },
          {
            b: {
              [ConditionOperator.lte]: 2
            }
          }
        ]
      })
    ).toEqual(true);
    expect(
      isConditionSatisfied(data, {
        [LogicalOperator.or]: [
          {
            a: 2
          },
          {
            b: {
              [ConditionOperator.lt]: 2
            }
          }
        ]
      })
    ).toEqual(false);
  });
});
