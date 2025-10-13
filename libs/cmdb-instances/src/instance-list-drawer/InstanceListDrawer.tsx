import React, { useReducer } from "react";
import { Button, Drawer } from "antd";
import i18n from "i18next";
import { K, NS_LIBS_CMDB_INSTANCES } from "../i18n/constants";
import {
  LegacyInstanceListWrapper,
  InstanceListProps,
} from "../instance-list/InstanceList";
import { addResourceBundle } from "../i18n";
import { getRuntime } from "@next-core/brick-kit";
import { TransHierRelationType } from "@next-libs/cmdb-utils";
import styles from "./InstanceListDrawer.module.css";
addResourceBundle();

export interface InstanceListDrawerProps extends InstanceListProps {
  drawerZIndex?: number;
  drawerWidth?: number;
}
/* istanbul ignore next */
const reducer = (
  prevState: InstanceListDrawerState,
  updatedProperty: Partial<InstanceListDrawerState>
): InstanceListDrawerState => {
  return {
    ...prevState,
    ...updatedProperty,
  };
};

const DEFAULT_RELATION_LIMIT = 5;

interface InstanceListDrawerState {
  open: boolean;
  objectId: string;
  drawerTitle: string;
  query: Record<string, any>;
  detailUrlTemplates: Record<string, any>;
  searchTransHierRelationInstance: boolean;
  transHierRelation?: TransHierRelationType;
  searchTransHierRelationSource?: { objectId: string; instanceId: string };
}

export function InstanceListDrawer(
  props: InstanceListDrawerProps
): React.ReactElement {
  const [state, setState] = useReducer(reducer, {
    open: false,
    objectId: null,
    detailUrlTemplates: undefined,
    drawerTitle: "",
    query: null,
    searchTransHierRelationInstance: false,
    transHierRelation: null,
    searchTransHierRelationSource: null,
  });

  /* istanbul ignore next */
  const handleClose = (): void => {
    setState({
      open: false,
      drawerTitle: "",
      searchTransHierRelationInstance: false,
      transHierRelation: null,
      searchTransHierRelationSource: null,
    });
  };

  const renderFooter = (): React.ReactElement => {
    return (
      <>
        <Button
          data-testid={"back-button"}
          onClick={handleClose}
          type="default"
        >
          {i18n.t(`${NS_LIBS_CMDB_INSTANCES}:${K.BACK}`)}
        </Button>
      </>
    );
  };
  const handleRelationMoreIconClick = (
    record: Record<string, any>,
    relation?: Record<string, any>,
    sourceObjectId?: string
  ): void => {
    setState({
      transHierRelation: relation as any,
      searchTransHierRelationInstance: relation?.type === "transHierRelation",
      searchTransHierRelationSource: {
        objectId: sourceObjectId,
        instanceId: record.instanceId,
      },
      open: true,
      objectId: record.objectId,
      drawerTitle: record.left_name,
      detailUrlTemplates: {
        [record.objectId]: Object.values(props.detailUrlTemplates || {})?.[0],
      },
      query:
        relation?.type === "transHierRelation"
          ? {}
          : {
              [`${record.right_id}.instanceId`]: record.instanceId,
            },
    });
  };

  const _relationLimit =
    props.relationLimit ??
    (getRuntime().getMiscSettings()?.defaultRelationLimit as number) ??
    DEFAULT_RELATION_LIMIT;
  return (
    <>
      <LegacyInstanceListWrapper
        {...props}
        onRelationMoreIconClick={handleRelationMoreIconClick}
        relationLimit={_relationLimit}
      />
      <Drawer
        title={(() => {
          return (
            <div className={styles.drawerTitleWrapper}>
              {state.drawerTitle}
              {state.searchTransHierRelationInstance && (
                <div className={styles.tag}>
                  {i18n.t(
                    `${NS_LIBS_CMDB_INSTANCES}:${K.CROSS_LEVEL_RELATIONSHIPS}`
                  )}
                </div>
              )}
            </div>
          );
        })()}
        visible={state.open}
        width={props.drawerWidth || 900}
        onClose={handleClose}
        destroyOnClose={true}
        footer={renderFooter()}
        zIndex={props.drawerZIndex ?? 1000}
        footerStyle={{ background: "var(--color-fill-bg-base-3)" }}
      >
        <InstanceListDrawer
          searchTransHierRelationSource={state.searchTransHierRelationSource}
          transHierRelation={state.transHierRelation}
          searchTransHierRelationInstance={
            state.searchTransHierRelationInstance
          }
          objectId={state.objectId}
          onRelationMoreIconClick={handleRelationMoreIconClick}
          relationLimit={_relationLimit}
          detailUrlTemplates={state.detailUrlTemplates}
          presetConfigs={{ query: state.query }}
          selectDisabled={true}
          ipCopy={props.ipCopy}
          target={props.target}
          relatedToMe={props.relatedToMe}
          relatedToMeDisabled={props.relatedToMeDisabled}
          searchDisabled={props.searchDisabled}
          sortDisabled={props.sortDisabled}
          advancedSearchDisabled={props.advancedSearchDisabled}
          aliveHostsDisabled={props.aliveHostsDisabled}
          moreButtonsDisabled={props.moreButtonsDisabled}
          showFixedHeader={props.showFixedHeader}
          showTooltip={props.showTooltip}
          relationLinkDisabled={props.relationLinkDisabled}
          showSizeChanger={props.showSizeChanger}
          useExternalCmdbApi={props.useExternalCmdbApi}
          externalSourceId={props.externalSourceId}
          useAutoDiscoveryProvider={props.useAutoDiscoveryProvider}
          useInstanceArchiveProvider={props.useInstanceArchiveProvider}
          saveFieldsBackend={props.saveFieldsBackend}
        />
      </Drawer>
    </>
  );
}
