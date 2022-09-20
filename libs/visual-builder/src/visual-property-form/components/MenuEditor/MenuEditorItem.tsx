import React, { useState, useEffect } from "react";
import { Form, Select, Tooltip } from "antd";
import { GeneralIcon } from "@next-libs/basic-components";
import { InstanceApi_getDetail } from "@next-sdk/cmdb-sdk";

interface MenuEditorItemProps {
  name?: string;
  label?: string | React.ReactElement;
  value?: string;
  required?: boolean;
  projectId?: string;
  menuSettingClick?: () => void;
}

export function MenuEditorItem(props: MenuEditorItemProps): React.ReactElement {
  const [options, setOptions] = useState([]);

  const getMenu = async () => {
    const result = await InstanceApi_getDetail(
      "PROJECT_MICRO_APP",
      props.projectId,
      {
        fields: "menus.menuId",
      }
    );

    const options = result.menus.map((item: Record<string, any>) => ({
      value: item.menuId,
      label: item.menuId,
    }));
    setOptions(options);
  };

  const handleMenuSettingClick = () => {
    props.menuSettingClick();
  };

  useEffect(() => {
    if (props.projectId) {
      getMenu();
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Form.Item
        key={props.name}
        name={props.name}
        label={props.label}
        rules={[{ required: props.required, message: `请输入${props.name}` }]}
      >
        <Select
          style={{
            width: "300px",
          }}
          options={options}
          showSearch
          allowClear
          placeholder="Select a menu id"
          filterOption={(input, option) =>
            (option.label as string)
              .toLocaleLowerCase()
              .indexOf(input.toLocaleLowerCase()) >= 0 ||
            (option.value as string)
              .toLocaleLowerCase()
              .indexOf(input.toLocaleLowerCase()) >= 0
          }
        />
      </Form.Item>
      <div
        style={{
          fontSize: "18px",
          marginTop: "10px",
          marginLeft: "10px",
          cursor: "pointer",
          display: "inline-block",
        }}
      >
        <Tooltip title="配置菜单数据">
          {" "}
          <GeneralIcon
            icon={{
              category: "app",
              color: "blue",
              icon: "launchpad-setting",
              lib: "easyops",
            }}
            onClick={handleMenuSettingClick}
          />
        </Tooltip>
      </div>
    </div>
  );
}
