import { values } from "@siteimprove/alfa-util";
import { Element, Node } from "@siteimprove/alfa-dom";
import * as Roles from "./roles";
import * as Attributes from "./attributes";

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
  deprecated?: true;
}>;

/**
 * @see https://www.w3.org/TR/wai-aria/#dfn-role
 */
export type Role = Readonly<{
  name: string;

  /**
   * @see https://www.w3.org/TR/wai-aria/#isAbstract
   */
  abstract?: true;

  /**
   * @see https://www.w3.org/TR/wai-aria/#namecalculation
   */
  label?: Readonly<{
    from: Array<"contents" | "author">;
    required?: true;
  }>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#superclassrole
   */
  inherits?: Aspect<Array<Role>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#scope
   */
  context?: Array<Role>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#mustContain
   */
  owned?: Aspect<Array<Role | [Role, Role]>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#requiredState
   */
  required?: Array<Attribute>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#supportedState
   */
  supported?: Array<Attribute>;
}>;

export type Aspect<T> = T | ((element: Element, context: Node) => T);

export const Any: <T extends typeof Roles | typeof Attributes>(
  type: T
) => Array<T[keyof T]> = types => values(types);

export const Except: <T extends typeof Roles | typeof Attributes>(
  type: T,
  exclude: Array<T[keyof T]>
) => Array<T[keyof T]> = (types, exclude) =>
  Any(types).filter(type => exclude.includes(type));

export const None: Array<any> = [];

/**
 * @see https://www.w3.org/TR/html-aria/
 */
export type Feature = Readonly<{
  element: string;
  role?: Aspect<Role>;
  allowedRoles: Aspect<Array<Role>>;
  allowedAttributes?: Aspect<Array<Attribute>>;
  obsolete?: true;
}>;
