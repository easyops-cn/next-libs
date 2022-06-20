// Ref https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/Link.js
import React, { useMemo } from "react";
import { createLocation, LocationDescriptor } from "history";
import { getHistory } from "@next-core/brick-kit";
import { PluginHistory, PluginHistoryState } from "@next-core/brick-types";

function isModifiedEvent(
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
): boolean {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: LocationDescriptor<PluginHistoryState>;
  innerRef?: string;
  noEmptyHref?: boolean;
  replace?: boolean;
  disabled?: boolean;
}

/**
 * The public API for rendering a history-aware <a>.
 */
export function Link(props: LinkProps): React.ReactElement {
  const { innerRef, replace, to, noEmptyHref, disabled, style, ...rest } =
    props;
  const history = getHistory();
  const computedHref = useMemo(() => {
    if (disabled) {
      return;
    } else if (props.href) {
      return props.href;
    } else {
      const location =
        typeof to === "string"
          ? createLocation(to, null, null, history.location)
          : to;
      return location ? history.createHref(location) : "";
    }
  }, [disabled, props.href, to, history]);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    history: PluginHistory
  ): void => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    props.onClick?.(event);
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

  rest.href = computedHref || !noEmptyHref ? computedHref : undefined;

  return (
    <a
      {...rest}
      style={{
        ...(disabled
          ? { cursor: "not-allowed", color: "var(--text-color-disabled)" }
          : null),
        ...style,
      }}
      onClick={(event) => handleClick(event, history)}
      ref={innerRef}
    />
  );
}
