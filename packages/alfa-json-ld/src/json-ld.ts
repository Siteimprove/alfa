import { JSON } from "@siteimprove/alfa-json";

/**
 * {@link https://www.w3.org/TR/json-ld/#dfn-keyword}
 *
 * @public
 */
export type Keyword =
  | "@base"
  | "@container"
  | "@context"
  | "@direction"
  | "@graph"
  | "@id"
  | "@import"
  | "@included"
  | "@index"
  | "@json"
  | "@language"
  | "@list"
  | "@nest"
  | "@none"
  | "@prefix"
  | "@propagate"
  | "@protected"
  | "@reverse"
  | "@set"
  | "@type"
  | "@value"
  | "@version"
  | "@vocab";

/**
 * @public
 */
export namespace Keyword {
  export function isKeyword(key: string): key is Keyword {
    switch (key) {
      case "@base":
      case "@container":
      case "@context":
      case "@direction":
      case "@graph":
      case "@id":
      case "@import":
      case "@included":
      case "@index":
      case "@json":
      case "@language":
      case "@list":
      case "@nest":
      case "@none":
      case "@prefix":
      case "@propagate":
      case "@protected":
      case "@reverse":
      case "@set":
      case "@type":
      case "@value":
      case "@version":
      case "@vocab":
        return true;

      default:
        return false;
    }
  }
}

/**
 * {@link https://www.w3.org/TR/json-ld/#dfn-context-definition}
 *
 * @public
 */
export interface Context extends JSON.Object {
  "@version"?: 1.1;
  "@base"?: string;
}

/**
 * {@link https://www.w3.org/TR/json-ld/#dfn-json-ld-document}
 *
 * @public
 */
export interface Document extends JSON.Object {
  "@context"?: Context;
}
