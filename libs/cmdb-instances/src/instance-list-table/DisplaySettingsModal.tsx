import { Button, Modal, Dropdown, Menu } from "antd";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { DisplaySettings, DisplaySettingsProps } from "./DisplaySettings";
import { getAuth } from "@next-core/brick-kit";
import { EllipsisOutlined } from "@ant-design/icons";

export interface DisplaySettingsModalData {
  fields: string[];
  isReset?: boolean;
  isAdminSetDisplay?: boolean;
}

export interface DisplaySettingsModalProps extends DisplaySettingsProps {
  visible?: boolean;
  defaultFields?: string[];
  saveFieldsBackend?: boolean;
  useExternalCmdbApi?: boolean;
  onOk?(data: DisplaySettingsModalData): void;
  onCancel?(): void;
}

export function DisplaySettingsModal(
  props: DisplaySettingsModalProps
): React.ReactElement {
  const {
    visible,
    objectId,
    modelData,
    saveFieldsBackend,
    useExternalCmdbApi,
    currentFields,
    defaultFields,
    extraDisabledField,
    extraDisabledFields,
    onOk,
    onCancel,
  } = props;
  const { t } = useTranslation(NS_LIBS_CMDB_INSTANCES);
  const [nextFields, setNextFields] = useState<string[]>(currentFields);
  const count = useMemo(
    () => nextFields?.filter((v) => v !== "_object_id").length,
    [nextFields]
  );

  const handleReset = (): void => {
    const fields = defaultFields ? defaultFields.slice() : [];

    setNextFields(fields);
    onOk?.({ fields, isReset: true });
  };

  const handleCancel = (): void => {
    setNextFields(currentFields ? [...currentFields] : []);
    onCancel?.();
  };

  const handleDropdownMenuClick = (e: any): void => {
    // istanbul ignore next
    if (e.key === "restore-default") {
      handleReset();
    } else {
      // istanbul ignore next
      // 管理员将现在选中的字段设置为默认显示, 不会影响到当前列表展示字段，所以需要类似【取消】操作重置字段。
      props?.onOk({
        fields: nextFields,
        isReset: false,
        isAdminSetDisplay: true,
      });
      setNextFields(currentFields ? [...currentFields] : []);
    }
  };

  const showIsAdminSetDefault = getAuth().isAdmin;

  const dropdownMenuItems = (
    <Menu>
      <Menu.Item
        key="set-default-display"
        disabled={count === 0}
        onClick={handleDropdownMenuClick}
      >
        {t(K.DEFAULT_DISPLAY)}
      </Menu.Item>
      <Menu.Item key="restore-default" onClick={handleDropdownMenuClick}>
        {t(K.RESTORE_DEFAULT)}
      </Menu.Item>
    </Menu>
  );
  return (
    <Modal
      title={t(K.DISPLAY_SETTINGS)}
      visible={visible}
      footer={
        <div style={{ display: "flex" }}>
          {showIsAdminSetDefault && saveFieldsBackend && !useExternalCmdbApi ? (
            <Dropdown
              overlay={dropdownMenuItems}
              placement="topLeft"
              trigger={["click"]}
              data-testid="admin-set-display-dropdown"
            >
              <Button type="default" icon={<EllipsisOutlined />}></Button>
            </Dropdown>
          ) : (
            <div>
              <Button
                type="default"
                onClick={handleReset}
                data-testid="reset-button"
              >
                {t(K.RESTORE_DEFAULT)}
              </Button>
            </div>
          )}
          <div style={{ marginLeft: "auto" }}>
            <Button
              type="text"
              onClick={handleCancel}
              style={{ marginRight: 10 }}
              data-testid="cancel-button"
            >
              {t(K.CANCEL)}
            </Button>
            <Button
              type="primary"
              onClick={() => props?.onOk({ fields: nextFields })}
              disabled={count === 0}
              data-testid="ok-button"
            >
              {t(K.CONFIRM)}
            </Button>
          </div>
        </div>
      }
      onCancel={handleCancel}
      destroyOnClose={true}
      width={780}
      centered={true}
    >
      <DisplaySettings
        objectId={objectId}
        modelData={modelData}
        currentFields={nextFields}
        extraDisabledField={extraDisabledField}
        extraDisabledFields={extraDisabledFields}
        onChange={(fields) => setNextFields(fields)}
      />
    </Modal>
  );
}
