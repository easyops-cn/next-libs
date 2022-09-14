import { Mentions, MentionProps as AMentionProps, Avatar } from "antd";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { UserInfo } from "@next-core/brick-types";
import {
  UserAdminApi_searchAllUsersInfo,
  type UserAdminApi_SearchAllUsersInfoResponseBody,
} from "@next-sdk/user-service-sdk";
import { debounce } from "lodash";

const getUserInfoByName = (name: string) =>
  UserAdminApi_searchAllUsersInfo({
    query: {
      state: "valid",
      $or: [
        {
          name: {
            $like: `%${name}%`,
          },
        },
        {
          instanceId: {
            $like: `%${name}%`,
          },
        },
      ],
    },
    fields: {
      name: true,
      nickname: true,
      user_email: true,
      user_tel: true,
      user_icon: true,
      user_memo: true,
    },
  }).then(
    ({ list }: UserAdminApi_SearchAllUsersInfoResponseBody) =>
      list as UserInfo[]
  );

interface LegacyMentionProps extends AMentionProps {
  users: UserInfo[];
  loading: boolean;
  onSearch?: (text: string, prefix: string) => void;
}

const LegacyMention: React.FC<LegacyMentionProps> = ({
  users,
  loading,
  onSearch,
  ...restProps
}) => {
  return (
    <Mentions onSearch={onSearch} loading={loading} {...restProps}>
      {Array.isArray(users) &&
        users.map((item) => (
          <Mentions.Option value={item.name} key={item.name}>
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
            {item.name}
          </Mentions.Option>
        ))}
    </Mentions>
  );
};

type UseMentionConfig = AMentionProps & {
  debounceTime?: number;
};

type UseMentionReturnType = {
  loading: boolean;
  users: UserInfo[];
  Mention: ReactElement<AMentionProps, typeof Mentions>;
  updateConfig: (config: UseMentionConfig) => void;
  updateUserName: (name: string) => void;
};

/**
 *
 * @param name
 * @param config
 * @return UseMentionReturnType
 * @example
 *
 * function Todo () {
 *   const {Mention,users,loading,updateConfig,updateUserOrInstanceId} = useMention("fakeUserName", config)
 *   return <>
 *     {Mention}
 *   </>
 * }
 */
export default function useMention(
  name?: string,
  config: UseMentionConfig = {}
): UseMentionReturnType {
  const { debounceTime = 300 } = config || {};
  const [conf, setConf] = useState(config);
  const [q, setQ] = useState(name);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      users?.length && setUsers([]);
      return;
    }
    let isSubscribed = true;
    setLoading(true);
    getUserInfoByName(q)
      .then(
        (users) => {
          if (isSubscribed) {
            setUsers([...users]);
          }
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.error("Load user info failed:", err);
        }
      )
      .finally(() => setLoading(false));
    return () => {
      isSubscribed = false;
    };
  }, [q]);

  const handleMentionSearch = useMemo(
    () =>
      debounce(async (text: string, prefix: string) => {
        setQ(text);
        config?.onSearch?.(text, prefix);
      }, debounceTime),
    [config?.onSearch, debounceTime]
  );

  const updateConfig = (config: UseMentionConfig) => {
    setConf((prev) => ({ ...prev, ...config }));
  };

  const Mention = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onSearch, debounceTime, ...restConfig } = conf;
    return (
      <LegacyMention
        users={users}
        loading={loading}
        onSearch={handleMentionSearch}
        {...restConfig}
      />
    );
  }, [users, config, handleMentionSearch]);

  return {
    Mention,
    users,
    loading,
    updateConfig,
    updateUserName: setQ,
  };
}
