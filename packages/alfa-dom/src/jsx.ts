import { h } from "./h";

import { Node } from "./node";
import { Element } from "./node/element";

const { entries } = Object;

export function jsx(
  name: string,
  properties: jsx.JSX.IntrinsicProps | null = null,
  ...children: Array<Node.JSON | string>
): Element.JSON {
  const attributes: Record<string, string | boolean> = {};
  const style: Record<string, string> = {};

  for (const [name, value] of entries(properties ?? {})) {
    if (value === null || value === undefined) {
      continue;
    }

    switch (name) {
      case "style":
        const properties = value as Record<string, string>;

        for (const [name, value] of entries(properties)) {
          style[name] = value;
        }

        continue;

      default:
        attributes[name] = value === true ? value : `${value}`;
    }
  }

  return h(name, attributes, children, style);
}

export namespace jsx {
  export namespace JSX {
    export type Element = import("./node/element").Element.JSON;

    export interface IntrinsicProps {
      [attribute: string]: unknown;
      style?: Record<string, string>;
    }

    export interface IntrinsicElements {
      [tag: string]: IntrinsicProps;
    }
  }
}
