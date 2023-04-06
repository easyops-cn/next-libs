import React, { useEffect, useImperativeHandle, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Tooltip,
  Collapse,
  Empty,
  Switch,
  AutoComplete,
  Radio,
} from "antd";
import { EmptyProps } from "antd/lib/empty";
import { useCurrentTheme } from "@next-core/brick-kit";
import { MenuIcon, SrcIcon } from "@next-core/brick-types";
import { GeneralIcon } from "@next-libs/basic-components";
import update from "immutability-helper";
import _, {
  isNil,
  pick,
  upperFirst,
  isEmpty,
  cloneDeep,
  isString,
  omit,
} from "lodash";
import styles from "./VisualPropertyForm.module.css";
import { FormProps } from "antd/lib/form";
import { CodeEditorFormItem } from "./components/CodeEditor/CodeEditorFormItem";
import { IconSelectFormItem } from "./components/IconSelect/IconSelectFormItem";
import { ColorEditorItem } from "./components/ColorEditor/ColorEditorItem";
import { MenuEditorItem } from "./components/MenuEditor/MenuEditorItem";
import { ListEditor } from "./components/ListEditor/ListEditor";
import { ReactComponent as DarkEmpty } from "./images/empty-dark.svg";
import {
  mergeProperties,
  calculateValue,
  groupByType,
  yamlStringify,
  yaml,
} from "./processor";
import {
  OTHER_FORM_ITEM_FIELD,
  supportBasicType,
  supportMenuType,
} from "./constant";
import { matchNoramlMenuValue } from "./processor";
import {
  PropertyType,
  BrickProperties,
  visualFormUtils,
  ItemModeType,
  UnionPropertyType,
  Required,
} from "../interfaces";
import { MessageEditor } from "./components/MessageEditor/MessageEditor";
import { options } from "marked";
import { GeneralOption } from "@next-libs/forms";

const ButtonTypeEmun = [
  "link",
  "default",
  "primary",
  "ghost",
  "dashed",
  "icon",
  "text",
];

export type CustomColumn = {
  dataIndex: string;
  title: string;
  useChildren?: string;
  [k: string]: any;
};

export type GeneralOptionProps = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type CustomButtonProps = {
  id: string;
  buttonType: string;
  eventName: string;
  text: string;
  tooltip: string;
  icon: MenuIcon;
  hide: boolean;
  disabled: boolean;
  isDivider: boolean;
  isDropdown: boolean;
};
export interface VisualPropertyFormProps {
  projectId?: string;
  propertyTypeList: PropertyType[];
  labelIcon: {
    normal?: MenuIcon;
    advanced?: MenuIcon;
  };
  brickProperties: BrickProperties;
  onValuesChange?: FormProps["onValuesChange"];
  brickInfo?: {
    type: "brick" | "provider" | "template";
  };
  emptyConfig?: EmptyProps;
  menuSettingClick?: () => void;
  hiddenPropsCategory?: boolean;
  childMountPointList?: string[];
}

export function typeMatched(
  actualValue: any,
  selectedValue: UnionPropertyType
): boolean {
  if (typeof actualValue === (selectedValue.type as string)) {
    return true;
  }
  // TODO: 补充更多的类型检查，例如 enum 等
  return false;
}
export function LegacyVisualPropertyForm(
  props: VisualPropertyFormProps,
  ref: React.Ref<visualFormUtils>
): React.ReactElement {
  const theme = useCurrentTheme();
  const {
    projectId,
    labelIcon,
    propertyTypeList,
    brickProperties,
    brickInfo,
    emptyConfig,
    hiddenPropsCategory,
    menuSettingClick,
    childMountPointList,
  } = props;
  const [form] = Form.useForm();
  const [typeList, setTypeList] = useState<UnionPropertyType[]>(
    mergeProperties(propertyTypeList, brickProperties)
  );

  useImperativeHandle(ref, () => ({
    validateFields: form.validateFields,
    resetPropertyFields: (
      typeList: PropertyType[],
      properties: BrickProperties
    ) => {
      const restValue = mergeProperties(typeList, properties);
      setTypeList(restValue);
      form.resetFields();
    },
    getCurTypeList: (): UnionPropertyType[] => {
      return typeList?.map((item) => pick(item, ["name", "type", "mode"]));
    },
    getFieldsValue: form.getFieldsValue,
  }));

  useEffect(() => {
    const newTypeList = mergeProperties(propertyTypeList, brickProperties);
    setTypeList(newTypeList);

    const newValue = calculateValue(
      propertyTypeList,
      brickProperties,
      newTypeList
    );
    form.resetFields();
    form.setFieldsValue(newValue);
  }, [propertyTypeList, brickProperties]);

  const handleLabelClick = (name: string): void => {
    const selected = typeList.find((item) => item.name === name);
    const index = typeList.findIndex((item) => item.name === name);
    const nextMode =
      selected.mode === ItemModeType.Advanced
        ? ItemModeType.Normal
        : ItemModeType.Advanced;
    selected.value = form.getFieldValue(selected.name);
    // 记录切换前的模式下的值
    selected.modeValueMap = {
      ...selected.modeValueMap,
      ...{ [selected.mode]: selected.value },
    };
    // let value = cloneDeep(selected.value);
    if (!isNil(selected.modeValueMap[nextMode])) {
      // 切换后的模式原本有值时，则用原本的值
      selected.value = selected.modeValueMap[nextMode];
    } else if (nextMode === ItemModeType.Normal) {
      // 切换到普通模式没有值时可以根据高级模式来更新值
      if (supportMenuType.includes(selected.type as string)) {
        selected.value = matchNoramlMenuValue(selected.value);
      } else if (supportBasicType.includes(selected.type as string)) {
        // yaml解析后检查下类型，不符合属性类型就不更新了
        const parsedValue = yaml(selected.value);
        if (typeMatched(parsedValue, selected)) {
          selected.value = parsedValue;
        } else {
          selected.value = undefined;
        }
      }
    } else {
      // 切换到高级模式没有值时可以根据普通模式来更新值
      if (isNil(selected.value)) {
        selected.value = "";
      } else if (isString(selected.value)) {
        // do nothing
      } else {
        selected.value = yamlStringify(selected.value);
      }
    }
    selected.modeValueMap[nextMode] = selected.value;
    form.setFieldsValue({
      [name]: selected.value,
    });
    const newTypeList = update(typeList, {
      $splice: [[index, 1, { ...selected, mode: nextMode }]],
    });
    setTypeList(newTypeList);
  };

  const renderLabel = (
    item: UnionPropertyType,
    hideIcon?: boolean
  ): React.ReactElement => {
    return (
      <span>
        <Tooltip title={item.description}>{item.name}</Tooltip>{" "}
        {!hideIcon && labelIcon && (
          <span
            className={styles.iconContainer}
            onClick={() => handleLabelClick(item.name)}
          >
            <GeneralIcon
              icon={
                item.mode === ItemModeType.Advanced
                  ? labelIcon?.advanced
                  : labelIcon.normal
              }
            />
          </span>
        )}
      </span>
    );
  };

  const renderEditorItem = (
    item: UnionPropertyType,
    hideIcon?: boolean
  ): React.ReactElement => {
    return (
      <CodeEditorFormItem
        key={item.name}
        name={item.name}
        label={renderLabel(item, hideIcon) as any}
        required={item.required === Required.True}
        theme={theme === "dark-v2" ? "monokai" : "tomorrow"}
        jsonSchema={item?.jsonSchema}
        schemaRef={item?.schemaRef}
        showLineNumbers={true}
        showGutter={true}
        labelCol={{
          span: 24,
          style: {
            padding: 0,
          },
        }}
        wrapperCol={{
          span: 24,
        }}
        mode={
          (typeof item?.editor !== "string" && item?.editor?.model) ||
          "brick_next_yaml"
        }
      />
    );
  };

  const renderStringItem = (item: UnionPropertyType): React.ReactElement => {
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <Form.Item
        key={item.name}
        label={renderLabel(item)}
        name={item.name}
        rules={[
          {
            required: item.required === Required.True,
            message: `请输入${item.name}`,
          },
        ]}
      >
        <Input {...(item.editorProps ?? {})} />
      </Form.Item>
    );
  };

  const renderNumberItem = (item: UnionPropertyType): React.ReactElement => {
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <Form.Item
        key={item.name}
        label={renderLabel(item)}
        name={item.name}
        rules={[
          {
            required: item.required === Required.True,
            message: `请输入${item.name}`,
          },
        ]}
      >
        <InputNumber {...(item.editorProps ?? {})} />
      </Form.Item>
    );
  };

  const renderTextareaItem = (item: UnionPropertyType): React.ReactElement => {
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <Form.Item
        key={item.name}
        label={renderLabel(item)}
        name={item.name}
        rules={[
          {
            required: item.required === Required.True,
            message: `请输入${item.name}`,
          },
        ]}
      >
        <Input.TextArea {...(item.editorProps ?? {})} />
      </Form.Item>
    );
  };

  const renderSingleRadio = (item: UnionPropertyType) => {
    const { editorProps: prop, name } = item;

    const handleRadioUncheck = (
      e: React.MouseEvent<HTMLElement, MouseEvent>
    ) => {
      const value = e?.target?.value;
      const formValue = form.getFieldsValue();
      const changeValue = {
        [name]: formValue[name] === value ? undefined : value,
      };
      form.setFieldsValue(changeValue);
      props.onValuesChange(changeValue, formValue);
    };

    return prop.options?.map((item: any) => {
      const icon = item.icon;
      let buttonIcon: JSX.Element = null;
      if (icon) {
        if ("imgSrc" in icon) {
          const mergedIcon = {
            imgSrc: icon.imgSrc,
            imgStyle: {
              verticalAlign: "-0.125em",
              ...icon.imgStyle,
            },
          };
          buttonIcon = <GeneralIcon icon={mergedIcon} size={14} />;
        } else {
          buttonIcon = (
            <GeneralIcon
              icon={icon}
              style={{
                fontSize: "14px",
                ...icon.iconStyle,
              }}
            />
          );
        }
      }
      if (prop.optionType === "button") {
        return (
          <Radio.Button
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            style={{ textAlign: "center", flex: "1 1 0", ...item.style }}
            onClick={!prop?.disableUnchek ? handleRadioUncheck : () => null}
          >
            {buttonIcon}
            {item.label && (
              <span style={{ paddingLeft: "5px" }}>{item.label}</span>
            )}
          </Radio.Button>
        );
      } else {
        return (
          <Radio
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            style={item.style}
            onClick={!prop?.disableUnchek ? handleRadioUncheck : () => null}
          >
            {buttonIcon}
            {item.label && (
              <span style={{ paddingLeft: "5px" }}>{item.label}</span>
            )}
          </Radio>
        );
      }
    });
  };

  const renderRadioItem = (item: UnionPropertyType): React.ReactElement => {
    const radioProps = omit(item.editorProps, "options");
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <Form.Item
        key={item.name}
        label={renderLabel(item)}
        name={item.name}
        rules={[
          {
            required: item.required === Required.True,
            message: `请输入${item.name}`,
          },
        ]}
      >
        <Radio.Group
          className={styles.radioGroup}
          style={
            item.editorProps.optionType === "button" ? { display: "flex" } : {}
          }
          {...(radioProps ?? {})}
        >
          {renderSingleRadio(item)}
        </Radio.Group>
      </Form.Item>
    );
  };

  const renderBooleanItem = (item: UnionPropertyType): React.ReactElement => {
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <Form.Item
        key={item.name}
        label={renderLabel(item)}
        name={item.name}
        rules={[
          {
            required: item.required === Required.True,
            message: `请输入${item.name}`,
          },
        ]}
        valuePropName="checked"
      >
        <Switch
          defaultChecked={props.brickProperties[item.name]}
          {...(item.editorProps ?? {})}
        />
      </Form.Item>
    );
  };

  const renderInputNumberItem = (
    item: UnionPropertyType
  ): React.ReactElement => {
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <Form.Item
        key={item.name}
        label={renderLabel(item)}
        name={item.name}
        rules={[
          {
            required: item.required === Required.True,
            message: `请输入${item.name}`,
          },
        ]}
      >
        <InputNumber {...(item.editorProps ?? {})} />
      </Form.Item>
    );
  };

  const renderStringListItem = (
    item: UnionPropertyType
  ): React.ReactElement => {
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <Form.Item
        key={item.name}
        label={renderLabel(item)}
        name={item.name}
        rules={[
          {
            required: item.required === Required.True,
            message: `请输入${item.name}`,
          },
        ]}
      >
        <Select mode="tags" {...(item.editorProps ?? {})} />
      </Form.Item>
    );
  };

  const renderIconItem = (item: UnionPropertyType): React.ReactElement => {
    return (
      <IconSelectFormItem
        key={item.name}
        name={item.name}
        label={renderLabel(item, true) as any}
        required={item.required === Required.True}
      />
    );
  };

  const renderMessageItem = (item: UnionPropertyType): React.ReactElement => {
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <MessageEditor
        key={item.name}
        name={item.name}
        label={renderLabel(item)}
        value={item.value}
        required={item.required === Required.True}
        onChange={(value) => {
          const changeValue = {
            [item.name]: value,
          };
          form.setFieldsValue(changeValue);
          props.onValuesChange(changeValue, form.getFieldsValue());
        }}
      />
    );
  };

  const renderCodeEditorItem = (item: PropertyType): React.ReactElement => {
    return renderEditorItem(item, true);
  };

  const renderColorItem = (item: PropertyType): React.ReactElement => {
    return (
      <ColorEditorItem
        key={item.name}
        name={item.name}
        label={renderLabel(item, true)}
        required={item.required === Required.True}
      />
    );
  };

  const renderMenuItem = (item: UnionPropertyType): React.ReactElement => {
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <MenuEditorItem
        projectId={projectId}
        key={item.name}
        name={item.name}
        label={renderLabel(item)}
        required={item.required === Required.True}
        menuSettingClick={menuSettingClick}
      />
    );
  };

  const renderGeneralOptipns = (
    item: UnionPropertyType
  ): React.ReactElement => {
    const renderFormItem = (item: GeneralOptionProps): React.ReactElement => {
      return (
        <>
          <Form.Item name="label" label="label">
            <Input defaultValue={item.label} />
          </Form.Item>
          <Form.Item name="value" label="value">
            <Input defaultValue={item.value} />
          </Form.Item>
          <Form.Item name="disabled" label="disabled">
            <Switch checked={item.disabled} />
          </Form.Item>
        </>
      );
    };
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <ListEditor
        name={item.name}
        label={renderLabel(item)}
        required={item.required === Required.True}
        value={brickProperties[item.name]}
        listItemKey="label"
        renderFormItem={renderFormItem}
        getDefaultItem={(value: any) => ({
          label: value,
          value: value,
        })}
        onChange={(value) => {
          const changeValue = {
            [item.name]: value,
          };
          form.setFieldsValue(changeValue);
          props.onValuesChange(changeValue, form.getFieldsValue());
        }}
      />
    );
  };

  const renderCustomColumn = (item: UnionPropertyType): React.ReactElement => {
    const renderFormItem = (item: CustomColumn): React.ReactElement => {
      return (
        <>
          <Form.Item name="dataIndex" label="dataIndex">
            <Input defaultValue={item.dataIndex} />
          </Form.Item>
          <Form.Item name="key" label="key">
            <Input defaultValue={item.key} />
          </Form.Item>
          <Form.Item name="title" label="title">
            <Input defaultValue={item.title} />
          </Form.Item>
          <Form.Item
            name="useChildren"
            label="useChildren"
            tooltip="useBrick代替用法,数据来源于子插槽名称,并且插槽名称必须使用'[]'包裹"
          >
            <AutoComplete
              defaultValue={item.useChildren}
              dataSource={(childMountPointList ?? []).filter(
                (item) => item.startsWith("[") && item.endsWith("]")
              )}
              filterOption={(inputValue, option) =>
                option.props.children
                  .toUpperCase()
                  .indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          </Form.Item>
        </>
      );
    };
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <ListEditor
        name={item.name}
        label={renderLabel(item)}
        required={item.required === Required.True}
        value={brickProperties[item.name]}
        listItemKey="title"
        getDefaultItem={(value: any) => ({
          dataIndex: value,
          title: value,
          key: value,
        })}
        renderFormItem={renderFormItem}
        onChange={(value) => {
          const changeValue = {
            [item.name]: value,
          };
          form.setFieldsValue(changeValue);
          props.onValuesChange(changeValue, form.getFieldsValue());
        }}
      />
    );
  };

  const renderCustomButtons = (item: UnionPropertyType): React.ReactElement => {
    const renderFormItem = (item: CustomButtonProps): React.ReactElement => {
      return (
        <>
          <Form.Item name="id" label="id">
            <Input defaultValue={item.id} />
          </Form.Item>
          <Form.Item name="text" label="text">
            <Input defaultValue={item.text} />
          </Form.Item>
          <Form.Item name="tooltip" label="tooltip">
            <Input defaultValue={item.tooltip} />
          </Form.Item>
          <Form.Item name="eventName" label="eventName">
            <Input defaultValue={item.eventName} />
          </Form.Item>
          <IconSelectFormItem name="icon" label="icon" />
          <Form.Item name="buttonType" label="buttonType">
            <Select defaultValue={item.buttonType}>
              {ButtonTypeEmun.map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="hide" label="hide">
            <Switch checked={item.hide} />
          </Form.Item>
          <Form.Item name="disabled" label="disabled">
            <Switch checked={item.disabled} />
          </Form.Item>
          <Form.Item name="isDivider" label="isDivider">
            <Switch checked={item.isDivider} />
          </Form.Item>
          <Form.Item name="isDropdown" label="isDropdown">
            <Switch checked={item.isDropdown} />
          </Form.Item>
        </>
      );
    };
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <ListEditor
        name={item.name}
        label={renderLabel(item)}
        required={item.required === Required.True}
        value={brickProperties[item.name]}
        listItemKey="text"
        renderFormItem={renderFormItem}
        getDefaultItem={(value: any) => ({
          text: value,
        })}
        onChange={(value) => {
          const changeValue = {
            [item.name]: value,
          };
          form.setFieldsValue(changeValue);
          props.onValuesChange(changeValue, form.getFieldsValue());
        }}
      />
    );
  };

  const renderEnumItem = (
    item: UnionPropertyType,
    enumList: string[]
  ): React.ReactElement => {
    return item.mode === ItemModeType.Advanced ? (
      renderEditorItem(item)
    ) : (
      <Form.Item
        key={item.name}
        label={renderLabel(item)}
        name={item.name}
        rules={[
          {
            required: item.required === Required.True,
            message: `请输入${item.name}`,
          },
        ]}
      >
        <Select
          options={enumList.map((item) => ({ label: item, value: item }))}
        />
      </Form.Item>
    );
  };

  const getFormItem = (item: PropertyType): React.ReactElement => {
    // todo(sailor): update unit text
    switch (item.editor) {
      case "input":
        return renderStringItem(item);
      case "radio":
        return renderRadioItem(item);
      case "switch":
        return renderBooleanItem(item);
      case "color":
        return renderColorItem(item);
      case "icon":
        return renderIconItem(item);
      case "message":
        return renderMessageItem(item);
      case "number":
        return renderNumberItem(item);
      case "textarea":
        return renderTextareaItem(item);
    }
    if (/true|false/.test(item.type as string)) {
      return renderBooleanItem(item);
    }
    if (item.enums) {
      const emunList = (item.enums as string).replace(/"|'/g, "").split("|");
      return renderEnumItem(item, emunList);
    }
    switch (item.type) {
      case "string":
        return renderStringItem(item);
      case "string[]":
        return renderStringListItem(item);
      case "number":
        return renderInputNumberItem(item);
      case "boolean":
        return renderBooleanItem(item);
      case "MenuIcon":
        return renderIconItem(item);
      case "Color":
        return renderColorItem(item);
      case "Menu":
      case "SidebarSubMenu":
        return renderMenuItem(item);
      // todo(sailor): update unit text
      case "GeneralOption[]":
        return renderGeneralOptipns(item);
      case "CustomColumn[]":
        return renderCustomColumn(item);
      case "CustomButton[]":
        return renderCustomButtons(item);
      default:
        return renderCodeEditorItem(item);
    }
  };

  const renderOthersItem = (): React.ReactElement => {
    return (
      <CodeEditorFormItem
        name={OTHER_FORM_ITEM_FIELD}
        label={
          brickInfo?.type === "template" ? "other params" : "other properties"
        }
        mode="brick_next_yaml"
        maxLines={Infinity}
      />
    );
  };

  const gorupList = React.useMemo(() => {
    return groupByType(typeList);
  }, [typeList]);

  return isEmpty(typeList) ? (
    <Empty
      className={styles.empty}
      description={emptyConfig?.description}
      image={theme === "dark-v2" ? <DarkEmpty /> : Empty.PRESENTED_IMAGE_SIMPLE}
      imageStyle={emptyConfig?.imageStyle}
    />
  ) : (
    <Form
      className={styles.visualPropertyForm}
      name="propertyForm"
      layout="horizontal"
      labelAlign="left"
      labelCol={{
        span: 8,
        style: {
          minWidth: "120px",
        },
      }}
      wrapperCol={{ span: 16 }}
      size="small"
      form={form}
      onValuesChange={props.onValuesChange}
      initialValues={calculateValue(
        propertyTypeList,
        brickProperties,
        typeList
      )}
      colon={false}
    >
      {!hiddenPropsCategory ? (
        <Collapse
          ghost
          defaultActiveKey={gorupList.map((_, index) => String(index))}
          className={styles.panelContainer}
          expandIconPosition="left"
        >
          {gorupList?.map(([category, list], index) => {
            return (
              <Collapse.Panel
                header={upperFirst(category)}
                key={index}
                forceRender={true}
              >
                {list.map((item) => getFormItem(item))}
              </Collapse.Panel>
            );
          })}

          <Collapse.Panel
            className={styles.otherPanel}
            forceRender={true}
            header={upperFirst(OTHER_FORM_ITEM_FIELD)}
            key={OTHER_FORM_ITEM_FIELD}
          >
            {renderOthersItem()}
          </Collapse.Panel>
        </Collapse>
      ) : (
        <>
          {typeList?.map((item) => {
            return getFormItem(item);
          })}
          <div className={styles.otherPanel}>{renderOthersItem()}</div>
        </>
      )}
    </Form>
  );
}

export const VisualPropertyForm = React.forwardRef(LegacyVisualPropertyForm);
