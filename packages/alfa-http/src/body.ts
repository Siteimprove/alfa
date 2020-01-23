import { Predicate } from "@siteimprove/alfa-predicate";
import * as earl from "@siteimprove/alfa-earl";

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

  export interface EARL extends earl.EARL {
    "@context": {
      cnt: "http://www.w3.org/2011/content#";
    };
    "@type": ["cnt:Content", "cnt:ContentAsText"];
    "cnt:characterEncoding": "utf-8";
    "cnt:chars": string;
  }
}
