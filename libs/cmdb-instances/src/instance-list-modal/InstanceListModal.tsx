import React, { useState } from "react";
import { WarningOutlined } from "@ant-design/icons";
import { Modal, Button, Tooltip } from "antd";
import i18n from "i18next";
import { CmdbModels, InstanceApi_postSearch } from "@next-sdk/cmdb-sdk";
import { Query } from "@next-libs/cmdb-utils";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import {
  InstanceList,
  filterObjectIdQuery,
} from "../instance-list/InstanceList";
import { InstanceListPresetConfigs } from "../instance-list-table/interfaces";
import { UseBrickAndPropertyDisplayConfig } from "../instance-list-table";
import { addResourceBundle } from "../i18n";
import {
  ReadPaginationChangeDetail,
  UseBrickConf,
} from "@next-core/brick-types";
import { useProvider } from "@next-core/brick-kit";
addResourceBundle();
export interface InstanceListModalProps {
  objectMap: { [key: string]: Partial<CmdbModels.ModelCmdbObject> };
  objectId: string;
  visible: boolean;
  title: React.ReactNode | string;
  q?: string;
  query?: any;
  presetConfigs?: InstanceListPresetConfigs;
  permission?: string[];
  aq?: Query[];
  instanceSourceQuery?: string;
  isInstanceFilterForm?: boolean;
  searchDisabled?: boolean;
  advancedSearchDisabled?: boolean;
  aliveHostsDisabled?: boolean;
  relatedToMeDisabled?: boolean;
  moreButtonsDisabled?: boolean;
  filterInstanceSourceDisabled?: boolean;
  sortDisabled?: boolean;
  selectDisabled?: boolean;
  showCloseBtn?: boolean;
  ipCopy?: boolean;
  singleSelect?: boolean;
  selectedRowKeys?: string[];
  onCancel: () => void;
  onSelected?: (instanceIds: any[]) => void;
  onSelectedV2?: (instanceDataList: any[]) => void;
  modalZIndex?: number;
  pageSize?: number;
  page?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  defaultQuery?: { [fieldId: string]: any }[];
  enableSearchByApp?: boolean;
  hideSearchConditions?: boolean;
  rowSelectionType?: "checkbox" | "radio";
  getPaginationData?(pagination: ReadPaginationChangeDetail): void;
  extraFixedFields?: string[];
  limitInstanceRange?: boolean;
  extraFilterBricks?: {
    useBrick: UseBrickConf;
  };
  showBindButton?: boolean;
  bindEvent?: () => void;
  bindButtonDisabled?: boolean;
  bindButtonText?: string;
  disabledTooltip?: string;
  // 是否开启实例来源筛选
  showFilterInstanceSource?: boolean;
  filterInstanceSource?: boolean;
  onFilterInstanceSourceChange?(value: boolean): void;
  onFilterObjectIdChange?(value: filterObjectIdQuery): void;
  objectIdQuery?: string;
  ignorePermission?: boolean;
  saveFieldsBackend?: boolean;
  useExternalCmdbApi?: boolean;
  externalSourceId?: string;
  showHiddenInfoDisabled?: boolean;
  propertyDisplayConfigs?: UseBrickAndPropertyDisplayConfig[];
  modalWidth?: number;
  relationLimit?: number;
}

export function InstanceListModal(
  props: InstanceListModalProps
): React.ReactElement {
  const [selectedInstanceListTemp, setSelectedInstanceListTemp] = useState([]);
  const externalPostSearchV3 = useProvider(
    "easyops.api.cmdb.topo_center@ProxyPostSearchV3:1.0.1",
    { cache: false }
  );
  // istanbul ignore next
  const handleOk = async () => {
    if (
      selectedInstanceListTemp.length &&
      selectedInstanceListTemp.every((i) => typeof i === "string")
    ) {
      let resp: any;
      const requestParams = {
        query: {
          instanceId: {
            $in: selectedInstanceListTemp,
          },
        },
        page: 1,
        page_size: selectedInstanceListTemp.length,
      };
      try {
        if (props.useExternalCmdbApi) {
          resp = await externalPostSearchV3.query([
            {
              ...requestParams,
              objectId: props.objectId,
              sourceId: props.externalSourceId,
              ignore_missing_field_error: true,
            },
          ]);
        } else {
          resp = await InstanceApi_postSearch(props.objectId, requestParams);
        }
        props.onSelected?.(selectedInstanceListTemp);
        props.onSelectedV2?.(resp.list);
      } catch {
        props.onSelected?.(selectedInstanceListTemp);
      }
      return;
    }

    props.onSelected?.(
      selectedInstanceListTemp.map(
        (selectedInstance) => selectedInstance.instanceId
      )
    );
    props.onSelectedV2?.(selectedInstanceListTemp);
  };
  // istanbul ignore next
  const handleCancel = () => {
    // reset selected
    setSelectedInstanceListTemp(props.selectedRowKeys ?? []);
    props.onCancel();
  };
  // istanbul ignore next
  const handleSelectionChange = (event: {
    selectedKeys: string[];
    selectedItems: any[];
  }) => {
    if (event.selectedItems.length < event.selectedKeys.length) {
      setSelectedInstanceListTemp(event.selectedKeys);
    } else {
      setSelectedInstanceListTemp(event.selectedItems);
    }
  };
  //istanbul ignore next
  const handlePaginationChange = (event: {
    page: number;
    pageSize: number;
  }) => {
    props.getPaginationData?.(event);
  };
  const presetConfigs = props.presetConfigs ?? {
    query: props.query,
  };

  const fixAliveHosts = presetConfigs.query?._agentStatus === "正常";

  React.useEffect(() => {
    if (props.selectedRowKeys) {
      setSelectedInstanceListTemp(props.selectedRowKeys.filter(Boolean));
    }
  }, [props.selectedRowKeys]);

  const renderFooter = (): React.ReactElement => {
    const {
      showBindButton,
      bindButtonDisabled,
      disabledTooltip,
      bindButtonText,
    } = props;
    return (
      <>
        {!!showBindButton &&
          (bindButtonDisabled ? (
            <Tooltip
              title={
                disabledTooltip ||
                i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.PERMISSION_DENIED}`)
              }
            >
              <Button style={{ position: "absolute", left: "24px" }} disabled>
                {bindButtonText ||
                  i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CREATE_AND_BIND}`)}
              </Button>
            </Tooltip>
          ) : (
            <Button
              style={{ position: "absolute", left: "24px" }}
              onClick={props.bindEvent}
            >
              {bindButtonText ||
                i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CREATE_AND_BIND}`)}
            </Button>
          ))}
        {props.singleSelect && selectedInstanceListTemp.length > 1 && (
          <span style={{ color: "#ff0016", marginRight: "20px" }}>
            <WarningOutlined
              style={{ color: "#ff0016", marginRight: "10px" }}
            />
            {i18n.t(
              `${NS_LIBS_CMDB_INSTANCES}:${K.ONLY_ONE_INSTANCE_TO_ALLOWED}`
            )}
          </span>
        )}
        {(props.selectDisabled || props.showCloseBtn) && (
          <Button key="back" onClick={props.onCancel}>
            {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CLOSE}`)}
          </Button>
        )}
        {!props.selectDisabled && !props.showCloseBtn && (
          <>
            <Button key="back" onClick={handleCancel} type="text">
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CANCEL}`)}
            </Button>
            <Button
              key="submit"
              type="primary"
              onClick={handleOk}
              disabled={
                !selectedInstanceListTemp.length ||
                (props.singleSelect && selectedInstanceListTemp.length > 1)
              }
            >
              {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.CONFIRM}`)}
            </Button>
          </>
        )}
      </>
    );
  };
  return (
    <Modal
      title={props.title}
      visible={props.visible}
      width={props.modalWidth || 900}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose={true}
      footer={renderFooter()}
      zIndex={props.modalZIndex ?? 1000}
    >
      <div style={{ maxHeight: 720, overflow: "auto" }}>
        <InstanceList
          aq={props.aq}
          q={props.q}
          objectId={props.objectId}
          objectList={Object.values(props.objectMap)}
          presetConfigs={presetConfigs}
          extraFilterBricks={props.extraFilterBricks}
          permission={props.permission}
          aliveHosts={fixAliveHosts}
          fixAliveHosts={fixAliveHosts}
          instanceSourceQuery={props.instanceSourceQuery}
          searchDisabled={props.searchDisabled}
          filterInstanceSourceDisabled={props.filterInstanceSourceDisabled}
          advancedSearchDisabled={props.advancedSearchDisabled}
          aliveHostsDisabled={props.aliveHostsDisabled}
          relatedToMeDisabled={props.relatedToMeDisabled}
          moreButtonsDisabled={props.moreButtonsDisabled}
          sortDisabled={props.sortDisabled}
          selectDisabled={props.selectDisabled}
          selectedRowKeys={props.selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          showSizeChanger={props.showSizeChanger}
          pageSizeOptions={props.pageSizeOptions}
          pageSize={props.pageSize || 10}
          page={props.page}
          defaultQuery={props.defaultQuery}
          enableSearchByApp={props.enableSearchByApp}
          hideSearchConditions={props.hideSearchConditions}
          isInstanceFilterForm={props.isInstanceFilterForm}
          ipCopy={props.ipCopy}
          rowSelectionType={props.rowSelectionType}
          onPaginationChange={handlePaginationChange}
          extraFixedFields={props.extraFixedFields}
          limitInstanceRange={props.limitInstanceRange}
          showFilterInstanceSource={props.showFilterInstanceSource}
          filterInstanceSource={props.filterInstanceSource}
          onFilterInstanceSourceChange={props.onFilterInstanceSourceChange}
          objectIdQuery={props.objectIdQuery}
          onFilterObjectIdChange={props.onFilterObjectIdChange}
          ignorePermission={props.ignorePermission}
          saveFieldsBackend={props.saveFieldsBackend}
          useExternalCmdbApi={props.useExternalCmdbApi}
          externalSourceId={props.externalSourceId}
          showHiddenInfoDisabled={props.showHiddenInfoDisabled}
          propertyDisplayConfigs={props.propertyDisplayConfigs}
          relationLimit={props.relationLimit}
        />
      </div>
    </Modal>
  );
}
