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
} from "antd";
import { EmptyProps } from "antd/lib/empty";
import { useCurrentTheme } from "@next-core/brick-kit";
import { MenuIcon } from "@next-core/brick-types";
import { GeneralIcon } from "@next-libs/basic-components";
import update from "immutability-helper";
import { isNil, pick, upperFirst, isEmpty } from "lodash";
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
} from "./processor";
import { OTHER_FORM_ITEM_FIELD, supportMenuType } from "./constant";
import { matchNoramlMenuValue } from "./processor";
import {
  PropertyType,
  BrickProperties,
  visualFormUtils,
  ItemModeType,
  UnionPropertyType,
  Required,
} from "../interfaces";

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

    let value = selected.value;
    if (nextMode === ItemModeType.Normal) {
      if (supportMenuType.includes(selected.type as string)) {
        value = matchNoramlMenuValue(value);
      }
    } else if (isNil(selected.value)) {
      value = "";
    } else {
      value = yamlStringify(selected.value);
    }
    form.setFieldsValue({
      [name]: value,
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
        mode={item?.editor?.model || "brick_next_yaml"}
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
        <Input />
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
      >
        <Switch defaultChecked={props.brickProperties[item.name]} />
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
        <InputNumber />
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
        <Select mode="tags" />
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
      labelAlign="right"
      labelCol={{
        style: {
          minWidth: "120px",
        },
      }}
      size="small"
      form={form}
      onValuesChange={props.onValuesChange}
      initialValues={calculateValue(
        propertyTypeList,
        brickProperties,
        typeList
      )}
    >
      {!hiddenPropsCategory ? (
        <Collapse
          ghost
          defaultActiveKey={gorupList.map((_, index) => String(index))}
          className={styles.panelContainer}
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
