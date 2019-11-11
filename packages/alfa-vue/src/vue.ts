/// <reference lib="dom" />
/// <reference types="cheerio" />

import { Cheerio } from "@siteimprove/alfa-cheerio";
import { clone, NodeType } from "@siteimprove/alfa-dom";
import { isObject } from "@siteimprove/alfa-guards";
import { Page } from "@siteimprove/alfa-web";
import { Wrapper } from "@vue/test-utils";
import V from "vue";

export namespace Vue {
  export type Type = Wrapper<V | null> | Cheerio.Type;

  export function isType(value: unknown): value is Type {
    return (
      (isObject(value) &&
        value.vm !== undefined &&
        value.element instanceof Element) ||
      Cheerio.isType(value)
    );
  }

  export function asPage(value: Type): Page {
    if (Cheerio.isType(value)) {
      return Cheerio.asPage(value);
    }

    return Page.of({
      document: {
        nodeType: NodeType.Document,
        styleSheets: [],
        childNodes: [clone(value.element)]
      }
    });
  }
}
