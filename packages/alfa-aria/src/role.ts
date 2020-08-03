import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hashable, Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as json from "@siteimprove/alfa-json";

import { Attribute } from "./attribute";
import { Feature } from "./feature";

import { Roles } from "./role/data";

import * as predicate from "./role/predicate";

export class Role<N extends Role.Name = Role.Name>
  implements Equatable, Hashable, Serializable {
  public static of<N extends Role.Name>(name: N): Role<N> {
    return new Role(name);
  }

  private readonly _name: N;

  private constructor(name: N) {
    this._name = name;
  }

  public get name(): N {
    return this._name;
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
    name: N
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
    name: N
  ): this is Role<Role.SubclassOf<N>> {
    return Role.of(name).isSuperclassOf(this._name);
  }

  /**
   * Check if this role either is, or is a subclass of, the role with the
   * specified name.
   */
  public is<N extends Role.Name>(
    name: N
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
    return Roles[this._name].name.from[method];
  }

  /**
   * Check if this role prohibits naming.
   */
  public isNameProhibited(): boolean {
    return Roles[this._name].name.prohibited;
  }

  /**
   * Check if this role has presentational children.
   */
  public hasPresentationalChildren(): boolean {
    return Roles[this._name].children.presentational;
  }

  /**
   * Check if this role requires the specified attribute.
   */
  public isAttributeRequired(name: Attribute.Name): boolean {
    const { inherited, attributes } = Roles[this._name];

    for (const found of attributes.required) {
      if (name === found) {
        return true;
      }
    }

    for (const parent of inherited) {
      if (Role.of(parent).isAttributeRequired(name)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if this role supports the specified attribute.
   */
  public isAttributeSupported(name: Attribute.Name): boolean {
    const { inherited, attributes } = Roles[this._name];

    for (const found of attributes.supported) {
      if (name === found) {
        return true;
      }
    }

    for (const parent of inherited) {
      if (Role.of(parent).isAttributeSupported(name)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all attributes supported by this role and its inherited roles.
   */
  public attributes(): Iterable<Attribute.Name> {
    const {
      inherited,
      attributes: { required, supported },
    } = Roles[this._name];

    const attributes = new Set([...required, ...supported]);

    for (const parent of inherited) {
      for (const attribute of Role.of(parent).attributes()) {
        attributes.add(attribute);
      }
    }

    return attributes;
  }

  /**
   * Get all attribute defaults specified by this role and its inherited roles.
   */
  public defaults(): Iterable<[Attribute.Name, string]> {
    const { inherited, attributes } = Roles[this._name];

    const defaults = new Map<Attribute.Name, string>(attributes.defaults);

    for (const parent of inherited) {
      for (const [attribute, value] of Role.of(parent).defaults()) {
        if (defaults.has(attribute)) {
          continue;
        }

        defaults.set(attribute, value);
      }
    }

    return defaults;
  }

  /**
   * Get the required parent of this role.
   */
  public *requiredParent(): Iterable<Role.Name> {
    yield* Roles[this._name].parent.required;
  }

  /**
   * Get the required children of this role.
   */
  public *requiredChildren(): Iterable<Iterable<Role.Name>> {
    yield* Roles[this._name].children.required;
  }

  public equals(value: unknown): value is this {
    return value instanceof Role && value._name === this._name;
  }

  public hash(hash: Hash): void {
    Hash.writeUint8(hash, Roles[this._name].index);
  }

  public toJSON(): Role.JSON {
    return {
      name: this._name,
    };
  }
}

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
  export type Inherited<N extends Name> = Members<Roles[N]["inherited"]>;

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
  export type NamedBy<N extends Name = Name> = keyof Roles[N]["name"]["from"];

  export namespace Attribute {
    /**
     * All required attributes for the specified role.
     */
    export type Required<N extends Name> =
      | Members<Roles[N]["attributes"]["required"]>
      | { [M in Inherited<N>]: Required<M> }[Inherited<N>];

    /**
     * All supported attributes for the specified role.
     */
    export type Supported<N extends Name> =
      | Members<Roles[N]["attributes"]["supported"]>
      | { [M in Inherited<N>]: Supported<M> }[Inherited<N>];
  }

  export function isRole<N extends Name>(
    value: unknown,
    name?: N
  ): value is Role<Name> {
    return value instanceof Role && (name === undefined || value.name === name);
  }

  /**
   * Get the roles assigned both explicitly and implicitly to an element.
   */
  export function from(element: Element): Branched<Sequence<Role>, Browser> {
    return (
      fromExplicit(element)
        .flatMap((explicit) =>
          fromImplicit(element).map((implicit) => explicit.concat(implicit))
        )

        // There may be an overlap between the explicit and implicit roles so
        // we filter out duplicates.
        .distinct()
    );
  }

  /**
   * Get the roles explicitly assigned to an element.
   */
  export function fromExplicit(
    element: Element
  ): Branched<Sequence<Role>, Browser> {
    const roles: Sequence<string> = element
      .attribute("role")
      .map((attribute) => attribute.tokens())
      .getOrElse(() => Sequence.empty());

    return (
      Branched.of<Sequence<string>, Browser>(
        roles.map((role) => role.toLowerCase())
      )

        // Firefox currently treats the `role` attribute as case-sensitive so it
        // is not lowercased.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1407167
        .branch(roles, ...Browser.query(["firefox"]))

        .map((roles) =>
          roles
            .filter(isName)
            .map(Role.of)

            // Abstract roles are only used for ontological purposes and are not
            // allowed to be used by authors; we therefore filter them out.
            .reject((role) => role.isAbstract())

            // The same role may be passed multiple times so we filter out
            // duplicates.
            .distinct()
        )
    );
  }

  /**
   * Get the roles implicitly assigned to an element.
   */
  export function fromImplicit(
    element: Element
  ): Branched<Sequence<Role>, Browser> {
    return Branched.of(
      element.namespace
        .flatMap((namespace) =>
          Feature.lookup(namespace, element.name).map((feature) =>
            Sequence.from(feature.role(element))
          )
        )
        .getOrElse(() => Sequence.empty())
    );
  }

  export const { hasName } = predicate;
}

type Members<T> = T extends Iterable<infer T> ? T : never;
