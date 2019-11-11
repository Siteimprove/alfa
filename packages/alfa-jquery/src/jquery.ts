/// <reference types="jquery" />

import { clone, NodeType } from "@siteimprove/alfa-dom";
import { isObject } from "@siteimprove/alfa-guards";
import { Page } from "@siteimprove/alfa-web";

export namespace JQuery {
  export type Type = JQuery;

  export function isType<T>(value: unknown): value is Type {
    return isObject(value) && "jquery" in value;
  }

  export function asPage<T>(value: Type): Page {
    return Page.of({
      document: {
        nodeType: NodeType.Document,
        styleSheets: [],
        childNodes: [clone(value.get(0))]
      }
    });
  }
}
