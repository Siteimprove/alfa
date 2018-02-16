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
 * @see https://www.w3.org/TR/wai-aria/#dfn-attribute
 */
export type Attribute = Readonly<{
  name: string;
  type: ValueType;
  values?: Array<string>;
  deprecated?: boolean;
}>;

/**
 * @see https://www.w3.org/TR/wai-aria/#dfn-role
 */
export type Role = Readonly<{
  name: string;
  abstract?: boolean;
  label?: Readonly<{
    from: "author" | "contents" | ["author", "contents"];
    required?: boolean;
  }>;
  inherits?: Array<Role>;
  context?: Array<Role>;
  owned?: Array<Role>;
  required?: Array<Attribute>;
  supported?: Array<Attribute>;
  defaults?: Map<Attribute, string>;
}>;
