import { Style, Property, Properties } from "@alfa/style";

export function style(element: Element): Style {
  const style: Partial<Record<Property, string>> = {};

  const computed = view(element).getComputedStyle(element);

  for (const property of Properties) {
    const value = computed.getPropertyValue(property);

    if (value !== "") {
      style[property] = value;
    }
  }

  return clean(style);
}

function view(node: Node): Window {
  if (node.nodeType === node.DOCUMENT_NODE) {
    return (node as Document).defaultView;
  }

  return node.ownerDocument.defaultView;
}

function clean(style: Style): Style {
  const cleaned: Partial<Record<Property, string>> = {};

  for (const property of Properties) {
    if (property in style) {
      const value = style[property];

      switch (property) {
        case "background-image":
          if (value === "none") {
            continue;
          }
          break;

        case "background-color":
          if (value === "rgba(0, 0, 0, 0)") {
            continue;
          }
          break;

        case "text-indent":
          if (value === "0px") {
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

      cleaned[property] = value;
    }
  }

  return cleaned;
}
