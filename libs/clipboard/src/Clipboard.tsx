import React, { PropsWithChildren, ReactElement } from "react";
import { Icon as LegacyIcon } from "@ant-design/compatible";
import { IconProps } from "@ant-design/compatible/lib/icon";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { NS_CLIPBOARD, K } from "./i18n/constants";

export interface ClipboardProps {
  text: string;
  onCopy?: (text: string, result: boolean) => void;
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

    // document.execCommand("copy") only triggers if there is a selection
    // Refs https://bugs.webkit.org/show_bug.cgi?id=156529
    // Ref https://stackoverflow.com/questions/40147676/javascript-copy-to-clipboard-on-safari
    if (!success) {
      const textArea = document.createElement("textArea") as HTMLInputElement;
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      success = document.execCommand("copy");
      document.body.removeChild(textArea);
    }

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
  const { t } = useTranslation(NS_CLIPBOARD);
  const { onCopy, icon, children, ...restProps } = props;
  const defaultIconProps = {
    theme: "filled",
    type: "copy",
  };

  const onCopyButtonClick = () => {
    const success = copyToClipboard(props.text);
    onCopy
      ? onCopy(props.text, success)
      : success
      ? message.success(t(K.COPY_SUCCESS))
      : message.error(t(K.COPY_FAILED));
  };

  return (
    <>
      {!props.children ? (
        <LegacyIcon
          {...Object.assign({}, defaultIconProps, icon)}
          onClick={onCopyButtonClick}
        />
      ) : (
        React.cloneElement(
          React.Children.only(props.children) as ReactElement,
          {
            ...restProps,
            onClick: onCopyButtonClick,
          }
        )
      )}
    </>
  );
}
