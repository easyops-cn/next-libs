// Ref https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/Link.js
import React, { useEffect, useMemo, useState } from "react";
import { createLocation } from "history";
import { getHistory } from "@next-core/brick-kit";
import { PluginHistory } from "@next-core/brick-types";
import {
  ExtendedLocationDescriptorObject,
  getExtendedLocationDescriptor,
} from "./getExtendedLocationDescriptor";

function isModifiedEvent(
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
): boolean {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export type ExtendedLocationDescriptor =
  | string
  | ExtendedLocationDescriptorObject;
export type { ExtendedLocationDescriptorObject };

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: ExtendedLocationDescriptor;
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

  const [currentLocation, setCurrentLocation] = useState(history.location);
  useEffect(() => {
    // Listen history change only when necessary.
    if (typeof to !== "string" && to?.keepCurrentSearch) {
      return history.listen((loc) => {
        setCurrentLocation(loc);
      });
    }
  }, [history, to]);

  const computedHref = useMemo(() => {
    if (disabled) return;

    if (props.href) {
      return props.href;
    }

    if (!to) return;

    const loc =
      typeof to === "string"
        ? createLocation(to, null, null, currentLocation)
        : getExtendedLocationDescriptor(to, currentLocation);
    return loc ? history.createHref(loc) : "";
  }, [disabled, props.href, to, currentLocation, history]);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
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

      method(
        typeof to === "string"
          ? to
          : getExtendedLocationDescriptor(to, currentLocation)
      );
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
      onClick={(event) => handleClick(event)}
      ref={innerRef}
    />
  );
}
