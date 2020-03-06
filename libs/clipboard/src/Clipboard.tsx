import React, { PropsWithChildren, ReactElement } from "react";
import { Icon } from "antd";
import { IconProps } from "antd/lib/icon";

export interface ClipboardProps {
  text: string;
  onCopy: (text: string, result: boolean) => void;
  icon?: IconProps;
}

export const copyToClipboard = (text: string): boolean => {
  let success = false;
  try {
    const listener = (e: ClipboardEvent) => {
      e.stopPropagation();
      const clipboard = e.clipboardData;
      clipboard.clearData();
      clipboard.setData("text", text);
      e.preventDefault();
    };

    document.addEventListener("copy", listener);
    success = document.execCommand("copy");

    if (!success) {
      throw new Error("copy command was unsuccessful!");
    }
    document.removeEventListener("copy", listener);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log("unable copy to using execCommand", err);

    try {
      //  for IE supported only
      (window as any).clipboardData.setData("text", text);
      success = true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("unable to copy using clipboardData: ", e);
    }
  }

  return success;
};

export function Clipboard(
  props: PropsWithChildren<ClipboardProps>
): React.ReactElement {
  const { onCopy, icon, children, ...restProps } = props;
  const defaultIconProps = {
    theme: "filled",
    type: "copy"
  };

  const onCopyButtonClick = () => {
    const success = copyToClipboard(props.text);
    onCopy && onCopy(props.text, success);
  };

  return (
    <>
      {!props.children ? (
        <Icon
          {...Object.assign({}, defaultIconProps, icon)}
          onClick={onCopyButtonClick}
        />
      ) : (
        React.cloneElement(
          React.Children.only(props.children) as ReactElement,
          {
            ...restProps,
            onClick: onCopyButtonClick
          }
        )
      )}
    </>
  );
}
