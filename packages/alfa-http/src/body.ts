import { Predicate } from "@siteimprove/alfa-predicate";

const { isObject } = Predicate;

/**
 * @see https://fetch.spec.whatwg.org/#body-mixin
 */
export interface Body {
  /**
   * @see https://fetch.spec.whatwg.org/#dom-body-body
   */
  readonly body: ArrayBuffer;
}

export namespace Body {
  export function isBody(value: unknown): value is Body {
    return isObject(value) && value.body instanceof ArrayBuffer;
  }
}
