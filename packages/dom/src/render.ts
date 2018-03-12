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

const EMPTY = "";

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

function escape(input: string | number): string {
  if (typeof input === "string") {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  return String(input);
}

/**
 * @see https://www.w3.org/TR/DOM-Parsing/#serializing
 */
export function render(node: Node): string {
  if (isElement(node)) {
    let attributes = EMPTY;
    let element = EMPTY;

    for (const name of keys(node.attributes)) {
      const value = node.attributes[name];

      if (value === false || value === undefined) {
        continue;
      }

      switch (value) {
        case true:
          attributes += ` ${name}`;
          break;
        default:
          attributes += ` ${name}="${escape(value)}"`;
      }
    }

    element += `<${node.tag}${attributes}>`;

    if (!VOID.has(node.tag)) {
      element += `${node.children.map(render).join(EMPTY)}`;
      element += `</${node.tag}>`;
    }

    return element;
  }

  if (isText(node)) {
    return escape(node.value);
  }

  if (isComment(node)) {
    return `<!--${node.value}-->`;
  }

  if (isDocument(node) || isDocumentFragment(node)) {
    return node.children.map(render).join(EMPTY);
  }

  if (isDocumentType(node)) {
    return (
      `<!DOCTYPE ${node.name}` +
      (node.publicId
        ? ` PUBLIC "${node.publicId}"`
        : node.systemId ? " SYSTEM" : "") +
      (node.systemId ? ` "${node.systemId}"` : "") +
      ">"
    );
  }

  return EMPTY;
}
