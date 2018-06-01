import { values, includes } from "@alfa/util";
import { Node, Element } from "@alfa/dom";
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
  inherits?: RoleAspect<Array<Role>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#scope
   */
  context?: Array<Role>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#mustContain
   */
  owned?: RoleAspect<Array<Role | [Role, Role]>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#requiredState
   */
  required?: Array<Attribute>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#supportedState
   */
  supported?: Array<Attribute>;
}>;

export type FeatureAspect<T> = T | ((element: Element, context: Node) => T);

export type RoleAspect<T> = T | ((element: Element, context: Node) => T);

export const AnyRole: Array<Role> = values(Roles);

export const NoRole: Array<Role> = [];

export const AnyRoleExcept: (...roles: Array<Role>) => Array<Role> = (
  ...roles
) => AnyRole.filter(role => includes(roles, role));

/**
 * @see https://www.w3.org/TR/html-aria/
 */
export type Feature = Readonly<{
  element: string;
  role?: FeatureAspect<Role>;
  allowedRoles: FeatureAspect<Array<Role> | typeof AnyRole | typeof NoRole>;
  allowedAttributes?: FeatureAspect<Array<Attribute>>;
}>;
