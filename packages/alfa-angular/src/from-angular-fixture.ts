/// <reference lib="dom" />

import { ComponentFixture } from "@angular/core/testing";
import * as dom from "@siteimprove/alfa-dom";
import { clone } from "@siteimprove/alfa-dom";

export function fromAngularFixture<T>(
  angularFixture: ComponentFixture<T>
): dom.Element {
  const { nativeElement } = angularFixture;

  if (nativeElement instanceof Element) {
    return clone(nativeElement);
  }

  throw new Error("A native element must be available");
}
