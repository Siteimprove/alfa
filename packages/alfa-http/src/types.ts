/**
 * @see https://fetch.spec.whatwg.org/#headers-class
 */
export interface Headers {
  /**
   * @see https://fetch.spec.whatwg.org/#dom-headers-get
   */
  [name: string]: string;
}

/**
 * @see https://fetch.spec.whatwg.org/#body-mixin
 */
export interface Body {
  /**
   * NB: As there's no way for us to represent the body mixin in a way that can
   * be serialized to JSON, we make the assumption that `body` will return the
   * result of `Body.text()` rather than a `ReadableStream`.
   *
   * @see https://fetch.spec.whatwg.org/#dom-body-body
   */
  readonly body: string;
}

/**
 * @see https://fetch.spec.whatwg.org/#response-class
 */
export interface Response extends Body {
  /**
   * @see https://fetch.spec.whatwg.org/#dom-response-url
   */
  readonly url: string;

  /**
   * @see https://fetch.spec.whatwg.org/#dom-response-status
   */
  readonly status: number;

  /**
   * @see https://fetch.spec.whatwg.org/#dom-response-headers
   */
  readonly headers: Headers;
}
