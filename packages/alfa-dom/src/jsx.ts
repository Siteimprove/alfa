import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Slice } from "@siteimprove/alfa-slice";

import * as css from "@siteimprove/alfa-css";

import { Namespace } from "./namespace";
import { Node } from "./node";
import { Attribute } from "./node/attribute";
import { Element } from "./node/element";
import { Text } from "./node/text";
import { Block } from "./style/block";
import { Declaration } from "./style/declaration";

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

    json.style = Option.from(
      json.attributes.find(attribute => attribute.name === "style")
    )
      .flatMap(attribute =>
        css.Declaration.parseList(Slice.of([...css.Lexer.lex(attribute.value)]))
          .map(result => result[1])
          .map(declarations =>
            Iterable.map(declarations, declaration =>
              Declaration.of(
                declaration.name,
                declaration.value.join(""),
                declaration.important
              )
            )
          )
          .ok()
      )
      .map(declarations => Block.of(declarations).toJSON())
      .getOr(null);
  }

  for (const child of children) {
    json.children.push(
      typeof child === "string" ? Text.of(child).toJSON() : child
    );
  }

  switch (json.name) {
    case "svg":
      adjustNamespace(json, Namespace.SVG);
      break;

    case "math":
      adjustNamespace(json, Namespace.MathML);
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

function adjustNamespace(element: Element.JSON, namespace: Namespace): void {
  element.namespace = namespace;

  for (const child of element.children) {
    if (child.type === "element") {
      adjustNamespace(child as Element.JSON, namespace);
    }
  }
}
