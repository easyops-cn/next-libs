import { UserInfo } from "@next-core/brick-types";
import { makeThrottledAggregation } from "@next-core/brick-utils";
import {
  UserAdminApi_searchAllUsersInfo,
  type UserAdminApi_SearchAllUsersInfoResponseBody,
} from "@next-sdk/user-service-sdk";
import { useEffect, useState } from "react";

const getUserInfoByNameOrInstanceId = makeThrottledAggregation(
  "getUserInfoByNameOrInstanceId",
  (ids: string[]) =>
    UserAdminApi_searchAllUsersInfo({
      query: {
        state: "valid",
        $or: [
          {
            name: {
              $in: ids,
            },
          },
          {
            instanceId: {
              $in: ids,
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
    }),
  ({ list }: UserAdminApi_SearchAllUsersInfoResponseBody, id: string) =>
    list.find((item) => item.instanceId === id || item.name === id) as UserInfo
);
type UseUserInfoByNameOrInstanceIdReturn = {
  user: UserInfo;
  loading: boolean;
};
export function useUserInfoByNameOrInstanceId(
  nameOrInstanceId: string
): UseUserInfoByNameOrInstanceIdReturn {
  const [user, setUser] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setUser(null);
    if (!nameOrInstanceId) {
      return;
    }
    let isSubscribed = true;
    setLoading(true);
    getUserInfoByNameOrInstanceId(nameOrInstanceId)
      .then(
        (userInfo) => {
          if (isSubscribed) {
            setUser(userInfo);
          }
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.error("Load user info failed:", err);
        }
      )
      .finally(() => {
        setLoading(false);
      });
    return () => {
      isSubscribed = false;
    };
  }, [nameOrInstanceId]);

  return {
    user,
    loading,
  };
}
