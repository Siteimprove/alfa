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
   * Check if this role is an instance of a role with the specified name.
   *
   * @remarks
   * This method looks up the inheritance chain of the role and
   */
  public is(name: Role.Name): boolean {
    if (this._name === name) {
      return true;
    }

    const { inherited } = Roles[this._name];

    for (const parent of inherited) {
      if (Role.of(parent).is(name)) {
        return true;
      }
    }

    return false;
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
    return this._name === "presentation" || this._name === "none";
  }

  /**
   * Check if this role is a superclass of another role.
   */
  public isSuperclassOf(role: Role.Name): boolean {
    const { inherited } = Roles[role];

    for (const parent of inherited) {
      if (parent === this._name || this.isSuperclassOf(parent)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if this role is a subclass of another role.
   */
  public isSubclassOf(role: Role.Name): boolean {
    const { inherited } = Roles[this._name];

    for (const parent of inherited) {
      if (parent === role || Role.of(parent).isSubclassOf(role)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if this role requires the specified attribute.
   */
  public isRequired(attribute: Attribute.Name): boolean {
    const { inherited, attributes } = Roles[this._name];

    for (const found of attributes.required) {
      if (attribute === found) {
        return true;
      }
    }

    for (const parent of inherited) {
      if (Role.of(parent).isRequired(attribute)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if this role supports the specified attribute.
   */
  public isSupported(attribute: Attribute.Name): boolean {
    const { inherited, attributes } = Roles[this._name];

    for (const found of attributes.supported) {
      if (attribute === found) {
        return true;
      }
    }

    for (const parent of inherited) {
      if (Role.of(parent).isSupported(attribute)) {
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

  /**
   * The names of all abstract roles.
   */
  export type Abstract = {
    [M in Name]: Roles[M]["abstract"] extends true ? M : never;
  }[Name];

  /**
   * The names of all non-abstract roles.
   */
  export type Concrete = Exclude<Name, Abstract>;

  /**
   * The names of all presentational roles.
   */
  export type Presentational = "presentation" | "none";

  type Members<T> = T extends Iterable<infer T> ? T : never;

  /**
   * Get the inherited roles for a given role name.
   */
  export type Inherited<N extends Name> = Members<Roles[N]["inherited"]>;

  export namespace Attribute {
    /**
     * Get all required attributes for a given role name.
     */
    export type Required<N extends Name> =
      | Members<Roles[N]["attributes"]["required"]>

      // Recursively get required attributes of inherited roles as well.
      | { [M in Role.Inherited<N>]: Required<M> }[Role.Inherited<N>];

    /**
     * Get all supported attributes for a given role name.
     */
    export type Supported<N extends Name> =
      | Members<Roles[N]["attributes"]["supported"]>

      // Recursively get supported attributes of inherited roles as well.
      | { [M in Role.Inherited<N>]: Supported<M> }[Role.Inherited<N>];
  }

  export function isName(value: string): value is Name {
    return value in Roles;
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
