import * as V from "@alfa/dom";
import { Style, State, properties, clean, deduplicate } from "@alfa/style";

const { assign } = Object;

export type WithStyle<T extends V.Element> = T & {
  style: { [S in State]: Style };
};

export function hasStyle<T extends V.Element>(
  element: T
): element is WithStyle<T> {
  return "style" in element;
}

function focusTarget(element: HTMLElement): HTMLElement | null {
  if ("focus" in element && element.tabIndex >= -1) {
    return element;
  }

  if (element.parentElement !== null) {
    return focusTarget(element.parentElement);
  }

  return null;
}

function view(node: Node): Window {
  if (node.nodeType === node.DOCUMENT_NODE) {
    return (node as Document).defaultView;
  }

  return node.ownerDocument.defaultView;
}

export function style(
  element: V.Element,
  reference: Element
): WithStyle<V.Element> {
  const computed = view(reference).getComputedStyle(reference);
  const style: { [S in State]: Style } = {
    default: {},
    focus: {}
  };

  const target = focusTarget(reference as HTMLElement);

  if (target !== null) {
    target.blur();
  }

  for (const property of properties) {
    const value = computed.getPropertyValue(property);

    if (value !== "") {
      style.default[property] = value;
    }
  }

  style.default = clean(style.default);

  if (target !== null) {
    target.focus();

    for (const property of properties) {
      const value = computed.getPropertyValue(property);

      if (value !== "") {
        style.focus[property] = value;
      }
    }

    style.focus = deduplicate(style.default, clean(style.focus));

    target.blur();
  }

  return assign(element, { style });
}
