export enum ComparisonOperators {
  Equal = "$eq",
  NotEqual = "$ne",
  Like = "$like",
  NotLike = "$nlike",
  GreaterThan = "$gt",
  GreaterThanOrEqual = "$gte",
  LessThan = "$lt",
  LessThanOrEqual = "$lte",
  In = "$in",
  NotIn = "$nin",
}

export enum ElementOperators {
  Exists = "$exists",
}

export enum LogicalOperators {
  And = "$and",
  Or = "$or",
}

export type QueryOperatorExpressions = Partial<
  Record<ComparisonOperators | ElementOperators, any>
>;

export interface Query {
  [fieldOrLogical: string]: QueryOperatorExpressions | Query[];
}
