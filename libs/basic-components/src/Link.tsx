// Ref https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/Link.js
import React from "react";
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
export class Link extends React.Component<LinkProps> {
  handleClick(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    history: PluginHistory
  ): void {
    if (this.props.onClick) this.props.onClick(event);
    if (this.props.href) return;

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      (!this.props.target || this.props.target === "_self") && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();

      if (!this.props.to) return;

      const method = this.props.replace ? history.replace : history.push;

      method(this.props.to as any);
    }
  }

  render(): React.ReactNode {
    const { innerRef, replace, to, ...rest } = this.props; // eslint-disable-line no-unused-vars
    const history = getHistory();

    let href;
    if (this.props.href) {
      href = this.props.href;
    } else {
      const location =
        typeof to === "string"
          ? createLocation(to, null, null, history.location)
          : to;
      href = location ? history.createHref(location) : "";
    }

    return (
      <a
        {...rest}
        onClick={event => this.handleClick(event, history)}
        href={href}
        ref={innerRef}
      />
    );
  }
}
