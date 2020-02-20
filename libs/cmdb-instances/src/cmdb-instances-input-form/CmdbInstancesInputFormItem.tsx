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
  selectFromText?: string;
  objectMap?: { [objectId: string]: Partial<CmdbModels.ModelCmdbObject> };
  objectId?: string;
  fieldId?: string;
  singleSelect?: boolean;
  inputDisabled?: boolean;
  checkDisabled?: boolean;
  checkAgentStatus?: boolean;
  checkPermission?: boolean;
  selectedInstanceIds?: string[];
  value?: string[];
  children?: React.ReactNode;
  query?: any;
  onChange?: (value: string[]) => void;
}

export const LegacyCmdbInstancesInputFormItem = (
  props: CmdbInstancesInputFormItemProps,
  ref: React.Ref<HTMLDivElement>
): React.ReactElement => {
  const { t } = useTranslation(NS_LIBS_CMDB_INSTANCES);

  const seperator = " ";
  const presetQuery = {} as any;
  const permission: string[] = [];
  if (props.objectId === "HOST") {
    if (props.checkAgentStatus) {
      presetQuery._agentStatus = "正常";
    }
    if (props.checkPermission) {
      permission.push("operate");
    }
  }

  const [visible, setVisible] = useState(false);
  const [selectedInstances, setSelectedInstances] = useState({
    valid: [],
    invalid: []
  });
  const [inputValue, setInputValue] = useState("");

  const checkSelectedInstances = async (
    selectedInstances: any[]
  ): Promise<string[]> => {
    if (selectedInstances) {
      const instances = (
        await InstanceApi.postSearch(props.objectId, {
          query: {
            instanceId: {
              $in: selectedInstances.map(instance => instance.instanceId)
            },
            ...presetQuery
          },
          permission,
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

      return selectedInstancesMap.true
        ? selectedInstancesMap.true.map(instance => instance.instanceId)
        : [];
    }
  };

  const updateSelected = async (instanceIds: string[]): Promise<string[]> => {
    let selectedInstances: any[] = [];
    if (instanceIds.length) {
      selectedInstances = (
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
    }

    setInputValue(
      selectedInstances
        .map(instanceData => instanceData[props.fieldId])
        .join(seperator)
    );

    let keys: string[] = [];
    if (selectedInstances.length) {
      if (!props.checkDisabled) {
        keys = await checkSelectedInstances(selectedInstances);
      } else {
        keys = selectedInstances.map(instance => instance.instanceId);
      }
    } else {
      setSelectedInstances({ valid: [], invalid: [] });
    }
    return keys;
  };

  useEffect(() => {
    if (props.value) {
      updateSelected(props.value);
    }
    // todo(ice): how formItem to change its value??????
  }, []);

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
            $and: [
              {
                [props.fieldId]: {
                  $in: fieldValues
                },
                ...presetQuery
              },
              ...(props.query ? [props.query] : [])
            ]
          },
          permission,
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

      props.onChange?.(
        validSelectedInstances.map(instance => instance.instanceId)
      );
    }
  };

  const openSelectInstancesModal = (): void => {
    setVisible(true);
  };

  const closeSelectInstancesModal = (): void => {
    setVisible(false);
  };

  const handleInstancesSelected = async (
    selectedKeys: string[]
  ): Promise<void> => {
    closeSelectInstancesModal();

    const keys = await updateSelected(selectedKeys);

    props.onChange?.(keys);
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
              $and: [
                {
                  [props.fieldId]: {
                    $in: fieldValues
                  }
                },
                ...(props.query ? [props.query] : [])
              ]
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

        props.onChange?.(instances.map(instance => instance.instanceId));
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
    props.onChange?.(
      selectedInstances.valid.map(instance => instance.instanceId)
    );
  };

  const text = props.selectFromText
    ? props.selectFromText
    : t(K.SELECT_FROM_CMDB);

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
        title={text}
        query={props.query}
        presetConfigs={{ query: presetQuery }}
        permission={permission}
        selectedRowKeys={selectedInstances.valid.map(
          instance => instance.instanceId
        )}
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
          {text}
        </Button>
      </div>
    </div>
  );
};

export const CmdbInstancesInputFormItem = forwardRef<HTMLDivElement>(
  LegacyCmdbInstancesInputFormItem
);
