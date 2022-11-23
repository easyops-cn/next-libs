import React, { useMemo } from "react";
import {
  Mentions as AMentions,
  MentionProps as AMentionProps,
  Avatar,
} from "antd";
import { useMention } from "@next-libs/hooks";
import { UserInfo } from "@next-core/brick-types";

export interface MentionsProps extends Partial<AMentionProps> {
  onSearch?: (text: string, prefix: string) => void;
  debounceTime?: number;
  showkey?: Array<keyof UserInfo>;
}

export function Mentions({
  onSearch,
  debounceTime = 300,
  ...restProps
}: MentionsProps): React.ReactElement {
  const showkey: Array<keyof UserInfo> = useMemo(
    () => (restProps.showkey?.length ? restProps.showkey : ["name"]),
    [restProps.showkey]
  );

  const { users, loading, updateUserName } = useMention("", {
    debounceTime,
  });

  const handleMentionsSearch = (text: string, prefix: string) => {
    updateUserName(text);
    onSearch?.(text, prefix);
  };

  return (
    <AMentions
      onSearch={handleMentionsSearch}
      loading={loading}
      {...restProps}
      data-testid={"mentions"}
    >
      {Array.isArray(users) &&
        users.map((item) => (
          <AMentions.Option
            value={showkey
              .map((k) => item[k])
              .filter((v) => !!v)
              .join("/")}
            key={item.name}
            data-testid="mentions-option"
          >
            <Avatar
              src={item.user_icon}
              size={24}
              style={{
                backgroundColor: item?.user_icon
                  ? undefined
                  : "rgb(0, 113, 235)",
                marginRight: "10px",
              }}
            >
              {!item.user_icon && item.name?.slice(0, 2)}
            </Avatar>
            {showkey
              .map((k) => item[k])
              .filter((v) => !!v)
              .join("/")}
          </AMentions.Option>
        ))}
    </AMentions>
  );
}
