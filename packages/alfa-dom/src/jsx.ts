import { None, Option } from "@siteimprove/alfa-option";

import { Namespace } from "./namespace";
import { Attribute } from "./node/attribute";
import { Element } from "./node/element";
import { Text } from "./node/text";

const { keys } = Object;

export function jsx(
  type: string,
  properties?: { [name: string]: unknown } | null,
  ...children: Array<Element | string>
): Element {
  return Element.of(
    Option.of(Namespace.HTML),
    None,
    type,
    function*(self) {
      if (properties === null || properties === undefined) {
        return [];
      }

      const parent = Option.of(self);

      for (const name of keys(properties)) {
        const value = properties[name];

        if (value === false || value === null || value === undefined) {
          continue;
        }

        yield Attribute.of(
          None,
          None,
          name,
          value === true ? "" : `${value}`,
          parent
        );
      }
    },
    function*(self) {
      const parent = Option.of(self);

      for (const child of children) {
        if (Element.isElement(child)) {
          yield self.adopt(child);
        } else {
          yield Text.of(child, parent);
        }
      }
    }
  );
}

export namespace jsx {
  export namespace JSX {
    export interface IntrinsicElements {
      [tag: string]: {} | { readonly [attribute: string]: unknown };
    }

    export type Element = import("./node/element").Element;
  }
}
