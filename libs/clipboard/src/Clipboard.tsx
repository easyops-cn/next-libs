import React, {PropsWithChildren, ReactElement} from "react";
import {Icon} from "antd";
import {IconProps} from "antd/lib/icon";

export interface ClipboardProps {
  text: string;
  onCopy: (text: string, result: boolean) => void;
  icon?: IconProps;
}

export function Clipboard(
  props: PropsWithChildren<ClipboardProps>
): React.ReactElement {
  const { onCopy, icon, ...restProps } = props;
  const defaultIconProps = {
    theme: "filled",
    type: "copy"
  };

  const listener = (e: ClipboardEvent) => {
    e.stopPropagation();
    const clipboard = e.clipboardData;
    clipboard.clearData();
    clipboard.setData("text", props.text);
    e.preventDefault();
  };

  const copyToClipboard = () => {
    let success = false;
    try {
      document.addEventListener("copy", listener);
      const successful = document.execCommand("copy");

      if (!successful) {
        throw new Error("copy command was unsuccessful!");
      }
      success = true;
      document.removeEventListener("copy", listener);
      onCopy && onCopy(props.text, successful);
      return;
    } catch (err) {
      console.log("unable copy to using execCommand", err);

      try {
        //  for IE supported only
        (window as any).clipboardData.setData("text", props.text);
        success = true;
        onCopy && onCopy(props.text, true);
        return;
      } catch (e) {
        console.error("unable to copy using clipboardData: ", e);
      }
    }

    onCopy && onCopy(props.text, success);
  };

  return (
    <>
      {!props.children ? (
        <Icon
          {...Object.assign({}, defaultIconProps, icon)}
          onClick={copyToClipboard}
        />
      ) : (
        React.cloneElement(
          React.Children.only(props.children) as ReactElement,
          {
            ...restProps,
            onClick: copyToClipboard
          }
        )
      )}
    </>
  );
}
