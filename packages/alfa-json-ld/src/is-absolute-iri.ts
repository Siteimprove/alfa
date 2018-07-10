/**
 * @see https://tools.ietf.org/html/rfc3987#section-2.2
 */
const absoluteIri = /^[a-z][a-z0-9+.-]*:\/\//;

/**
 * @see https://www.w3.org/TR/json-ld-api/#dfn-absolute-iri
 */
export function isAbsoluteIri(url: string): boolean {
  return absoluteIri.test(url);
}
