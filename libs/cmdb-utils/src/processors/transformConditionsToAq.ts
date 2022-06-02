import { CmdbModels } from "@next-sdk/cmdb-sdk";
import { ModelObjectAttr } from "@next-sdk/cmdb-sdk/dist/types/model/cmdb";
import {
  ComparisonOperators,
  ElementOperators,
  LogicalOperators,
  Query,
} from "../interfaces";
import { AqOperators, Condition, ConditionOperators } from "./share";

const multiValueSearchOperatorsMap: Partial<
  Record<AqOperators, LogicalOperators>
> = {
  [ComparisonOperators.Like]: LogicalOperators.Or,
  [ComparisonOperators.NotLike]: LogicalOperators.And,
  [ComparisonOperators.Equal]: LogicalOperators.Or,
  [ComparisonOperators.NotEqual]: LogicalOperators.And,
};

const conditionToAqQueryStrategy: Record<
  ConditionOperators,
  {
    operator?: AqOperators;
    strategy: (condition: Condition) => Query;
  }
> = {
  [ConditionOperators.OPERATOR_CONTAIN]: {
    operator: ComparisonOperators.Like,
    strategy: aqItemOfSearchOperators,
  },
  [ConditionOperators.OPERATOR_NOT_CONTAIN]: {
    operator: ComparisonOperators.NotLike,
    strategy: aqItemOfSearchOperators,
  },
  [ConditionOperators.OPERATOR_EQUAL]: {
    operator: ComparisonOperators.Equal,
    strategy: aqItemOfSearchOperators,
  },
  [ConditionOperators.OPERATOR_NOT_EQUAL]: {
    operator: ComparisonOperators.NotEqual,
    strategy: aqItemOfSearchOperators,
  },
  [ConditionOperators.OPERATOR_IS_EMPTY]: {
    operator: ElementOperators.Exists,
    strategy: aqItemOfExists,
  },
  [ConditionOperators.OPERATOR_IS_NOT_EMPTY]: {
    operator: ElementOperators.Exists,
    strategy: aqItemOfExists,
  },
  [ConditionOperators.OPERATOR_IN]: {
    operator: ComparisonOperators.In,
    strategy: aqItemOfNormal,
  },
  [ConditionOperators.OPERATOR_NOT_IN]: {
    operator: ComparisonOperators.NotIn,
    strategy: aqItemOfNormal,
  },
  [ConditionOperators.OPERATOR_BETWEEN]: {
    strategy: aqItemOfBetween,
  },
};

const conditionToAqOperatorAndValue = (
  condition: Condition,
  modelDetail: Partial<CmdbModels.ModelCmdbObject>
) => {
  const attribute = modelDetail?.attrList?.find(
    (attr: Partial<ModelObjectAttr>) => attr.id === condition.field
  );
  const attrType = attribute ? attribute.value.type : "str";
  let operator = condition.operator;
  if (attrType === "enums") {
    if (condition.operator === ConditionOperators.OPERATOR_CONTAIN) {
      operator = ConditionOperators.OPERATOR_IN;
    }
    if (condition.operator === ConditionOperators.OPERATOR_NOT_CONTAIN) {
      operator = ConditionOperators.OPERATOR_NOT_IN;
    }
  }
  if (attrType === "arr") {
    if (condition.operator === ConditionOperators.OPERATOR_EQUAL) {
      operator = ConditionOperators.OPERATOR_IN;
    }
    if (condition.operator === ConditionOperators.OPERATOR_NOT_EQUAL) {
      operator = ConditionOperators.OPERATOR_NOT_IN;
    }
  }
  const values = Array.isArray(condition.value)
    ? condition.value.map((item) => (item.value ? item.value : item))
    : typeof condition.value === "string"
    ? condition.value.trim().split(/\s+/)
    : condition.value;
  const isStruct = attrType === "struct" || attrType === "structs";
  return {
    operator,
    value: {
      isStruct,
      struct_define: attribute?.value?.struct_define || [],
      values,
      attrType,
    },
  };
};

function aqItemOfExists(condition: Condition): Query {
  const values = condition.value.values;
  return {
    [condition.field]: {
      [ElementOperators.Exists]: values,
    },
  };
}

function aqItemOfNormal(condition: Condition): Query {
  return {
    [condition.field]: {
      [conditionToAqQueryStrategy[condition.operator].operator]:
        condition.value.values,
    },
  };
}

function aqItemOfBetween(condition: Condition): Query {
  let gte = {},
    lte = {};
  if (condition.value.values?.min !== "") {
    gte = {
      [ComparisonOperators.GreaterThanOrEqual]: condition.value.values?.min,
    };
  }
  if (condition.value.values?.max !== "") {
    lte = {
      [ComparisonOperators.LessThanOrEqual]: condition.value.values?.max,
    };
  }
  return {
    [condition.field]: {
      ...gte,
      ...lte,
    },
  };
}

// 在新的实例列表中，高级搜索的搜索条件
/**
 *  1. ENUMS、ARR 他们的 operator 对应的是 Contain对应的是$in， NotContain对应的是$nin
 *  2. 所有的关系字段都是按照str类型做处理
 *  3. 老的快速查询，enum | enums 返回的数据结构是  {field: "enums" ,operator: "contain",value: [{value: "xxx"}]}
 *
 */
function aqItemOfSearchOperators(condition: Condition): Query {
  const expressions: Query[] = [];
  const { values, isStruct, struct_define, attrType } = condition.value;
  if (
    [
      ConditionOperators.OPERATOR_CONTAIN,
      ConditionOperators.OPERATOR_NOT_CONTAIN,
    ].includes(condition.operator)
  ) {
    if (isStruct && struct_define.length > 0) {
      struct_define.forEach((field: any) => {
        values.forEach((value: any) => {
          expressions.push({
            [`${condition.field}.${field.id}`]: {
              [conditionToAqQueryStrategy[condition.operator]
                .operator]: `%${value}%`,
            },
          });
        });
      });
    } else {
      values.forEach((value: any) => {
        expressions.push({
          [condition.field]: {
            [conditionToAqQueryStrategy[condition.operator]
              .operator]: `%${value}%`,
          },
        });
      });
    }
    return {
      [multiValueSearchOperatorsMap[
        conditionToAqQueryStrategy[condition.operator].operator
      ]]: expressions,
    };
  } else if (
    [
      ConditionOperators.OPERATOR_NOT_EQUAL,
      ConditionOperators.OPERATOR_EQUAL,
    ].includes(condition.operator) &&
    ["int", "float"].includes(attrType)
  ) {
    values.forEach((value: any) => {
      expressions.push({
        [condition.field]: {
          [conditionToAqQueryStrategy[condition.operator].operator]:
            Number(value),
        },
      });
    });
    return {
      [multiValueSearchOperatorsMap[
        conditionToAqQueryStrategy[condition.operator].operator
      ]]: expressions,
    };
  } else {
    values.forEach((value: any) => {
      expressions.push({
        [condition.field]: {
          [conditionToAqQueryStrategy[condition.operator].operator]: value,
        },
      });
    });
    return {
      [multiValueSearchOperatorsMap[
        conditionToAqQueryStrategy[condition.operator].operator
      ]]: expressions,
    };
  }
}

export function transformConditionsToAq(
  conditions: Condition[],
  modelDetail: Partial<CmdbModels.ModelCmdbObject>
): any {
  return conditions?.map((v) => {
    const { operator, value } = conditionToAqOperatorAndValue(v, modelDetail);
    const condition = { ...v, operator, value };
    return conditionToAqQueryStrategy[operator].strategy(condition);
  });
}
