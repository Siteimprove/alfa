import {
  Dictionary,
  Keyword,
  List,
  ListObject,
  Scalar,
  ValueObject,
} from "./types";

const { isArray } = Array;

/**
 * @public
 */
export function isKeyword(key: string): key is Keyword {
  switch (key) {
    case "@context":
    case "@id":
    case "@value":
    case "@language":
    case "@type":
    case "@container":
    case "@list":
    case "@set":
    case "@reverse":
    case "@index":
    case "@base":
    case "@vocab":
    case "@graph":
      return true;
    default:
      return false;
  }
}

/**
 * @public
 */
export function isScalar(
  element: Scalar | List | Dictionary | null
): element is Scalar {
  switch (typeof element) {
    case "string":
    case "number":
    case "boolean":
      return true;
    default:
      return false;
  }
}

/**
 * @public
 */
export function isList(
  element: Scalar | List | Dictionary | null
): element is List {
  return element !== null && isArray(element);
}

/**
 * @public
 */
export function isDictionary(
  element: Scalar | List | Dictionary | null
): element is Dictionary {
  return element !== null && !isList(element) && typeof element === "object";
}

/**
 * @public
 */
export function isListObject(
  element: Scalar | List | Dictionary | null
): element is ListObject {
  return isDictionary(element) && element["@list"] !== undefined;
}

/**
 * @public
 */
export function isValueObject(
  element: Scalar | List | Dictionary | null
): element is ValueObject {
  return isDictionary(element) && element["@value"] !== undefined;
}
