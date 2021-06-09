import { Refinement } from "@siteimprove/alfa-refinement";

import * as earl from "@siteimprove/alfa-earl";

const { isObject } = Refinement;

/**
 * {@link https://fetch.spec.whatwg.org/#body-mixin}
 *
 * @public
 */
export interface Body {
  /**
   * {@link https://fetch.spec.whatwg.org/#dom-body-body}
   */
  readonly body: ArrayBuffer;
}

/**
 * @public
 */
export namespace Body {
  export interface EARL extends earl.EARL {
    "@context": {
      cnt: "http://www.w3.org/2011/content#";
    };
    "@type": ["cnt:Content", "cnt:ContentAsText"];
    "cnt:characterEncoding": "utf-8";
    "cnt:chars": string;
  }

  export function isBody(value: unknown): value is Body {
    return isObject(value) && value.body instanceof ArrayBuffer;
  }
}
