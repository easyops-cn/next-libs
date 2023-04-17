import { Avatar as AAvatar, AvatarProps } from "antd";
import React, { ReactElement, useMemo, useRef, useState } from "react";
import { UserInfo } from "@next-core/brick-types";
import { useUserInfoByNameOrInstanceId } from "../useUserInfoByNameOrInstanceId/useUserInfoByNameOrInstanceId";

type UseAvatarConfig = AvatarProps;
type useAvatarReturnType = {
  user: UserInfo;
  loading: boolean;
  Avatar: ReactElement<AvatarProps, typeof AAvatar>;
  updateConfig: (config: UseAvatarConfig) => void;
};

/**
 *
 * @param nameOrInstanceId
 * @param config
 * @return useAvatarReturnType
 * @example
 * function Todo () {
 *   const {Avatar, loading, user, updateConfig} = useAvatar("fakeName")
 *
 *   return (
 *     <div>
 *       {Avatar}
 *     </div>
 *   )
 * }
 */
export const getAvatar = (user: UserInfo, conf: UseAvatarConfig = {}) => (
  <AAvatar
    src={user?.user_icon}
    style={{
      backgroundColor: user?.user_icon ? undefined : "rgb(0, 113, 235)",
    }}
    {...conf}
  >
    {(user?.name || "")?.slice(0, 2)}
  </AAvatar>
);

export default function useAvatar(
  nameOrInstanceId: string,
  config: UseAvatarConfig = {}
): useAvatarReturnType {
  const [conf, setConf] = useState(config);
  const { user, loading } = useUserInfoByNameOrInstanceId(nameOrInstanceId);
  const updateConfig = (config: UseAvatarConfig) => {
    setConf({ ...conf, ...config });
  };
  const Avatar = useMemo(() => {
    return getAvatar(user, conf);
  }, [user, conf]);

  return {
    Avatar,
    user,
    loading,
    updateConfig,
  };
}
