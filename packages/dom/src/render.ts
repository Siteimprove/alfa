import { Node } from "./types";
import {
  isDocument,
  isDocumentType,
  isElement,
  isText,
  isComment
} from "./guards";

const { keys } = Object;

const EMPTY = "";

/**
 * @see https://www.w3.org/TR/html51/syntax.html#void-elements
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
  "keygen",
  "link",
  "menuitem",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);

export function render(node: Node): string {
  if (isDocument(node)) {
    return node.children.map(render).join(EMPTY);
  }

  // https://w3c.github.io/DOM-Parsing/#xml-serializing-a-documenttype-node
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

  if (isElement(node)) {
    let attributes = EMPTY;
    let element = EMPTY;

    for (const name of keys(node.attributes)) {
      const value = node.attributes[name];

      switch (value) {
        case false:
          continue;
        case true:
          attributes += ` ${name}`;
          break;
        default:
          attributes += ` ${name}="${value}"`;
      }
    }

    element += `<${node.tag}${attributes}>`;

    if (!VOID.has(node.tag)) {
      element += `${node.children.map(render).join(EMPTY)}`;
      element += `</${node.tag}>`;
    }

    return element;
  }

  // https://w3c.github.io/DOM-Parsing/#dfn-xml-serializing-a-text-node
  if (isText(node)) {
    return node.value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // https://w3c.github.io/DOM-Parsing/#xml-serializing-a-comment-node
  if (isComment(node)) {
    return `<!--${node.value}-->`;
  }

  return EMPTY;
}
