import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";

import * as Attributes from "./attributes";
import * as Roles from "./roles";

const { keys } = Object;

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
export interface Attribute {
  readonly name: string;
  readonly type: ValueType;
  readonly values?: Iterable<string>;
  readonly deprecated?: true;
}

export type Aspect<T> = (element: Element, context: Node, device: Device) => T;

/**
 * @see https://www.w3.org/TR/wai-aria/#roles_categorization
 */
export const enum Category {
  /**
   * @see https://www.w3.org/TR/wai-aria/#abstract_roles
   */
  Abstract,

  /**
   * @see https://www.w3.org/TR/graphics-aria/
   */
  Graphics,

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
export interface Role {
  readonly name: string;
  readonly category: Category | Aspect<Category>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#namecalculation
   */
  readonly label?: {
    readonly from: Iterable<"contents" | "author">;
    readonly required?: true;
  };

  /**
   * @see https://www.w3.org/TR/wai-aria/#superclassrole
   */
  readonly inherits?: Aspect<Iterable<Role>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#scope
   */
  readonly context?: Aspect<Iterable<Role>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#mustContain
   */
  readonly owned?: Aspect<Iterable<Role | [Role, Role]>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#requiredState
   */
  readonly required?: Aspect<Iterable<Attribute>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#supportedState
   */
  readonly supported?: Aspect<Iterable<Attribute>>;

  /**
   * @see https://www.w3.org/TR/wai-aria/#implictValueForRole
   */
  readonly implicits?: Aspect<Iterable<[Attribute, string]>>;
}

/**
 * @internal
 */
export const Any = <T extends typeof Roles | typeof Attributes>(
  types: T
): Array<T[keyof T]> => {
  const result: Array<T[keyof T]> = [];

  for (const key of keys(types)) {
    result.push(types[key as keyof T]);
  }

  return result;
};

/**
 * @internal
 */
export const Except = <T extends typeof Roles | typeof Attributes>(
  types: T,
  exclude: Array<T[keyof T]>
): Array<T[keyof T]> => {
  const filter = new Set(exclude);
  return Any(types).filter(type => !filter.has(type));
};

/**
 * @internal
 */
export const None = <T extends typeof Roles | typeof Attributes>(
  type: T
): Array<T[keyof T]> => [];

/**
 * @see https://www.w3.org/TR/html-aria/
 */
export interface Feature {
  readonly element: string;
  readonly role?: Aspect<Role | null>;
  readonly allowedRoles: Aspect<Iterable<Role>>;
  readonly allowedAttributes?: Aspect<Iterable<Attribute>>;
  readonly obsolete?: true;
}
