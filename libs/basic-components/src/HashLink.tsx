import React from "react";
import { getHistory } from "@easyops/brick-kit";

export interface HashLinkProps {
  to: string;
  innerRef?: string;
  onClick?: LinkClickFn;
  [other: string]: any;
}

type LinkClickFn = (
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
) => void;

export class HashLink extends React.Component<HashLinkProps> {
  handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void {
    if (this.props.onClick) this.props.onClick(event);
    // Let the browser auto scroll the anchor into view.
  }

  render(): React.ReactNode {
    const { innerRef, to, ...rest } = this.props; // eslint-disable-line no-unused-vars
    const history = getHistory();
    const href = `${history.createHref({
      ...history.location,
      hash: undefined
    })}${to}`;

    return (
      <a
        {...rest}
        onClick={event => this.handleClick(event)}
        href={href}
        ref={innerRef}
      />
    );
  }
}
