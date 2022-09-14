import React, { useEffect, useMemo, useState } from "react";
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
  const { debounceTime = 300 } = config || {};
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
      debounce(async (text: string) => {
        setQ(text);
      }, debounceTime),
    [debounceTime]
  );

  return {
    users,
    loading,
    updateUserName: handleMentionSearch,
  };
}
