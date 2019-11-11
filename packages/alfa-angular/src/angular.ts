/// <reference lib="dom" />

import { ComponentFixture } from "@angular/core/testing";
import { clone, NodeType } from "@siteimprove/alfa-dom";
import { Page } from "@siteimprove/alfa-web";

export namespace Angular {
  export type Type = ComponentFixture<unknown>;

  export function isType(value: unknown): value is Type {
    return value instanceof ComponentFixture;
  }

  export function asPage(value: Type): Page {
    const { nativeElement } = value;

    if (nativeElement instanceof Element) {
      return Page.of({
        document: {
          nodeType: NodeType.Document,
          styleSheets: [],
          childNodes: [clone(nativeElement)]
        }
      });
    }

    throw new Error("A native element must be available");
  }
}
