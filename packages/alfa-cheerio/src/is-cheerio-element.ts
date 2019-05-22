import { CheerioElement } from "./types";

export function isCheerioElement<T>(input: unknown): input is CheerioElement {
  return input instanceof CheerioElement;
}
