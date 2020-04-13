import React from "react";
import styles from "./RouteNodeComponent.module.css";
import { ViewItem } from "../shared/interfaces";
import { viewTypeConfig } from "./constants";
import { get } from "lodash";

export interface RouteNodeComponentProps {
  originalData?: ViewItem;
  onNodeClick?: (node: ViewItem) => void;
}

const getPreviewSvg = (data: ViewItem): React.ReactElement => {
  const config =
    get(viewTypeConfig, data?.graphInfo?.viewType) ?? viewTypeConfig.default;
  return config.component;
};

export function RouteNodeComponent(
  props: RouteNodeComponentProps
): React.ReactElement {
  const { originalData, onNodeClick } = props;

  /* istanbul ignore next */
  const handleNodeClick = (): void => {
    onNodeClick?.(originalData);
  };

  return (
    <div className={styles.routeNodeContainer} onClick={handleNodeClick}>
      <div className={styles.routeTitle}>
        {originalData.alias ?? originalData.path}
      </div>
      {getPreviewSvg(originalData)}
    </div>
  );
}
