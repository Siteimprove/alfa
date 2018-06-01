/// <reference path="../types/jsx.d.ts" />

const { keys } = Object;

export function jsx(
  localName: string,
  attributes: { [name: string]: any } | null,
  ...childNodes: Array<JSX.Element | string>
): JSX.Element {
  return {
    nodeType: 1,
    prefix: null,
    localName,
    attributes:
      attributes === null
        ? []
        : keys(attributes)
            .filter(name => {
              const value = attributes[name];
              return value !== false && value !== null && value !== undefined;
            })
            .map(name => {
              const value = attributes[name];
              return {
                prefix: null,
                localName: name,
                value:
                  typeof value === "number"
                    ? value.toString(10)
                    : typeof value === "boolean"
                      ? name
                      : typeof value === "string"
                        ? value
                        : value.toString()
              };
            }),
    shadowRoot: null,
    childNodes: childNodes.map(
      childNode =>
        typeof childNode === "string"
          ? { nodeType: 3, childNodes: [], data: childNode }
          : childNode
    )
  };
}
