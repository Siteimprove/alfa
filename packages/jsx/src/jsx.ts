/// <reference path="./types/element.d.ts"/>
/// <reference path="./types/intrinsics.d.ts"/>

const { assign } = Object;

export function jsx(
  tag: string,
  attributes: { [name: string]: string | number | boolean } | null,
  ...children: Array<JSX.Element | string>
): JSX.Element {
  const element: JSX.Element = {
    type: "element",
    tag,
    namespace: null,
    attributes: attributes === null ? {} : attributes,
    children: [],
    parent: null,
    shadow: null
  };

  for (const node of children) {
    let child: JSX.Element | JSX.Text;

    if (typeof node === "string") {
      child = {
        type: "text",
        value: node,
        parent: element
      };
    } else {
      const parent = { parent: element };

      if (node.parent) {
        child = assign({}, node, parent);
      } else {
        child = assign(node, parent);
      }
    }

    element.children.push(child);
  }

  return element;
}
