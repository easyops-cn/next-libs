export function lookUpElementUntil(
  element: HTMLElement,
  until: (elem: HTMLElement) => boolean
): HTMLElement | null {
  let current = element;
  while (current && !until(current)) {
    current = current.parentElement;
  }
  return current;
}
