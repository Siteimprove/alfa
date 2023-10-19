import { h } from "./h";

import { Element, Node } from ".";

import { Device } from "@siteimprove/alfa-device";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import * as dom from ".";

const { entries } = Object;

/**
 * @public
 */
export function jsx<N extends string = string>(
  name: N,
  properties: jsx.Properties | null = null,
  ...children: jsx.Children
): Element<N> {
  const attributes: Record<string, string | boolean> = {};
  const style: Record<string, string> = {};
  let box: Rectangle | undefined = undefined;
  let device: Device | undefined = undefined;

  for (const [name, value] of entries(properties ?? {})) {
    if (value === null || value === undefined) {
      continue;
    }

    switch (name) {
      case "style":
        for (const [propName, propValue] of entries(value)) {
          style[propName] = propValue;
        }

        continue;

      case "box":
        const deviceAndBox = value as { device: Device } & Rectangle.JSON;

        box = Rectangle.from(deviceAndBox);
        device = deviceAndBox.device;

        continue;

      default:
        attributes[name] = value === true ? value : `${value}`;
    }
  }

  return h(
    name,
    attributes,
    (children as Array<jsx.Child>).flat(Infinity),
    style,
    box,
    device
  );
}

/**
 * @public
 */
export namespace jsx {
  export type Child = Node | string;

  /**
   * @remarks
   * This type is declared using the short array syntax (`[]`) to avoid issues
   * with circular generic references.
   */
  export type Children = (Child | Children)[];

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
    export type Element<N extends string = string> = dom.Element<N>;

    export interface IntrinsicElements {
      [tag: string]: Properties;
    }
  }
}
