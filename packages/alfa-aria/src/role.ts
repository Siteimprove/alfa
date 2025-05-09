import { Array } from "@siteimprove/alfa-array";
import { Element } from "@siteimprove/alfa-dom";
import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Hashable, Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";

import type * as json from "@siteimprove/alfa-json";

import type { Attribute } from "./attribute.js";
import { Feature } from "./feature.js";

import { Roles } from "./role/data.js";

import * as predicate from "./role/predicate.js";

const { and, not, nor } = Predicate;

let roles = Map.empty<Role.Name, Role>();

/**
 * @public
 */
export class Role<N extends Role.Name = Role.Name>
  implements Equatable, Hashable, Serializable
{
  public static of<N extends Role.Name>(name: N): Role<N> {
    return roles.get(name).getOrElse(() => {
      // The "as const" building of Roles makes TS give it a very
      // rigid type, and we need to manually help it to correctly merge the
      // Attribute.Name keys into a single union type. As of TS 4.8.2, removing
      // the type guard, or trying to destructure Roles[name] in one go, breaks.
      const attributes: ReadonlyArray<
        Readonly<
          [Attribute.Name, Readonly<{ required: boolean; prohibited: boolean }>]
        >
      > = Roles[name].attributes;
      const inherited = Roles[name].inherited;

      const supportedAttributes = Set.from(
        attributes.map(([attribute]) => attribute),
      ).concat(
        inherited.flatMap((parent) => Role.of(parent).supportedAttributes),
      );

      const requiredAttributes = Set.from(
        Array.collect(attributes, ([attribute, { required }]) =>
          required ? Option.of(attribute) : None,
        ),
      ).concat(
        inherited.flatMap((parent) => Role.of(parent).requiredAttributes),
      );

      const prohibitedAttributes = Set.from(
        Array.collect(attributes, ([attribute, { prohibited }]) =>
          prohibited ? Option.of(attribute) : None,
        ),
      ).concat(
        inherited.flatMap((parent) => Role.of(parent).prohibitedAttributes),
      );

      const role = new Role<N>(
        name,
        [...supportedAttributes],
        [...requiredAttributes],
        [...prohibitedAttributes],
      );
      roles = roles.set(name, role);

      return role;
    }) as Role<N>;
  }

  private readonly _name: N;
  private readonly _supportedAttributes: ReadonlyArray<Attribute.Name>;
  private readonly _requiredAttributes: ReadonlyArray<Attribute.Name>;
  private readonly _prohibitedAttributes: ReadonlyArray<Attribute.Name>;

  protected constructor(
    name: N,
    supportedAttributes: Array<Attribute.Name>,
    requiredAttributes: Array<Attribute.Name>,
    prohibitedAttributes: Array<Attribute.Name>,
  ) {
    this._name = name;
    this._supportedAttributes = supportedAttributes;
    this._requiredAttributes = requiredAttributes;
    this._prohibitedAttributes = prohibitedAttributes;
  }

  public get name(): N {
    return this._name;
  }

  /**
   * Get all attributes supported by this role and its inherited (ancestors) roles.
   */
  public get supportedAttributes(): ReadonlyArray<Attribute.Name> {
    return this._supportedAttributes;
  }

  /**
   * Get all attributes required by this role and its inherited (ancestors) roles.
   */
  public get requiredAttributes(): ReadonlyArray<Attribute.Name> {
    return this._requiredAttributes;
  }

  /**
   * Get all attributes prohibited on this role and its inherited (ancestors) roles.
   */
  public get prohibitedAttributes(): ReadonlyArray<Attribute.Name> {
    return this._prohibitedAttributes;
  }

  /**
   * Get the required parent of this role.
   */
  public get requiredParent(): ReadonlyArray<ReadonlyArray<Role.Name>> {
    return Roles[this._name].parent.required;
  }

  /**
   * Get the required children of this role.
   */
  public get requiredChildren(): ReadonlyArray<ReadonlyArray<Role.Name>> {
    return Roles[this._name].children.required;
  }

  /**
   * Check if this role has the specified name.
   */
  public hasName<N extends Role.Name>(name: N): this is Role<N> {
    return this._name === (name as Role.Name);
  }

  /**
   * Check if this role is a superclass of the role with the specified name.
   */
  public isSuperclassOf<N extends Role.Name>(
    name: N,
  ): this is Role<Role.SuperclassOf<N>> {
    const { inherited } = Roles[name];

    for (const parent of inherited) {
      if (parent === this._name || this.isSuperclassOf(parent)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if this role is a subclass of the role with the specified name.
   */
  public isSubclassOf<N extends Role.Name>(
    name: N,
  ): this is Role<Role.SubclassOf<N>> {
    return Role.of(name).isSuperclassOf(this._name);
  }

  /**
   * Check if this role either is, or is a subclass of, the role with the
   * specified name.
   */
  public is<N extends Role.Name>(
    name: N,
  ): this is Role<N | Role.SubclassOf<N>> {
    return this.hasName(name) || this.isSubclassOf(name);
  }

  /**
   * Check if this role is abstract.
   */
  public isAbstract(): this is Role<Role.Abstract> {
    return Roles[this._name].abstract;
  }

  /**
   * Check if this role is non-abstract.
   */
  public isConcrete(): this is Role<Role.Concrete> {
    return !this.isAbstract();
  }

  /**
   * Check if this role is presentational.
   */
  public isPresentational(): this is Role<Role.Presentational> {
    return this.hasName("presentation") || this.hasName("none");
  }

  /**
   * Check if this role is a widget.
   */
  public isWidget(): this is Role<Role.Widget> {
    return this.is("widget");
  }

  /**
   * Check if this role is a landmark.
   */
  public isLandmark(): this is Role<Role.Landmark> {
    return this.is("landmark");
  }

  /**
   * Check if this role supports naming by the specified method.
   */
  public isNamedBy(method: Role.NamedBy): boolean {
    for (const found of Roles[this._name].name.from) {
      if (found === method) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if this role prohibits naming.
   */
  public isNameProhibited(): boolean {
    return Roles[this._name].name.prohibited;
  }

  /**
   * Check if this role has a required parent.
   */
  public hasRequiredParent(): boolean {
    return Roles[this._name].parent.required.length > 0;
  }

  /**
   * Check if this role has presentational children.
   */
  public hasPresentationalChildren(): boolean {
    return Roles[this._name].children.presentational;
  }

  /**
   * Check if this role has required children.
   */
  public hasRequiredChildren(): boolean {
    return Roles[this._name].children.required.length > 0;
  }

  /**
   * Check if this role supports the specified attribute.
   */
  public isAttributeSupported(name: Attribute.Name): boolean {
    return this._supportedAttributes.includes(name);
  }

  /**
   * Check if this role requires the specified attribute.
   */
  public isAttributeRequired(name: Attribute.Name): boolean {
    return this._requiredAttributes.includes(name);
  }

  /**
   * Check if this role prohibits the specified attribute.
   */
  public isAttributeProhibited(name: Attribute.Name): boolean {
    return this._prohibitedAttributes.includes(name);
  }

  /**
   * Get the implicit value of the specified attribute, if any.
   */
  public implicitAttributeValue(name: Attribute.Name): Option<string> {
    const { inherited, attributes } = Roles[this._name];

    for (const [found, { value }] of attributes) {
      if (name === found && value !== null) {
        return Option.from(value);
      }
    }

    for (const parent of inherited) {
      for (const value of Role.of(parent).implicitAttributeValue(name)) {
        return Option.of(value);
      }
    }

    return None;
  }

  public equals(value: unknown): value is this {
    return value instanceof Role && value._name === this._name;
  }

  public hash(hash: Hash): void {
    hash.writeString(this._name);
  }

  public toJSON(): Role.JSON {
    return {
      name: this._name,
    };
  }
}

/**
 * @public
 */
export namespace Role {
  export interface JSON {
    [key: string]: json.JSON;
    name: Name;
  }

  export type Name = keyof Roles;

  export function isName(value: string): value is Name {
    return value in Roles;
  }

  /**
   * The names of all abstract roles.
   */
  export type Abstract = {
    [N in Name]: Roles[N]["abstract"] extends true ? N : never;
  }[Name];

  /**
   * The names of all non-abstract roles.
   */
  export type Concrete = Exclude<Name, Abstract>;

  /**
   * The names of all presentational roles.
   *
   * @remarks
   * In WAI-ARIA, the role `none` is defined to be synonymous with the role
   * `presentation`. We therefore refer collectively to the two roles as the
   * presentational roles.
   */
  export type Presentational = "presentation" | "none";

  /**
   * The names of all widget roles.
   */
  export type Widget = SubclassOf<"widget">;

  /**
   * The names of all landmark roles.
   */
  export type Landmark = SubclassOf<"landmark">;

  /**
   * The inherited roles for the specified role.
   */
  export type Inherited<N extends Name> = N extends "roletype" | "none"
    ? never
    : Members<Roles[N]["inherited"]>;

  /**
   * All roles that are subclasses of the specified role.
   */
  export type SubclassOf<N extends Name> = {
    [M in Name]: N extends SuperclassOf<M> ? M : never;
  }[Name];

  /**
   * All roles that are superclasses of the specified role.
   *
   * @remarks
   * The super roles `roletype` and `none` act as base conditions of the
   * recursive type construction in order to avoid the TypeScript compiler
   * infinitely recursing while instantiating the type.
   */
  export type SuperclassOf<N extends Name> = N extends "roletype" | "none"
    ? never
    : Inherited<N> | { [M in Inherited<N>]: SuperclassOf<M> }[Inherited<N>];

  /**
   * The methods by which the element assigned to the specified role may receive
   * its name.
   */
  export type NamedBy<N extends Name = Name> = Members<
    Roles[N]["name"]["from"]
  >;

  export function isRole<N extends Name>(
    value: unknown,
    name?: N,
  ): value is Role<Name> {
    return value instanceof Role && (name === undefined || value.name === name);
  }

  /**
   * Get the role assigned either explicitly or implicitly to an element, if
   * any.
   */
  export function from(element: Element): Option<Role> {
    return fromExplicit(element).orElse(() => fromImplicit(element));
  }

  /**
   * Get the role explicitly assigned to an element, if any.
   */
  export function fromExplicit(element: Element): Option<Role> {
    const roles: Sequence<string> = element
      .attribute("role")
      .map((attribute) => attribute.tokens())
      .getOrElse(() => Sequence.empty());

    return (
      roles
        .map((role) => role.toLowerCase())
        .filter(isName)
        .map(Role.of)

        // Abstract roles are only used for ontological purposes and are not
        // allowed to be used by authors; we therefore filter them out.
        .reject((role) => role.isAbstract())

        // If the element is not allowed to be presentational, reject all
        // presentational roles.
        .reject((role) =>
          isAllowedPresentational(element) ? false : role.isPresentational(),
        )

        .first()
    );
  }

  /**
   * Get the role implicitly assigned to an element, if any.
   */
  export function fromImplicit(element: Element): Option<Role> {
    return element.namespace.flatMap((namespace) =>
      Feature.from(namespace, element.name).flatMap((feature) =>
        Sequence.from(feature.role(element))

          // If the element is not allowed to be presentational, reject all
          // presentational roles.
          .reject((role) =>
            isAllowedPresentational(element) ? false : role.isPresentational(),
          )

          .first(),
      ),
    );
  }

  export const { hasName } = predicate;
}

type Members<T> = T extends Iterable<infer T> ? T : never;

/**
 * Check if an element has one or more global `aria-*` attributes.
 */
const hasGlobalAttributes: Predicate<Element> = (element) =>
  Iterable.some(Role.of("roletype").supportedAttributes, (attribute) =>
    element.attribute(attribute).isSome(),
  );

/**
 * Check if an element is potentially focusable, not accounting for whether or
 * not the element is rendered.
 */
const isPotentiallyFocusable: Predicate<Element> = and(
  Element.hasTabIndex(),
  not(Element.isActuallyDisabled),
);

/**
 * Check if an element is allowed to be assigned a presentational role.
 */
const isAllowedPresentational: Predicate<Element> = nor(
  hasGlobalAttributes,
  isPotentiallyFocusable,
);
