import { h } from "./h";

import { Node, Element } from ".";

import * as dom from ".";

const { entries } = Object;

/**
 * @public
 */
export function jsx(
  name: string,
  properties: jsx.Properties | null = null,
  ...children: Array<jsx.Child>
): Element {
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

/**
 * @public
 */
export namespace jsx {
  export type Child = Node | string;

  export interface Properties {
    [name: string]: unknown;

    /**
     * An optional record of CSS property names and their associated values.
     * This works similarly to the `style` property in React.
     *
     * {@link https://reactjs.org/docs/dom-elements.html#style}
     */
    style?: Record<string, string>;
  }

  /**
   * {@link https://www.typescriptlang.org/docs/handbook/jsx.html}
   *
   * @remarks
   * This namespace is currently needed to let the TypeScript compiler know the
   * shape of elements returned by `jsx()` and the properties that tags allow.
   * We should keep an eye on https://github.com/microsoft/TypeScript/issues/14729
   * as it might provide an opportunity to get rid of this namespace entirely.
   */
  export namespace JSX {
    export type Element = dom.Element;

    export interface IntrinsicElements {
      [tag: string]: Properties;
    }
  }
}
