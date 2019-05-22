import { ComponentFixture } from "@angular/core/testing";
import { Element } from "@siteimprove/alfa-dom";

export function fromAngularElement<T>(
  angularElement: ComponentFixture<T>
): Element {
  return angularElement.nativeElement as Element;
}
