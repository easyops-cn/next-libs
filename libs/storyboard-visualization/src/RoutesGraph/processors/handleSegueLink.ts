import {
  LinkVertex,
  SegueLinkData,
  SegueLinkError,
  SnappedLinkVertex,
} from "../interfaces";
import { isSnapped } from "./getLinkVertex";

export function handleSegueLink({
  sourceVertex,
  targetVertex,
  onSegueLink,
  onSegueLinkError,
}: {
  sourceVertex: SnappedLinkVertex;
  targetVertex: LinkVertex;
  onSegueLink?: (segue: SegueLinkData) => void;
  onSegueLinkError?: (error: SegueLinkError) => void;
}): void {
  if (isSnapped(targetVertex)) {
    const targetData = targetVertex.node.originalData;
    if (!targetData.alias) {
      onSegueLinkError?.({
        message: "The target route has no alias!",
      });
      return;
    }
    const sourceData = sourceVertex.node.originalData;
    onSegueLink?.({
      source: {
        instanceId: sourceData.instanceId,
        segues: sourceData.segues,
      },
      target: {
        alias: targetData.alias,
      },
      segueId:
        targetData.alias &&
        Object.entries(sourceData.segues || {}).find(
          ([id, segue]) => segue.target === targetData.alias
        )?.[0],
      _view: {
        controls: [sourceVertex.control, targetVertex.control],
      },
    });
  }
}
