/**
 * @see https://tools.ietf.org/html/rfc3987#section-2.2
 */
const relativeIri = /^\/\//;

/**
 * @see https://www.w3.org/TR/json-ld-api/#dfn-relative-iri
 */
export function isRelativeIri(url: string): boolean {
  return relativeIri.test(url);
}
