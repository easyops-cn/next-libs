import { GeneralIcon } from "@next-libs/basic-components";
import { Dropdown, Menu } from "antd";
import classnames from "classnames";
import React, { useState } from "react";
import style from "./AddStepButton.module.css";

export type ButtonProps = {
  name: string;
  key: string;
  disabled?: boolean;
};

interface AddStepButtonProps {
  addButtonProps: ButtonProps;
  subButtons?: ButtonProps[];
  onAddStepButtonClick?(data: { key: string; hasSubButtons: boolean }): void;
  onSubButtonClick?(data: { key: [string, string] }): void;
}

export function AddStepButton(props: AddStepButtonProps): React.ReactElement {
  const { addButtonProps, subButtons, onAddStepButtonClick, onSubButtonClick } =
    props;
  const hasSubButtons = !!subButtons;
  const [visible, setVisible] = useState(false);

  const handleAddStepButtonClick = () => {
    if (addButtonProps.disabled) return;
    onAddStepButtonClick?.({ key: addButtonProps.key, hasSubButtons });
  };

  const handleSubButtonClick = (data: any) => {
    onSubButtonClick?.({ key: [addButtonProps.key, data.key] });
    setVisible(false);
  };

  const menu = (
    <Menu>
      {subButtons?.map((v) => (
        <Menu.Item
          key={v.key}
          disabled={v.disabled}
          onClick={(e) => handleSubButtonClick(v)}
        >
          {v.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  const addStepBtn = (
    <div
      className={classnames(style.addStepBtn, {
        [style.addStepBtnActive]: visible,
        [style.addStepBtnDisabled]: addButtonProps.disabled,
      })}
      onClick={handleAddStepButtonClick}
    >
      <div />
      <GeneralIcon
        icon={{
          lib: "antd",
          icon: "plus",
          theme: "outlined",
        }}
      />
      <div />
      <span className={style.addStepBtnName}>{addButtonProps.name}</span>
      <GeneralIcon
        style={{
          transition: "all 0.3s",
          transform: `rotate(${visible ? 1 : 180}deg)`,
          visibility: hasSubButtons ? "visible" : "hidden",
        }}
        icon={{
          lib: "antd",
          icon: "up",
          theme: "outlined",
        }}
      />
      <div />
    </div>
  );

  return hasSubButtons ? (
    <Dropdown
      visible={visible}
      onVisibleChange={(visible) =>
        setVisible(addButtonProps.disabled ? false : visible)
      }
      overlay={menu}
      trigger={["click"]}
    >
      {addStepBtn}
    </Dropdown>
  ) : (
    addStepBtn
  );
}
