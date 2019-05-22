import { ComponentFixture } from "@angular/core/testing";
import { hasKey, isObject } from "@siteimprove/alfa-util";

export function isAngularElement<T>(
  input: unknown
): input is ComponentFixture<T> {
  return (
    isObject(input) &&
    hasKey(input, "nativeElement") &&
    input.nativeElement instanceof Element
  );
}
