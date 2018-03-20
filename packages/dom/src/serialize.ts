import { Node } from "./types";
import {
  isDocument,
  isDocumentFragment,
  isDocumentType,
  isElement,
  isText,
  isComment
} from "./guards";

const { keys } = Object;

/**
 * @see https://www.w3.org/TR/html/syntax.html#void-elements
 */
const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);

/**
 * @see https://www.w3.org/TR/html/syntax.html#escaping-a-string
 */
function escape(input: string | number, isAttribute: boolean = false): string {
  if (typeof input !== "string") {
    input = String(input);
  }

  input = input.replace(/&/g, "&amp;").replace(/\u00A0/g, "&nbsp;");

  if (isAttribute) {
    input = input.replace(/"/g, "&quot;");
  } else {
    input = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return input;
}

/**
 * @see https://www.w3.org/TR/html/syntax.html#serializing-html-fragments
 */
export function serialize(node: Node): string {
  if (isElement(node)) {
    let element = `<${node.tagName}`;

    for (const { name, value } of node.attributes) {
      element += ` ${name}="${escape(value, true)}"`;
    }

    element += ">";

    if (!VOID.has(node.tagName)) {
      element += node.childNodes.map(serialize).join("");
      element += `</${node.tagName}>`;
    }

    return element;
  }

  if (isText(node)) {
    const { parentNode } = node;

    if (parentNode !== null && isElement(parentNode)) {
      switch (parentNode.tagName) {
        case "style":
        case "script":
        case "iframe":
        case "noembed":
        case "noscript":
          return node.data;
      }
    }

    return escape(node.data);
  }

  if (isComment(node)) {
    return `<!--${node.data}-->`;
  }

  if (isDocument(node) || isDocumentFragment(node)) {
    return node.childNodes.map(serialize).join("");
  }

  if (isDocumentType(node)) {
    return `<!DOCTYPE ${node.name}>`;
  }

  return "";
}
