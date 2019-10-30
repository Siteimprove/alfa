import { Iterable } from "@siteimprove/alfa-iterable";
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
 * @see https://html.spec.whatwg.org/#serializing-html-fragments
 */
export function serialize(
  node: Node,
  context: Node,
  options: serialize.Options = {}
): string {
  return Iterable.join(
    traverseNode(
      node,
      context,
      {
        *enter(node) {
          if (isElement(node)) {
            const namespace = getElementNamespace(node, context);

            let name = node.localName;

            if (
              node.prefix !== null &&
              !namespace.includes(Namespace.HTML) &&
              !namespace.includes(Namespace.MathML) &&
              !namespace.includes(Namespace.SVG)
            ) {
              name = `${node.prefix}:${node.localName}`;
            }

            yield `<${name}`;

            const { attributes } = node;

            for (let i = 0, n = attributes.length; i < n; i++) {
              const attribute = attributes[i];
              const namespace = getAttributeNamespace(attribute, context);

              let name = attribute.localName;

              if (namespace.isSome()) {
                switch (namespace.get()) {
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

              yield ` ${name}="${value}"`;
            }

            yield ">";
          } else if (isText(node)) {
            yield getParentElement(node, context)
              .map(parentElement => {
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
                  default:
                    return escape(node.data);
                }
              })
              .getOrElse(() => escape(node.data));
          } else if (isComment(node)) {
            yield `<!--${node.data}-->`;
          } else if (isDocumentType(node)) {
            yield `<!DOCTYPE ${node.name}>`;
          }
        },

        *exit(node) {
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
                  !namespace.includes(Namespace.HTML) &&
                  !namespace.includes(Namespace.MathML) &&
                  !namespace.includes(Namespace.SVG)
                ) {
                  name = `${node.prefix}:${node.localName}`;
                }

                yield `</${name}>`;
            }
          }
        }
      },
      options
    ),
    ""
  );
}

export namespace serialize {
  export interface Options {
    readonly flattened?: boolean;
  }
}

/**
 * @see https://html.spec.whatwg.org/#escapingString
 */
function escape(input: string, options: escape.Options = {}): string {
  input = input.replace(/&/g, "&amp;").replace(/\u00a0/g, "&nbsp;");

  if (options.attributeMode === true) {
    input = input.replace(/"/g, "&quot;");
  } else {
    input = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return input;
}

export namespace escape {
  export interface Options {
    readonly attributeMode?: boolean;
  }
}
