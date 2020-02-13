/* eslint-disable react-hooks/exhaustive-deps */

import React, { forwardRef, useState, useEffect } from "react";
import { Input, Button, Modal } from "antd";
import { groupBy } from "lodash";

import { InstanceListModal } from "../instance-list-modal/InstanceListModal";
import { CmdbModels, InstanceApi } from "@sdk/cmdb-sdk";

import { useTranslation } from "react-i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";

import style from "./cmdb-instances-input-form.module.css";

export interface CmdbInstancesInputFormItemProps {
  objectMap?: { [objectId: string]: Partial<CmdbModels.ModelCmdbObject> };
  objectId?: string;
  fieldId?: string;
  singleSelect?: boolean;
  inputDisabled?: boolean;
  checkDisabled?: boolean;
  checkAgentStatus?: boolean;
  checkPermission?: boolean;
  value?: string[];
  children?: React.ReactNode;
  onChange?: (value: string[]) => void;
}

export const LegacyCmdbInstancesInputFormItem = (
  props: CmdbInstancesInputFormItemProps,
  ref: React.Ref<HTMLDivElement>
): React.ReactElement => {
  const { t } = useTranslation(NS_LIBS_CMDB_INSTANCES);

  const modelData = props.objectMap[props.objectId];
  const seperator = " ";

  const [visible, setVisible] = useState(false);
  const [selectedInstances, setSelectedInstances] = useState({
    valid: [],
    invalid: []
  });
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const computeInputValue = async (instanceIds: string[]): Promise<void> => {
      const selectedInstances = (
        await InstanceApi.postSearch(props.objectId, {
          page: 1,
          page_size: instanceIds.length,
          query: {
            instanceId: {
              $in: instanceIds
            }
          },
          fields: {
            instanceId: true,
            [props.fieldId]: true
          }
        })
      ).list;

      setInputValue(
        selectedInstances
          .map(instanceData => instanceData[props.fieldId])
          .join(seperator)
      );
    };

    if (props.value) {
      computeInputValue(props.value);
    }
  }, [props.value]);

  const checkSelectedInstances = async (
    selectedInstances: any[]
  ): Promise<void> => {
    if (selectedInstances) {
      const instances = (
        await InstanceApi.postSearch(props.objectId, {
          query: {
            instanceId: {
              $in: selectedInstances.map(instance => instance.instanceId)
            },
            ...(props.objectId === "HOST" && props.checkAgentStatus
              ? { _agentStatus: "正常" }
              : {})
          },
          ...(props.objectId === "HOST" && props.checkPermission
            ? { permission: ["operate"] }
            : {}),
          fields: {
            instanceId: true,
            [props.fieldId]: true
          }
        })
      ).list;
      const instanceIds = instances.map(instance => instance.instanceId);

      const selectedInstancesMap = groupBy(
        selectedInstances,
        selectedInstance => instanceIds.includes(selectedInstance.instanceId)
      );

      setSelectedInstances({
        valid: selectedInstancesMap.true || [],
        invalid: (selectedInstancesMap.false || []).map(
          invalidSelectedInstance => invalidSelectedInstance[props.fieldId]
        )
      });
      if (props.onChange) {
        props.onChange(
          selectedInstancesMap.true
            ? selectedInstancesMap.true.map(instance => instance.instanceId)
            : []
        );
      }
    }
  };

  const checkInputValue = async (inputValue: string): Promise<void> => {
    const fieldValues =
      props.fieldId === "ip"
        ? inputValue.match(
            /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b(?:\[[^[\],;\s]*\])?/g
          )
        : inputValue.split(seperator);

    if (fieldValues) {
      const instances = (
        await InstanceApi.postSearch(props.objectId, {
          query: {
            [props.fieldId]: {
              $in: fieldValues
            },
            ...(props.objectId === "HOST" && props.checkAgentStatus
              ? { _agentStatus: "正常" }
              : {})
          },
          ...(props.objectId === "HOST" && props.checkPermission
            ? { permission: ["operate"] }
            : {}),
          fields: {
            instanceId: true,
            [props.fieldId]: true
          }
        })
      ).list;

      const validSelectedInstances = instances.filter(instance =>
        fieldValues.includes(instance[props.fieldId])
      );

      const validFieldValues = validSelectedInstances.map(
        instance => instance[props.fieldId]
      );
      const invalidFieldValues = fieldValues.filter(
        fieldValue => !validFieldValues.includes(fieldValue)
      );

      setSelectedInstances({
        valid: validSelectedInstances || [],
        invalid: invalidFieldValues || []
      });

      if (props.onChange) {
        props.onChange(
          validSelectedInstances.map(instance => instance.instanceId)
        );
      }
    }
  };

  const openSelectInstancesModal = (): void => {
    setVisible(true);
  };

  const closeSelectInstancesModal = (): void => {
    setVisible(false);
  };

  const handleInstancesSelected = async (
    selectedInstances: any[]
  ): Promise<void> => {
    closeSelectInstancesModal();

    if (
      !selectedInstances.every(
        selectedInstance => props.fieldId in selectedInstance
      )
    ) {
      selectedInstances = (
        await InstanceApi.postSearch(props.objectId, {
          page: 1,
          page_size: selectedInstances.length,
          query: {
            instanceId: {
              $in: selectedInstances.map(
                selectedInstance => selectedInstance.instanceId
              )
            }
          },
          fields: {
            instanceId: true,
            [props.fieldId]: true
          }
        })
      ).list;
    }

    setInputValue(
      selectedInstances.map(instance => instance[props.fieldId]).join(seperator)
    );

    if (selectedInstances) {
      if (!props.checkDisabled) {
        await checkSelectedInstances(selectedInstances);
      } else if (props.onChange) {
        props.onChange(selectedInstances.map(instance => instance.instanceId));
      }
    }
  };

  const handleInputChanged = (event: { target: { value: string } }): void => {
    setInputValue(event.target.value);
  };

  const handleInputBlur = async (event: {
    target: { value: string };
  }): Promise<void> => {
    const inputValue = event.target.value;
    if (inputValue) {
      if (!props.checkDisabled) {
        await checkInputValue(inputValue);
      } else {
        const fieldValues =
          props.fieldId === "ip"
            ? inputValue.match(
                /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b(?:\[[^[\],;\s]*\])?/g
              )
            : inputValue.split(seperator);

        const instances = (
          await InstanceApi.postSearch(props.objectId, {
            query: {
              [props.fieldId]: {
                $in: fieldValues
              }
            },
            fields: {
              instanceId: true,
              [props.fieldId]: true
            }
          })
        ).list;

        setSelectedInstances({
          valid: instances || [],
          invalid: []
        });

        if (props.onChange) {
          props.onChange(instances.map(instance => instance.instanceId));
        }
      }
    }
  };

  const closeInvalidFieldValuesModal = (): void => {
    setSelectedInstances({
      valid: selectedInstances.valid,
      invalid: []
    });
    setInputValue(
      selectedInstances.valid
        .map(instance => instance[props.fieldId])
        .join(seperator)
    );
    if (props.onChange) {
      props.onChange(
        selectedInstances.valid.map(instance => instance.instanceId)
      );
    }
  };

  return (
    <div ref={ref}>
      <Modal
        title={t(K.TIP)}
        visible={selectedInstances.invalid.length !== 0}
        closable={false}
        maskClosable={false}
        footer={[
          <Button
            type="primary"
            key="delete"
            onClick={closeInvalidFieldValuesModal}
          >
            {t(K.DELETE)}
          </Button>
        ]}
        onCancel={closeInvalidFieldValuesModal}
      >
        {t(K.INVALID_OR_FORBIDDEN_IPS)}
        {selectedInstances.invalid.join(", ")}
      </Modal>
      <InstanceListModal
        objectMap={props.objectMap}
        objectId={props.objectId}
        visible={visible}
        title={`${t(K.SELECT_FROM_CMDB)}${modelData.name}`}
        query={{}}
        onSelected={handleInstancesSelected}
        singleSelect={props.singleSelect}
        onCancel={closeSelectInstancesModal}
      />
      <div className={style.cmdbInstancesInputFormWrapper}>
        <Input
          data-testid="field-value-input"
          className={style.fieldInput}
          onChange={handleInputChanged}
          value={inputValue}
          onBlur={handleInputBlur}
          disabled={props.inputDisabled}
        />
        <Button
          className={style.modalButton}
          onClick={openSelectInstancesModal}
        >
          {t(K.SELECT_FROM_CMDB)}
        </Button>
      </div>
    </div>
  );
};

export const CmdbInstancesInputFormItem = forwardRef<HTMLDivElement>(
  LegacyCmdbInstancesInputFormItem
);
