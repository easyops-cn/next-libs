export function TargetControlPointManager(
  styles: Record<string, string>
): (node: HTMLElement, control?: string) => void {
  let prevNode: HTMLElement;
  return (node: HTMLElement, control?: string) => {
    if (prevNode && prevNode !== node) {
      const prevControlPoint = prevNode.querySelector(
        `.${styles.controlPoint}.${styles.nearest}`
      );
      if (prevControlPoint) {
        prevControlPoint.classList.remove(styles.nearest);
      }
    }
    if (node) {
      const controlPoints = node.querySelectorAll(`.${styles.controlPoint}`);
      for (const ctrl of controlPoints) {
        if (ctrl.classList.contains(styles[control])) {
          ctrl.classList.add(styles.nearest);
        } else {
          ctrl.classList.remove(styles.nearest);
        }
      }
    }
    prevNode = node;
  };
}
