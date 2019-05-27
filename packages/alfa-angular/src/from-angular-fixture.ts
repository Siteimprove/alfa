import { ComponentFixture } from "@angular/core/testing";
import * as dom from "@siteimprove/alfa-dom";

export function fromAngularFixture<T>(
  angularFixture: ComponentFixture<T>
): dom.Element {
  const { nativeElement } = angularFixture;

  if (nativeElement instanceof Element) {
    return nativeElement.cloneNode(true) as Element;
  }

  throw new Error("A native element must be available");
}
