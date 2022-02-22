import { Button, Modal } from "antd";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import { DisplaySettings, DisplaySettingsProps } from "./DisplaySettings";

export interface DisplaySettingsModalData {
  fields: string[];
  isReset?: boolean;
}

export interface DisplaySettingsModalProps extends DisplaySettingsProps {
  visible?: boolean;
  defaultFields?: string[];
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
    currentFields,
    defaultFields,
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

  return (
    <Modal
      title={t(K.DISPLAY_SETTINGS)}
      visible={visible}
      footer={
        <div style={{ display: "flex" }}>
          <div>
            <Button
              type="default"
              onClick={handleReset}
              data-testid="reset-button"
            >
              {t(K.RESTORE_DEFAULT)}
            </Button>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Button
              type="default"
              onClick={onCancel}
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
      onCancel={onCancel}
      destroyOnClose={true}
      width={780}
      centered={true}
    >
      <DisplaySettings
        objectId={objectId}
        modelData={modelData}
        currentFields={nextFields}
        extraDisabledFields={extraDisabledFields}
        onChange={(fields) => setNextFields(fields)}
      />
    </Modal>
  );
}
