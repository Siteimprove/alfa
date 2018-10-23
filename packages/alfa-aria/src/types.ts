import { Element, Node } from "@siteimprove/alfa-dom";
import { values } from "@siteimprove/alfa-util";
import * as Attributes from "./attributes";
import * as Roles from "./roles";

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

export type Aspect<T> = (element: Element, context: Node) => T;

/**
 * @see https://www.w3.org/TR/wai-aria/#roles_categorization
 */
export const enum Category {
  /**
   * @see https://www.w3.org/TR/wai-aria/#abstract_roles
   */
  Abstract,

  /**
   * @see https://www.w3.org/TR/wai-aria/#widget_roles
   */
  Widget,

  /**
   * @see https://www.w3.org/TR/wai-aria/#document_structure_roles
   */
  Structure,

  /**
   * @see https://www.w3.org/TR/wai-aria/#landmark_roles
   */
  Landmark,

  /**
   * @see https://www.w3.org/TR/wai-aria/#live_region_roles
   */
  LiveRegion,

  /**
   * @see https://www.w3.org/TR/wai-aria/#window_roles
   */
  Window
}

/**
 * @see https://www.w3.org/TR/wai-aria/#dfn-role
 */
export type Role = Readonly<{
  name: string;
  category: Category | Aspect<Category>;

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
  context?: Aspect<Array<Role>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#mustContain
   */
  owned?: Aspect<Array<Role | [Role, Role]>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#requiredState
   */
  required?: Aspect<Array<Attribute>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#supportedState
   */
  supported?: Aspect<Array<Attribute>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#implictValueForRole
   */
  implicits?: Aspect<Array<[Attribute, string]>>;
}>;

/**
 * @internal
 */
export const Any: <T extends typeof Roles | typeof Attributes>(
  type: T
) => Array<T[keyof T]> = values;

/**
 * @internal
 */
export const Except: <T extends typeof Roles | typeof Attributes>(
  type: T,
  exclude: Array<T[keyof T]>
) => Array<T[keyof T]> = (types, exclude) => {
  const filter = new Set(exclude);
  return Any(types).filter(type => !filter.has(type));
};

/**
 * @internal
 */
export const None: <T extends typeof Roles | typeof Attributes>(
  type: T
) => Array<T[keyof T]> = () => [];

/**
 * @see https://www.w3.org/TR/html-aria/
 */
export type Feature = Readonly<{
  element: string;
  role?: Aspect<Role | null>;
  allowedRoles: Aspect<Array<Role>>;
  allowedAttributes?: Aspect<Array<Attribute>>;
  obsolete?: true;
}>;
