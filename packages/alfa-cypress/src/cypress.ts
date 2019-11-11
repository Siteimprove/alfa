/// <reference lib="dom" />

import { clone, NodeType } from "@siteimprove/alfa-dom";
import { JQuery } from "@siteimprove/alfa-jquery";
import { Page } from "@siteimprove/alfa-web";

export namespace Cypress {
  export type Type = Node | JQuery.Type;

  export function isType(value: unknown): value is Type {
    return value instanceof Node || JQuery.isType(value);
  }

  export function asPage(value: Type): Page {
    if (JQuery.isType(value)) {
      return JQuery.asPage(value);
    }

    return Page.of({
      document: {
        nodeType: NodeType.Document,
        styleSheets: [],
        childNodes: [clone(value)]
      }
    });
  }
}
