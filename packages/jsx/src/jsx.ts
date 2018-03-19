/// <reference path="./types/element.d.ts"/>
/// <reference path="./types/intrinsics.d.ts"/>

const { keys, assign } = Object;

export function jsx(
  tagName: string,
  attributes: { [name: string]: string | number | boolean } | null,
  ...children: Array<JSX.Element | string>
): JSX.Element {
  const element: JSX.Element = {
    nodeType: 1,
    namespaceURI: null,
    tagName,
    attributes:
      attributes === null
        ? []
        : keys(attributes).map(name => {
            let value = attributes[name];

            if (typeof value === "number") {
              value = String(value);
            }

            if (typeof value === "boolean") {
              value = name;
            }

            return { name, value };
          }),
    parentNode: null,
    childNodes: [],
    shadowRoot: null
  };

  for (const node of children) {
    let child: JSX.Element | JSX.Text;

    if (typeof node === "string") {
      child = {
        nodeType: 3,
        parentNode: element,
        childNodes: [],
        data: node
      };
    } else {
      const parentNode = { parentNode: element };

      if (node.parentNode) {
        child = assign({}, node, parentNode);
      } else {
        child = assign(node, parentNode);
      }
    }

    element.childNodes.push(child);
  }

  return element;
}
