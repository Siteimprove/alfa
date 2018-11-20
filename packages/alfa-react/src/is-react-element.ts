import { isValidElement, ReactElement } from "react";

export function isReactElement<T>(input: unknown): input is ReactElement<T> {
  return input instanceof Object && isValidElement(input);
}
