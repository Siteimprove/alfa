import { ComponentFixture } from "@angular/core/testing";

export function isAngularFixture<T>(
  input: unknown
): input is ComponentFixture<T> {
  return input instanceof ComponentFixture;
}
