import { getAttributeNamespace } from "./get-attribute-namespace";
import { getElementNamespace } from "./get-element-namespace";
import { getParentElement } from "./get-parent-element";
import { isComment, isDocumentType, isElement, isText } from "./guards";
import { traverseNode } from "./traverse-node";
import { Namespace, Node } from "./types";

/**
 * Given a node and a context, construct an HTML serialization of the node
 * within the context.
 *
 * @see https://www.w3.org/TR/html/syntax.html#serializing-html-fragments
 */
export function serialize(
  node: Node,
  context: Node,
  options: Readonly<{ composed?: boolean; flattened?: boolean }> = {}
): string {
  let result = "";

  traverseNode(
    node,
    context,
    {
      enter(node) {
        if (isElement(node)) {
          const namespace = getElementNamespace(node, context);

          let name = node.localName;

          if (
            node.prefix !== null &&
            namespace !== Namespace.HTML &&
            namespace !== Namespace.MathML &&
            namespace !== Namespace.SVG
          ) {
            name = `${node.prefix}:${node.localName}`;
          }

          result += `<${name}`;

          const { attributes } = node;

          for (let i = 0, n = attributes.length; i < n; i++) {
            const attribute = attributes[i];
            const namespace = getAttributeNamespace(attribute, context);

            let name = attribute.localName;

            if (namespace !== null) {
              switch (namespace) {
                case Namespace.XML:
                  name = `xml:${attribute.localName}`;
                  break;
                case Namespace.XMLNS:
                  if (attribute.localName !== "xmlns") {
                    name = `xmlns:${attribute.localName}`;
                  }
                  break;
                case Namespace.XLink:
                  name = `xlink:${attribute.localName}`;
                  break;
                default:
                  if (attribute.prefix !== null) {
                    name = `${attribute.prefix}:${attribute.localName}`;
                  }
              }
            }

            const value = escape(attribute.value, { attributeMode: true });

            result += ` ${name}="${value}"`;
          }

          result += ">";
        } else if (isText(node)) {
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
                result += node.data;
                break;
              default:
                result += escape(node.data);
            }
          } else {
            result += escape(node.data);
          }
        } else if (isComment(node)) {
          result += `<!--${node.data}-->`;
        } else if (isDocumentType(node)) {
          result += `<!DOCTYPE ${node.name}>`;
        }
      },

      exit(node) {
        if (isElement(node)) {
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
              const namespace = getElementNamespace(node, context);

              let name = node.localName;

              if (
                node.prefix !== null &&
                namespace !== Namespace.HTML &&
                namespace !== Namespace.MathML &&
                namespace !== Namespace.SVG
              ) {
                name = `${node.prefix}:${node.localName}`;
              }

              result += `</${name}>`;
          }
        }
      }
    },
    options
  );

  return result;
}

/**
 * @see https://www.w3.org/TR/html/syntax.html#escaping-a-string
 */
function escape(
  input: string,
  options: Readonly<{ attributeMode?: boolean }> = {}
): string {
  input = input.replace(/&/g, "&amp;").replace(/\u00a0/g, "&nbsp;");

  if (options.attributeMode === true) {
    input = input.replace(/"/g, "&quot;");
  } else {
    input = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return input;
}
