import { None, Option } from "@siteimprove/alfa-option";

import { Namespace } from "./namespace";
import { Node } from "./node";
import { Attribute } from "./node/attribute";
import { Element } from "./node/element";
import { Text } from "./node/text";

const { keys } = Object;

export function jsx(
  name: string,
  attributes?: { [name: string]: unknown } | null,
  ...children: Array<Node.JSON | string>
): Element.JSON {
  const json = Element.of(Option.of(Namespace.HTML), None, name).toJSON();

  if (attributes !== null && attributes !== undefined) {
    for (const name of keys(attributes)) {
      const value = attributes[name];

      if (value === false || value === null || value === undefined) {
        continue;
      }

      json.attributes.push(
        Attribute.of(
          None,
          None,
          name,
          value === true ? "" : `${value}`
        ).toJSON()
      );
    }
  }

  for (const child of children) {
    json.children.push(
      typeof child === "string" ? Text.of(child).toJSON() : child
    );
  }

  return json;
}

export namespace jsx {
  export namespace JSX {
    export type Element = import("./node/element").Element.JSON;

    export interface IntrinsicElements {
      [tag: string]: {} | { readonly [attribute: string]: unknown };
    }
  }
}
