import React, { useCallback, useEffect, useMemo, useRef } from "react";
import classNames from "classnames";
import { Tooltip } from "antd";
import {
  BrickAsComponent,
  looseCheckIfByTransform,
} from "@next-core/brick-kit";
import { GeneralIcon } from "@next-libs/basic-components";
import { WorkbenchTreeAction, ActionClickDetail } from "../interfaces";

import styles from "./WorkbenchMiniActionBar.module.css";

export interface WorkbenchSubActionBarProps {
  data?: unknown;
  className?: string;
  gap?: number;
  isFirst?: boolean;
  isLast?: boolean;
  actions?: WorkbenchTreeAction[];
  actionsHidden?: boolean;
  useNativeEvent?: boolean;
  onActionClick?(detail: ActionClickDetail): void;
}

export function WorkbenchMiniActionBar({
  data,
  className,
  gap,
  isFirst,
  isLast,
  actions,
  actionsHidden,
  useNativeEvent,
  onActionClick,
}: WorkbenchSubActionBarProps): React.ReactElement {
  const enabledActions = useMemo(
    () => actions?.filter((item) => looseCheckIfByTransform(item, data)),
    [actions, data]
  );

  if (actionsHidden || !enabledActions?.length) {
    return null;
  }

  return (
    <div className={classNames(styles.actionsBar, className)} style={{ gap }}>
      {enabledActions.map((item) => (
        <WorkbenchSubAction
          key={item.action}
          action={item}
          data={data}
          isFirst={isFirst}
          isLast={isLast}
          useNativeEvent={useNativeEvent}
          onActionClick={onActionClick}
        />
      ))}
    </div>
  );
}

interface WorkbenchSubActionProps {
  action: WorkbenchTreeAction;
  data?: unknown;
  isFirst?: boolean;
  isLast?: boolean;
  useNativeEvent?: boolean;
  onActionClick?(detail: ActionClickDetail): void;
}

function WorkbenchSubAction({
  action,
  data,
  isFirst,
  isLast,
  useNativeEvent,
  onActionClick,
}: WorkbenchSubActionProps): React.ReactElement {
  const disabled =
    (isFirst && action.action === "move-up") ||
    (isLast && action.action === "move-down");
  const linkRef = useRef<HTMLAnchorElement>();

  const handleActionClick = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      disabled ||
        onActionClick?.({
          action: action.action,
          data: data,
          clientX: event.clientX,
          clientY: event.clientY,
        });
    },
    [action.action, data, disabled, onActionClick]
  );

  useEffect(() => {
    const link = linkRef.current;
    if (!link || !useNativeEvent) {
      return;
    }
    link.addEventListener("click", handleActionClick);
    return () => {
      link.removeEventListener("click", handleActionClick);
    };
  }, [handleActionClick, useNativeEvent]);

  const preventMouseEvent = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <a
      className={classNames(styles.action, { [styles.disabled]: disabled })}
      title={action.title}
      role="button"
      ref={linkRef}
      onClick={handleActionClick}
      onContextMenu={preventMouseEvent}
      onMouseDown={preventMouseEvent}
    >
      <Tooltip title={action.tooltip}>
        {action.iconUseBrick?.useBrick ? (
          <BrickAsComponent
            useBrick={action.iconUseBrick.useBrick}
            data={data}
          />
        ) : (
          <GeneralIcon icon={action.icon} />
        )}
      </Tooltip>
    </a>
  );
}
