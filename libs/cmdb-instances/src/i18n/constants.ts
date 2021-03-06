export const NS_LIBS_CMDB_INSTANCES = "libs-cmdb-instances";

export enum K {
  VALIDATE_MESSAGE_REQUIRED = "VALIDATE_MESSAGE_REQUIRED",
  DYNAMIC_FILTER = "DYNAMIC_FILTER",
  TIP = "TIP",
  DELETE = "DELETE",
  INVALID_OR_FORBIDDEN_IPS = "INVALID_OR_FORBIDDEN_IPS",
  INVALID = "INVALID",
  SELECT_FROM_CMDB = "SELECT_FROM_CMDB"
}

export type Locale = { [key in K]: string };
