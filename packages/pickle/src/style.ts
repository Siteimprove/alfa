import * as V from "@alfa/dom";
import { Style, State, properties } from "@alfa/style";

const { assign } = Object;

export type WithStyle<T extends V.Element> = T & {
  style: { [S in State]: Style };
};

export function hasStyle<T extends V.Element>(
  element: T
): element is WithStyle<T> {
  return "style" in element;
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

function deduplicate(base: Style, target: Style): Style {
  const deduplicated: Style = {};

  for (const property of properties) {
    const value = target[property];

    if (property in target && base[property] !== value) {
      deduplicated[property] = target[property];
    }
  }

  return deduplicated;
}

function clean(style: Style): Style {
  const cleaned: Style = {};

  for (const property of properties) {
    if (property in style) {
      switch (property) {
        case "background-image":
          if (style[property] === "none") {
            continue;
          }
          break;

        case "background-color":
          if (style[property] === "rgba(0, 0, 0, 0)") {
            continue;
          }
          break;

        case "text-indent":
          if (style[property] === "0px") {
            continue;
          }
          break;

        case "outline-style":
        case "outline-color":
        case "outline-width":
          if (
            style["outline-style"] === "none" ||
            style["outline-color"] === "rgba(0, 0, 0, 0)" ||
            style["outline-width"] === "0px"
          ) {
            continue;
          }
      }

      cleaned[property] = style[property];
    }
  }

  return cleaned;
}
