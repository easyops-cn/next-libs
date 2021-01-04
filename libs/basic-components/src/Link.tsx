// Ref https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/Link.js
import React, { useMemo } from "react";
import { createLocation, LocationDescriptor } from "history";
import { getHistory } from "@easyops/brick-kit";
import { PluginHistory, PluginHistoryState } from "@easyops/brick-types";

function isModifiedEvent(
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
): boolean {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export interface LinkProps {
  to?: LocationDescriptor<PluginHistoryState>;
  href?: string;
  innerRef?: string;
  replace?: boolean;
  target?: string;
  onClick?: LinkClickFn;
  [other: string]: any;
}

type LinkClickFn = (
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
) => void;

/**
 * The public API for rendering a history-aware <a>.
 */
export function Link(props: LinkProps): React.ReactElement {
  const { innerRef, replace, to, ...rest } = props; // eslint-disable-line no-unused-vars
  const history = getHistory();
  const href = useMemo(() => {
    if (props.href) {
      return props.href;
    } else {
      const location =
        typeof to === "string"
          ? createLocation(to, null, null, history.location)
          : to;
      return location ? history.createHref(location) : "";
    }
  }, [props.href, to, history]);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    history: PluginHistory
  ): void => {
    if (props.onClick) props.onClick(event);
    if (props.href) return;

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      (!props.target || props.target === "_self") && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();

      if (!to) return;

      const method = replace ? history.replace : history.push;

      method(to);
    }
  };

  return (
    <a
      {...rest}
      onClick={(event) => handleClick(event, history)}
      href={href}
      ref={innerRef}
    />
  );
}
