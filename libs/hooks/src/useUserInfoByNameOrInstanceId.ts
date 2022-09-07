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

export function useUserInfoByNameOrInstanceId(
  nameOrInstanceId: string
): UserInfo {
  const [userInfo, setUserInfo] = useState<UserInfo>(null);

  useEffect(() => {
    setUserInfo(null);
    if (!nameOrInstanceId) {
      return;
    }
    let isSubscribed = true;
    getUserInfoByNameOrInstanceId(nameOrInstanceId).then(
      (userInfo) => {
        if (isSubscribed) {
          setUserInfo(userInfo);
        }
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error("Load user info failed:", err);
      }
    );
    return () => {
      isSubscribed = false;
    };
  }, [nameOrInstanceId]);

  return userInfo;
}
