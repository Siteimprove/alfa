export type ValueType =
  /**
   * @see https://www.w3.org/TR/wai-aria/#valuetype_true-false
   */
  | "true-false"

  /**
   * @see https://www.w3.org/TR/wai-aria/#valuetype_true-false-undefined
   */
  | "true-false-undefined"

  /**
   * @see https://www.w3.org/TR/wai-aria/#valuetype_tristate
   */
  | "tristate"

  /**
   * @see https://www.w3.org/TR/wai-aria/#valuetype_idref
   */
  | "id-reference"

  /**
   * @see https://www.w3.org/TR/wai-aria/#valuetype_idref_list
   */
  | "id-reference-list"

  /**
   * @see https://www.w3.org/TR/wai-aria/#valuetype_integer
   */
  | "integer"

  /**
   * @see https://www.w3.org/TR/wai-aria/#valuetype_number
   */
  | "number"

  /**
   * @see https://www.w3.org/TR/wai-aria/#valuetype_string
   */
  | "string"

  /**
   * @see https://www.w3.org/TR/wai-aria/#valuetype_token
   */
  | "token"

  /**
   * @see https://www.w3.org/TR/wai-aria/#valuetype_token_list
   */
  | "token-list"

  /**
   * @see https://www.w3.org/TR/wai-aria/#valuetype_uri
   */
  | "uri";

/**
 * @see https://www.w3.org/TR/wai-aria/#dfn-state
 */
export type State = Readonly<{
  name: string;
  type: ValueType;
  values?: Array<string>;
}>;

/**
 * @see https://www.w3.org/TR/wai-aria/#dfn-property
 */
export type Property = Readonly<{
  name: string;
  type: ValueType;
  values?: Array<string>;
}>;

/**
 * @see https://www.w3.org/TR/wai-aria/#dfn-attribute
 */
export type Attribute = State | Property;

/**
 * @see https://www.w3.org/TR/wai-aria/#dfn-role
 */
export type Role = Readonly<{
  abstract?: boolean;
  inherits?: Array<Role>;
  nameFrom?: "author" | "contents";
  nameRequired?: boolean;
  requiredAttributes?: Array<Attribute>;
  supportedAttributes?: Array<Attribute>;
  implicitValues?: Map<Attribute, string>;
}>;
