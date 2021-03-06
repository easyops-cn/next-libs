import React, { forwardRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NS_LIBS_FORM, K } from "../../i18n/constants";
import { FormItemWrapperProps } from "../../FormItemWrapper";
import { MenuIcon } from "@next-core/brick-types";
import { Modal, Input, Button, Divider, Radio } from "antd";
import { RadioChangeEvent } from "antd/lib/radio/interface";
import { GeneralIcon, getColor, COLORS_MAP } from "@next-libs/basic-components";
import style from "./IconSelect.module.css";
import classNames from "classnames";
import { getIconList, IconType } from "@next-libs/basic-components";
import { pickBy } from "lodash";

export interface IconSelectProps extends FormItemWrapperProps {
  visible?: boolean;
  placeholder?: string;
  value?: MenuIcon;
  disabled?: boolean;
  openModal?: () => void;
  onChange?: (value: MenuIcon) => void;
  handleCancel?: () => void;
  bg?: boolean;
  setColor?: boolean;
}

export function LegacyIconSelectItem(
  props: IconSelectProps,
  ref: React.Ref<any>
): React.ReactElement {
  const { t } = useTranslation(NS_LIBS_FORM);
  const [iconList, setIconList] = useState<{ list: any[]; total: number }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("fa");
  const [value, setValue] = useState<any>(props.value);
  const [color, setColor] = useState(props.value?.color);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const handleCancel = () => {
    props.handleCancel && props.handleCancel();
    setValue(props.value);
  };

  const handleOk = () => {
    props.onChange?.(value);
  };

  useEffect(() => {
    setIconList(
      getIconList({
        type: category as IconType,
        page: 1,
        pageSize: 240,
        q: searchQuery,
      })
    );
  }, [category, searchQuery]);

  const handleIconSelect = (icon: MenuIcon) => {
    setValue({ ...icon, ...(props.setColor ? { color } : {}) });
  };

  const generateIcons = () => {
    let showIcons = null;
    if (iconList?.list?.length) {
      showIcons = iconList.list.map((item) => {
        return (
          <div
            key={JSON.stringify(item.icon)}
            className={style.iconContainer}
            onClick={() => {
              handleIconSelect(item.icon);
            }}
          >
            <div
              style={{ overflow: "hidden" }}
              className={style.iconInnerContainer}
            >
              <GeneralIcon icon={item.icon} />
              <div className={style.iconName} title={item.icon.icon}>
                {item.icon.icon}
              </div>
            </div>
          </div>
        );
      });
    }
    return showIcons;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e: RadioChangeEvent): void => {
    setCategory(e.target.value);
  };

  const handleColorSelect = (item: string): void => {
    const resultColor = props.bg ? item : getColor(item).color;
    setColor(resultColor);
    setValue({
      ...value,
      ...(props.setColor ? { color: resultColor } : {}),
    });
  };

  const handleEmptyColor = (): void => {
    setColor(null);
    let resultValue = value;
    if (value?.color) {
      resultValue = pickBy(resultValue, (v, k) => k !== "color") as MenuIcon;
    }
    setValue(resultValue);
  };

  const clearValue = (): void => {
    setColor(null);
    setValue(null);
  };

  const generateColorModel = () => {
    return Object.keys(COLORS_MAP).map((item) => {
      return (
        <div
          className={style.colorBox}
          style={{
            backgroundColor: getColor(item).color,
          }}
          key={item}
          onClick={() => handleColorSelect(item)}
        ></div>
      );
    });
  };

  return (
    <div>
      <Modal
        title={t(K.SELECT_ICON)}
        visible={props.visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width="778px"
      >
        <div className={style.previewContainer}>
          <div className={style.showArea}>
            <GeneralIcon
              icon={value}
              bg={props.bg}
              size={70}
              showEmptyIcon={true}
            />
            {value && (
              <div className={style.deleteWrapper} onClick={clearValue}>
                <Button shape="circle" className={style.deleteIcon}>
                  <GeneralIcon
                    icon={{
                      lib: "easyops",
                      category: "default",
                      icon: "delete",
                      color: "var(--theme-red-color)",
                    }}
                  />
                </Button>
              </div>
            )}
          </div>
          <span className={style.iconName}>{value?.icon ?? value?.type}</span>
        </div>
        <div className={style.selectIconContainer}>
          {props.setColor && (
            <>
              <span className={style.title}>{t(K.SET_COLOR)}：</span>
              <div className={style.selectColorArea}>
                {generateColorModel()}
                <div
                  className={classNames(style.colorBox, style.emptyColor)}
                  onClick={handleEmptyColor}
                >
                  <Divider className={style.emptyLine} />
                </div>
              </div>
            </>
          )}
          <span className={style.title}>{t(K.ICON)}：</span>
          <div className={style.selectIconArea}>
            <Input.Search
              value={searchQuery}
              className={style.iconSearch}
              placeholder={t(K.BACKGROUND_SEARCH)}
              onChange={handleChange}
            />
            <Radio.Group
              onChange={handleCategoryChange}
              value={category}
              defaultValue="fa"
              style={{ marginLeft: "30px" }}
            >
              <Radio value="fa">font awesome</Radio>
              <Radio value="antd">ant design</Radio>
              <Radio value="easyops">easyops</Radio>
            </Radio.Group>
            <div className={style.iconArea}>{generateIcons()}</div>
          </div>
        </div>
      </Modal>
      <span
        onClick={props.openModal}
        ref={ref}
        className={classNames(style.previewAvatar, {
          [style.selectedAvatar]: !props.disabled,
        })}
      >
        {!props.bg && !props.value && (
          <GeneralIcon icon={null} bg={true} size={24} />
        )}
        <GeneralIcon
          icon={props.value}
          bg={props.bg}
          size={54}
          showEmptyIcon={true}
        />
      </span>
    </div>
  );
}

export const IconSelectItem = forwardRef(LegacyIconSelectItem);
