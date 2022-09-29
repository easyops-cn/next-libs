import React, { useEffect, useImperativeHandle, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Tooltip,
  Collapse,
  Empty,
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
  }));

  useEffect(() => {
    const newTypeList = mergeProperties(propertyTypeList, brickProperties);
    setTypeList(newTypeList);

    const newValue = calculateValue(
      propertyTypeList,
      brickProperties,
      newTypeList
    );
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
        <Radio.Group>
          <Radio value={true}>true</Radio>
          <Radio value={false}>false</Radio>
        </Radio.Group>
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

  const getFormItem = (item: PropertyType): React.ReactElement => {
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

  return isEmpty(typeList) ? (
    <Empty
      className={styles.empty}
      description={emptyConfig?.description}
      image={theme === "dark-v2" ? <DarkEmpty /> : Empty.PRESENTED_IMAGE_SIMPLE}
      imageStyle={emptyConfig?.imageStyle}
    />
  ) : (
    <Form
      name="propertyForm"
      layout="vertical"
      form={form}
      onValuesChange={props.onValuesChange}
      initialValues={calculateValue(
        propertyTypeList,
        brickProperties,
        typeList
      )}
    >
      {!hiddenPropsCategory ? (
        <Collapse ghost defaultActiveKey="0" className={styles.panelContainer}>
          {groupByType(typeList)?.map(([category, list], index) => {
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
