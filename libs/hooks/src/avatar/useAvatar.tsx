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
  stringR: string;
};

const generateObjectArray = () => {
  return Array.from({ length: 10 }, (_, index) => ({
    id: index,
    value: `Object ${index}`,
  }));
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

  const stringR = `Build completed in 337.535s
Getting package size
Cleaning up

Warning: The  command is deprecated and will be disabled soon. Please upgrade to using Environment Files. For more information see: https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands/
Warning: The  command is deprecated and will be disabled soon. Please upgrade to using Environment Files. For more information see: https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands/
Comment on PR
  Getting list of comments
  Posting new comment
  Error: Validation Failed: {"resource":"IssueComment","code":"unprocessable","field":"data","message":"Body is too long (maximum is 65536 characters)"}
  Warning: HttpError: Validation Failed: {"resource":"IssueComment","code":"unprocessable","field":"data","message":"Body is too long (maximum is 65536 characters)"}
      at /home/runner/work/_actions/privatenumber/pkg-size-action/v1/dist/index.js:2990:27
      at processTicksAndRejections (node:internal/process/task_queues:96:5)
      at async to (/home/runner/work/_actions/privatenumber/pkg-size-action/v1/dist/index.js:4591:9)
      at async /home/runner/work/_actions/privatenumber/pkg-size-action/v1/dist/index.js:7912:9`;
  return {
    Avatar,
    user,
    loading,
    updateConfig,
    stringR,
  };
}
