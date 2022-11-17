// Ref https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/Link.js
import React, { useEffect, useMemo, useState, useRef } from "react";
import { createLocation } from "history";
import { getHistory } from "@next-core/brick-kit";
import { PluginHistory } from "@next-core/brick-types";
import {
  ExtendedLocationDescriptorObject,
  getExtendedLocationDescriptor,
} from "./getExtendedLocationDescriptor";

function isModifiedEvent(event: MouseEvent): boolean {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export type ExtendedLocationDescriptor =
  | string
  | ExtendedLocationDescriptorObject;
export type { ExtendedLocationDescriptorObject };

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "onClick"> {
  to?: ExtendedLocationDescriptor;
  innerRef?: string;
  noEmptyHref?: boolean;
  replace?: boolean;
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
}

/**
 * The public API for rendering a history-aware <a>.
 */
export function Link(props: LinkProps): React.ReactElement {
  const {
    innerRef,
    replace,
    to,
    noEmptyHref,
    disabled,
    style,
    onClick,
    ...rest
  } = props;
  const history = getHistory();

  const [currentLocation, setCurrentLocation] = useState(history.location);
  const linkRef = useRef<HTMLAnchorElement>();
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

  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
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
    linkRef.current?.addEventListener("click", handleClick);
    return () => {
      linkRef.current?.removeEventListener("click", handleClick);
    };
  }, [props.href, onClick, disabled, to, replace, history, currentLocation]);

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
      ref={linkRef}
    />
  );
}
