/**
 * @see https://infra.spec.whatwg.org/#namespaces
 */
export const enum Namespace {
  /**
   * @see https://infra.spec.whatwg.org/#html-namespace
   */
  HTML = "http://www.w3.org/1999/xhtml",

  /**
   * @see https://infra.spec.whatwg.org/#mathml-namespace
   */
  MathML = "http://www.w3.org/1998/Math/MathML",

  /**
   * @see https://infra.spec.whatwg.org/#svg-namespace
   */
  SVG = "http://www.w3.org/2000/svg",

  /**
   * @see https://infra.spec.whatwg.org/#xlink-namespace
   */
  XLink = "http://www.w3.org/1999/xlink",

  /**
   * @see https://infra.spec.whatwg.org/#xml-namespace
   */
  XML = "http://www.w3.org/XML/1998/namespace",

  /**
   * NB: The trailing slash is not a typo! For some reason it snuck its way into
   * the specification and whether or not it is strictly required is an awfully
   * good question.
   *
   * @see https://infra.spec.whatwg.org/#xmlns-namespace
   */
  XMLNS = "http://www.w3.org/2000/xmlns/"
}
