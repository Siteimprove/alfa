/**
 * {@link https://infra.spec.whatwg.org/#namespaces}
 *
 * @public
 */
export enum Namespace {
  /**
   * {@link https://infra.spec.whatwg.org/#html-namespace}
   */
  HTML = "http://www.w3.org/1999/xhtml",

  /**
   * {@link https://infra.spec.whatwg.org/#mathml-namespace}
   */
  MathML = "http://www.w3.org/1998/Math/MathML",

  /**
   * {@link https://infra.spec.whatwg.org/#svg-namespace}
   */
  SVG = "http://www.w3.org/2000/svg",

  /**
   * {@link https://infra.spec.whatwg.org/#xlink-namespace}
   */
  XLink = "http://www.w3.org/1999/xlink",

  /**
   * {@link https://infra.spec.whatwg.org/#xml-namespace}
   */
  XML = "http://www.w3.org/XML/1998/namespace",

  /**
   * @remarks
   * The trailing slash is not a typo! For some reason it snuck its way into the
   * specification and whether or not it is strictly required is an awfully good
   * question.
   *
   * {@link https://infra.spec.whatwg.org/#xmlns-namespace}
   */
  XMLNS = "http://www.w3.org/2000/xmlns/",
}

/**
 * @public
 */
export namespace Namespace {
  export function isNamespace(value: string): value is Namespace {
    switch (value) {
      case Namespace.HTML:
      case Namespace.MathML:
      case Namespace.SVG:
      case Namespace.XLink:
      case Namespace.XML:
      case Namespace.XMLNS:
        return true;

      default:
        return false;
    }
  }
}
