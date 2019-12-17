import { Predicate } from "@siteimprove/alfa-predicate";

const { isNumber, isObject, isString } = Predicate;

/**
 * @see https://fetch.spec.whatwg.org/#headers-class
 */
export interface Headers {
  /**
   * @see https://fetch.spec.whatwg.org/#dom-headers-get
   */
  [name: string]: string | undefined;
}

export namespace Headers {
  export function isHeaders(value: unknown): value is Headers {
    return isObject(value);
  }
}

/**
 * @see https://fetch.spec.whatwg.org/#request-class
 */
export interface Request {
  /**
   * @see https://fetch.spec.whatwg.org/#dom-request-method
   */
  readonly method: string;

  /**
   * @see https://fetch.spec.whatwg.org/#dom-request-url
   */
  readonly url: string;

  /**
   * @see https://fetch.spec.whatwg.org/#dom-request-headers
   */
  readonly headers: Headers;
}

export namespace Request {
  export function isRequest(value: unknown): value is Request {
    return (
      isObject(value) &&
      isString(value.method) &&
      isString(value.url) &&
      Headers.isHeaders(value.headers)
    );
  }
}

/**
 * @see https://fetch.spec.whatwg.org/#body-mixin
 */
export interface Body {
  /**
   * NB: As there's no way for us to represent the body mixin in a way that can
   * be serialized to JSON, we make the assumption that `body` will return the
   * result of `Body#arrayBuffer()` rather than a `ReadableStream`.
   *
   * @see https://fetch.spec.whatwg.org/#dom-body-body
   */
  readonly body: ArrayBuffer;
}

export namespace Body {
  export function isBody(value: unknown): value is Body {
    return isObject(value) && value.body instanceof ArrayBuffer;
  }
}

/**
 * @see https://fetch.spec.whatwg.org/#response-class
 */
export interface Response extends Body {
  /**
   * @see https://fetch.spec.whatwg.org/#dom-response-status
   */
  readonly status: number;

  /**
   * @see https://fetch.spec.whatwg.org/#dom-response-headers
   */
  readonly headers: Headers;
}

export namespace Response {
  export function isResponse(value: unknown): value is Response {
    return (
      isObject(value) &&
      isNumber(value.status) &&
      Headers.isHeaders(value.headers)
    );
  }
}
