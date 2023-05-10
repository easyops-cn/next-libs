import React, { useEffect, useMemo, useState } from "react";
import { UserInfo } from "@next-core/brick-types";
import {
  UserAdminApi_searchAllUsersInfo,
  type UserAdminApi_SearchAllUsersInfoResponseBody,
} from "@next-sdk/user-service-sdk";
import { debounce } from "lodash";
import { InstanceApi_postSearchV3 } from "@next-sdk/cmdb-sdk";
const getUserInfoByName = (name: string) =>
  InstanceApi_postSearchV3("USER", {
    query: {
      state: "valid",
      $or: [
        {
          name: {
            $like: `%${name}%`,
          },
        },
      ],
    },
    fields: [
      "name",
      "nickname",
      "user_email",
      "user_tel",
      "user_icon",
      "user_memo",
    ],
    page: 1,
    page_size: 5,
  }).then(
    ({ list }: UserAdminApi_SearchAllUsersInfoResponseBody) =>
      list as UserInfo[]
  );

type UseMentionConfig = {
  debounceTime?: number;
};

type UseMentionReturnType = {
  loading: boolean;
  users: UserInfo[];
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
 *   const {users,loading,updateUserName} = useMention("fakeUserName", config)
 *   return <>
 *     {users}
 *   </>
 * }
 */
export default function useMention(
  name?: string,
  config: UseMentionConfig = {}
): UseMentionReturnType {
  const { debounceTime = 300 } = config;
  const [query, setQuery] = useState({ name });
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    setLoading(true);
    getUserInfoByName(query.name)
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
  }, [query]);

  const handleMentionSearch = useMemo(
    () =>
      debounce((text: string) => {
        text !== query.name && setQuery({ name: text });
      }, debounceTime),
    [debounceTime, query]
  );

  return {
    users,
    loading,
    updateUserName: handleMentionSearch,
  };
}
