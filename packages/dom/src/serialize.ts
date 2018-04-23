import { Node } from "./types";
import {
  isDocument,
  isDocumentFragment,
  isDocumentType,
  isElement,
  isText,
  isComment
} from "./guards";
import { getTag } from "./get-tag";
import { getParent } from "./get-parent";

const { keys } = Object;

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
export function serialize(node: Node, context: Node | null = null): string {
  if (isElement(node)) {
    let element = `<${getTag(node)}`;

    for (const { name, value } of node.attributes) {
      element += ` ${name}="${escape(value, { attributeMode: true })}"`;
    }

    element += ">";

    switch (getTag(node)) {
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
        element += node.childNodes
          .map(child => serialize(child, context))
          .join("");
        element += `</${getTag(node)}>`;
    }

    return element;
  }

  if (isText(node)) {
    if (context !== null) {
      const parent = getParent(node, context);

      if (parent !== null && isElement(parent)) {
        switch (getTag(parent)) {
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

  return node.childNodes.map(child => serialize(child, context)).join("");
}
