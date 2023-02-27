/* eslint-disable react-hooks/exhaustive-deps */

import React, { forwardRef, useState, useEffect, useMemo } from "react";
import { Input, Button, Modal } from "antd";
import { groupBy } from "lodash";

import { InstanceListModal } from "../instance-list-modal/InstanceListModal";
import { modifyModelData, Query } from "@next-libs/cmdb-utils";
import { CmdbModels, InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";

import { useTranslation } from "react-i18next";
import { NS_LIBS_CMDB_INSTANCES, K } from "../i18n/constants";

import style from "./cmdb-instances-input-form.module.css";

const separator = " ";

export interface CmdbInstancesInputFormItemProps {
  selectFromText?: string;
  objectMap?: { [objectId: string]: Partial<CmdbModels.ModelCmdbObject> };
  objectId?: string;
  fieldId?: string;
  fields?: string[];
  singleSelect?: boolean;
  inputDisabled?: boolean;
  checkDisabled?: boolean;
  checkAgentStatus?: boolean;
  checkPermission?: boolean;
  selectedInstanceIds?: string[];
  value?: string[];
  children?: React.ReactNode;
  query?: { [fieldId: string]: any }[];
  onChange?: (value: string[]) => void;
  onChangeV2?: (value: any[]) => void;
  allowClear?: boolean;
  defaultQuery?: { [fieldId: string]: any }[];
  addButtonDisabled?: boolean;
  previewEnabled?: boolean;
  pageSize?: number;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
}

export const LegacyCmdbInstancesInputFormItem = (
  props: CmdbInstancesInputFormItemProps,
  ref: React.Ref<HTMLDivElement>
): React.ReactElement => {
  const { t } = useTranslation(NS_LIBS_CMDB_INSTANCES);

  const { presetQuery, permission } = useMemo(() => {
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

    return { presetQuery, permission };
  }, [props.objectId, props.checkAgentStatus, props.checkPermission]);
  const fields = useMemo(() => {
    const fields: Record<string, boolean> = {};

    props.fields?.forEach((field) => {
      fields[field] = true;
    });

    return fields;
  }, [props.fields]);

  const objectData = modifyModelData(props.objectMap[props.objectId]);
  const fieldData = objectData.__fieldList.find(
    (field) => field.__id === props.fieldId
  );

  const [visible, setVisible] = useState(false);
  const [selectedInstances, setSelectedInstances] = useState({
    valid: [],
    invalid: [],
  });
  const [inputValue, setInputValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const selectedInstancesQuery = useMemo<Query[]>(
    () =>
      props.previewEnabled && selectedInstances.valid.length > 0
        ? [
            {
              instanceId: {
                $in: selectedInstances.valid.map(
                  (instance) => instance.instanceId
                ),
              },
              ...presetQuery,
            },
            ...(props.query ? props.query : []),
          ]
        : undefined,
    [selectedInstances.valid, presetQuery, props.query]
  );

  const checkSelectedInstances = async (
    selectedInstances: any[]
  ): Promise<string[]> => {
    if (selectedInstances) {
      const instances = (
        await InstanceApi_postSearch(props.objectId, {
          page_size: selectedInstances.length,
          query: {
            instanceId: {
              $in: selectedInstances.map((instance) => instance.instanceId),
            },
            ...presetQuery,
          },
          permission,
          fields: fields || {
            instanceId: true,
            [props.fieldId]: true,
          },
        })
      ).list;
      const instanceIdSet = new Set(
        instances.map((instance) => instance.instanceId)
      );

      const selectedInstancesMap = groupBy(
        selectedInstances,
        (selectedInstance) => instanceIdSet.has(selectedInstance.instanceId)
      );

      setSelectedInstances({
        valid: selectedInstancesMap.true || [],
        invalid: (selectedInstancesMap.false || []).map(
          (invalidSelectedInstance) => invalidSelectedInstance[props.fieldId]
        ),
      });

      return selectedInstancesMap.true ? selectedInstancesMap.true : [];
    }
  };

  const updateSelected = async (instanceIds: string[]): Promise<any[]> => {
    let selectedInstances: any[] = [];
    if (instanceIds.length) {
      selectedInstances = (
        await InstanceApi_postSearch(props.objectId, {
          page: 1,
          page_size: instanceIds.length,
          query: {
            instanceId: {
              $in: instanceIds,
            },
          },
          fields: fields || {
            instanceId: true,
            [props.fieldId]: true,
          },
        })
      ).list;
    }

    setInputValue(
      selectedInstances
        .map((instanceData) => instanceData[props.fieldId])
        .join(separator)
    );

    let instances = selectedInstances;
    if (selectedInstances.length) {
      if (!props.checkDisabled) {
        instances = await checkSelectedInstances(selectedInstances);
      }
    } else {
      setSelectedInstances({ valid: [], invalid: [] });
    }
    return instances;
  };

  useEffect(() => {
    if (props.value) {
      updateSelected(props.value);
    }
    // todo(ice): how formItem to change its value??????
  }, []);

  const handleChange = (instances: any[]): void => {
    props.onChange?.(instances.map((instance) => instance.instanceId));
    props.onChangeV2?.(instances);
  };

  const checkInputValue = async (inputValue: string): Promise<void> => {
    const fieldValues =
      props.fieldId === "ip"
        ? inputValue.match(
            /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b(?:\[[^[\],;\s]*\])?/g
          )
        : inputValue.split(separator);

    if (fieldValues) {
      const instances = (
        await InstanceApi_postSearch(props.objectId, {
          query: {
            $and: [
              {
                [props.fieldId]: {
                  $in: fieldValues,
                },
                ...presetQuery,
              },
              ...(props.query ? props.query : []),
            ],
          },
          permission,
          fields: fields || {
            instanceId: true,
            [props.fieldId]: true,
          },
        })
      ).list;

      const validSelectedInstances = instances.filter((instance) =>
        fieldValues.includes(instance[props.fieldId])
      );

      const validFieldValues = validSelectedInstances.map(
        (instance) => instance[props.fieldId]
      );
      const invalidFieldValues = fieldValues.filter(
        (fieldValue) => !validFieldValues.includes(fieldValue)
      );

      setSelectedInstances({
        valid: validSelectedInstances || [],
        invalid: invalidFieldValues || [],
      });

      handleChange(validSelectedInstances);
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

    const instances = await updateSelected(selectedKeys);

    handleChange(instances);
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
            : inputValue.split(separator);

        const instances = (
          await InstanceApi_postSearch(props.objectId, {
            query: {
              $and: [
                {
                  [props.fieldId]: {
                    $in: fieldValues,
                  },
                },
                ...(props.query ? props.query : []),
              ],
            },
            fields: fields || {
              instanceId: true,
              [props.fieldId]: true,
            },
          })
        ).list;

        setSelectedInstances({
          valid: instances || [],
          invalid: [],
        });

        handleChange(instances);
      }
    } else {
      setSelectedInstances({
        valid: [],
        invalid: [],
      });

      handleChange([]);
    }

    setInputFocused(false);
  };

  const closeInvalidFieldValuesModal = (): void => {
    setSelectedInstances({
      valid: selectedInstances.valid,
      invalid: [],
    });
    setInputValue(
      selectedInstances.valid
        .map((instance) => instance[props.fieldId])
        .join(separator)
    );
    props.onChange?.(
      selectedInstances.valid.map((instance) => instance.instanceId)
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
          </Button>,
        ]}
        onCancel={closeInvalidFieldValuesModal}
      >
        {props.objectId === "HOST" && props.fieldId === "ip"
          ? `${t(K.INVALID_OR_FORBIDDEN_IPS)}${selectedInstances.invalid.join(
              ", "
            )}`
          : `${t(K.INVALID)}${fieldData.name}：${selectedInstances.invalid.join(
              ", "
            )}`}
      </Modal>
      <InstanceListModal
        objectMap={props.objectMap}
        objectId={props.objectId}
        visible={visible}
        title={text}
        aq={props.query}
        presetConfigs={{ query: presetQuery, fieldIds: props.fields }}
        permission={permission}
        selectedRowKeys={selectedInstances.valid.map(
          (instance) => instance.instanceId
        )}
        onSelected={handleInstancesSelected}
        singleSelect={props.singleSelect}
        onCancel={closeSelectInstancesModal}
        defaultQuery={props.defaultQuery}
        pageSize={props.pageSize}
        pageSizeOptions={props.pageSizeOptions}
        showSizeChanger={props.showSizeChanger}
        data-testid="select-modal"
      />
      <div className={style.cmdbInstancesInputFormWrapper}>
        <Input
          data-testid="field-value-input"
          className={style.fieldInput}
          onChange={handleInputChanged}
          value={inputValue}
          onFocus={() => setInputFocused(true)}
          onBlur={handleInputBlur}
          allowClear={props.allowClear}
          disabled={props.inputDisabled}
        />
        <Button
          className={style.modalButton}
          onClick={openSelectInstancesModal}
          disabled={props.addButtonDisabled}
        >
          {text}
        </Button>
      </div>
      {props.previewEnabled && (
        <>
          <InstanceListModal
            objectMap={props.objectMap}
            objectId={props.objectId}
            visible={previewVisible}
            title={t(K.VIEW_SPECIFIC_INSTANCES)}
            aq={selectedInstancesQuery}
            presetConfigs={{ query: presetQuery, fieldIds: props.fields }}
            permission={permission}
            onCancel={() => setPreviewVisible(false)}
            defaultQuery={props.defaultQuery}
            searchDisabled
            advancedSearchDisabled
            aliveHostsDisabled
            relatedToMeDisabled
            moreButtonsDisabled
            selectDisabled
            pageSize={props.pageSize}
            pageSizeOptions={props.pageSizeOptions}
            showSizeChanger={props.showSizeChanger}
            data-testid="preview-modal"
          />
          <Button
            type="link"
            size="small"
            disabled={!selectedInstancesQuery || inputFocused}
            onClick={() => setPreviewVisible(true)}
            data-testid="preview-button"
          >
            {t(K.VIEW_SPECIFIC_INSTANCES)}
          </Button>
        </>
      )}
    </div>
  );
};

export const CmdbInstancesInputFormItem = forwardRef<
  HTMLDivElement,
  CmdbInstancesInputFormItemProps
>(LegacyCmdbInstancesInputFormItem);
