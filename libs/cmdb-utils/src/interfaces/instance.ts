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

export interface TransHierRelationType {
  relation_id: string;
  relation_name: string;
  protected?: boolean;
  memo?: string;
  query: {
    fields_relation_filter?: Record<string, any>;
    query_path: string;
    reverse_query_path: string;
    relation_object: string;
  };
  query_path: string;
  relation_object: string;
  reverse_query_path: string;
  tags?: string[];
  groups?: string[];
  is_inherit: boolean;
  type?: "transHierRelation";
  display_keys?: string[];
  is_parent_object: boolean;
  object_id: string;
}
