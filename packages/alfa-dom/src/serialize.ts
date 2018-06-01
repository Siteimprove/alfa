import { map } from "@siteimprove/alfa-util";
import { Node, Namespace } from "./types";
import { isDocumentType, isElement, isText, isComment } from "./guards";
import { getParentElement } from "./get-parent-element";
import { getElementNamespace } from "./get-element-namespace";
import { getAttributeNamespace } from "./get-attribute-namespace";

/**
 * @see https://www.w3.org/TR/html/syntax.html#escaping-a-string
 */
function escape(
  input: string,
  options: { attributeMode?: boolean } = {}
): string {
  input = input.replace(/&/g, "&amp;").replace(/\u00A0/g, "&nbsp;");

  if (options.attributeMode) {
    input = input.replace(/"/g, "&quot;");
  } else {
    input = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return input;
}

/**
 * @see https://www.w3.org/TR/html/syntax.html#serializing-html-fragments
 */
export function serialize(node: Node, context: Node = node): string {
  if (isElement(node)) {
    const namespace = getElementNamespace(node, context);

    let name = node.localName;

    if (namespace !== null) {
      switch (namespace) {
        case Namespace.HTML:
        case Namespace.MathML:
        case Namespace.SVG:
          break;
        default:
          if (node.prefix !== null) {
            name = node.prefix + ":" + node.localName;
          }
      }
    }

    let element = `<${name}`;

    const { attributes } = node;

    for (let i = 0, n = attributes.length; i < n; i++) {
      const attribute = attributes[i];
      const namespace = getAttributeNamespace(attribute, node, context);

      let name = attribute.localName;

      if (namespace !== null) {
        switch (namespace) {
          case Namespace.XML:
            name = "xml:" + attribute.localName;
            break;
          case Namespace.XMLNS:
            if (attribute.localName !== "xmlns") {
              name = "xmlns:" + attribute.localName;
            }
            break;
          case Namespace.XLink:
            name = "xlink:" + attribute.localName;
            break;
          default:
            if (attribute.prefix !== null) {
              name = attribute.prefix + ":" + attribute.localName;
            }
        }
      }

      element += ` ${name}="${escape(attribute.value, {
        attributeMode: true
      })}"`;
    }

    element += ">";

    switch (node.localName) {
      case "area":
      case "base":
      case "basefont":
      case "bgsound":
      case "br":
      case "col":
      case "embed":
      case "frame":
      case "hr":
      case "img":
      case "input":
      case "link":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
        break;
      default:
        element += map(node.childNodes, child =>
          serialize(child, context)
        ).join("");
        element += `</${name}>`;
    }

    return element;
  }

  if (isText(node)) {
    if (context !== null) {
      const parentElement = getParentElement(node, context);

      if (parentElement !== null) {
        switch (parentElement.localName) {
          case "style":
          case "script":
          case "xmp":
          case "iframe":
          case "noembed":
          case "noframes":
          case "plaintext":
          case "noscript":
            return node.data;
        }
      }
    }

    return escape(node.data);
  }

  if (isComment(node)) {
    return `<!--${node.data}-->`;
  }

  if (isDocumentType(node)) {
    return `<!DOCTYPE ${node.name}>`;
  }

  return map(node.childNodes, child => serialize(child, context)).join("");
}
