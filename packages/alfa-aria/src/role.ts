import { Branched } from "@siteimprove/alfa-branched";
import { Cache } from "@siteimprove/alfa-cache";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Set } from "@siteimprove/alfa-set";

import { Feature } from "./feature";
import { Attribute } from "./attribute";

const { some } = Iterable;
const { or } = Predicate;

export class Role<N extends string = string> implements Equatable {
  public static of<N extends string>(
    name: N,
    category: Role.Category,
    characteristics: Partial<Role.Characteristics> = {}
  ): Role<N> {
    return new Role(name, category, {
      requires: [],
      supports: [],
      inherits: [],
      owns: [],
      context: [],
      name: { from: [], required: false },
      presentational: false,
      implicits: [],

      ...characteristics
    });
  }

  public readonly name: N;
  public readonly category: Role.Category;
  public readonly characteristics: Role.Characteristics;

  private constructor(
    name: N,
    category: Role.Category,
    characteristics: Role.Characteristics
  ) {
    this.name = name;
    this.category = category;
    this.characteristics = characteristics;
  }

  public inheritsFrom(predicate: Predicate<Role>): boolean {
    return some(this.characteristics.inherits, name =>
      Role.lookup(name).some(
        or(predicate, role => role.inheritsFrom(predicate))
      )
    );
  }

  public required(): Iterable<Attribute> {
    return Set.from(
      Iterable.flatMap(this.characteristics.requires, name =>
        Attribute.lookup(name)
      )
    ).concat(
      Iterable.flatten(
        Iterable.flatMap(this.characteristics.requires, name =>
          Role.lookup(name).map(role => role.required())
        )
      )
    );
  }

  public isRequired(predicate: Predicate<Attribute>): boolean {
    return some(this.required(), predicate);
  }

  public supported(): Iterable<Attribute> {
    return Set.from(
      Iterable.flatMap(this.characteristics.supports, name =>
        Attribute.lookup(name)
      )
    ).concat(
      Iterable.flatten(
        Iterable.flatMap(this.characteristics.inherits, name =>
          Role.lookup(name).map(role => role.supported())
        )
      )
    );
  }

  public isSupported(predicate: Predicate<Attribute>): boolean {
    return some(this.supported(), predicate);
  }

  public isAllowed(predicate: Predicate<Attribute>): boolean {
    return this.isRequired(predicate) || this.isSupported(predicate);
  }

  public hasContext(predicate: Predicate<Role> = () => true): boolean {
    return (
      some(this.characteristics.context, name =>
        Role.lookup(name).some(predicate)
      ) || this.inheritsFrom(role => role.hasContext(predicate))
    );
  }

  public hasNameFrom(predicate: Predicate<"contents" | "author">): boolean {
    return some(this.characteristics.name.from, predicate);
  }

  public equals(value: unknown): value is this {
    return value instanceof Role && value.name === this.name;
  }

  public toJSON() {
    return {
      name: this.name,
      category: this.category,
      characteristics: this.characteristics
    };
  }
}

export namespace Role {
  /**
   * @see https://www.w3.org/TR/wai-aria/#roles_categorization
   */
  export const enum Category {
    /**
     * @see https://www.w3.org/TR/wai-aria/#abstract_roles
     */
    Abstract = "abstract",

    /**
     * @see https://www.w3.org/TR/wai-aria/#widget_roles
     */
    Widget = "widget",

    /**
     * @see https://www.w3.org/TR/wai-aria/#document_structure_roles
     */
    Structure = "structure",

    /**
     * @see https://www.w3.org/TR/wai-aria/#landmark_roles
     */
    Landmark = "landmark",

    /**
     * @see https://www.w3.org/TR/wai-aria/#live_region_roles
     */
    LiveRegion = "live-region",

    /**
     * @see https://www.w3.org/TR/wai-aria/#window_roles
     */
    Window = "window",

    /**
     * @see https://www.w3.org/TR/graphics-aria/
     */
    Graphic = "graphic"
  }

  export interface Characteristics {
    /**
     * @see https://www.w3.org/TR/wai-aria/#requiredState
     */
    readonly requires: Iterable<string>;

    /**
     * @see https://www.w3.org/TR/wai-aria/#supportedState
     */
    readonly supports: Iterable<string>;

    /**
     * @see https://www.w3.org/TR/wai-aria/#superclassrole
     */
    readonly inherits: Iterable<string>;

    /**
     * @see https://www.w3.org/TR/wai-aria/#mustContain
     */
    readonly owns: Iterable<
      string | readonly [string, string, ...Array<string>]
    >;

    /**
     * @see https://www.w3.org/TR/wai-aria/#scope
     */
    readonly context: Iterable<string>;

    /**
     * @see https://www.w3.org/TR/wai-aria/#namecalculation
     */
    readonly name: {
      readonly from: Readonly<Array<"contents" | "author">>;
      readonly required: boolean;
    };

    /**
     * @see https://www.w3.org/TR/wai-aria/#childrenArePresentational
     */
    readonly presentational: boolean;

    /**
     * @see https://www.w3.org/TR/wai-aria/#implictValueForRole
     */
    readonly implicits: Iterable<readonly [string, string]>;
  }

  const roles = Cache.empty<string, Role>();

  export function register<N extends string>(role: Role<N>): Role<N> {
    roles.set(role.name, role);
    return role;
  }

  export function lookup<N extends string>(name: N): Option<Role<N>> {
    return roles.get(name) as Option<Role<N>>;
  }

  /**
   * @see https://html.spec.whatwg.org/#attr-aria-role
   */
  export function from(
    element: Element,
    options: from.Options = {}
  ): Branched<Option<Role>, Browser> {
    const role = element.attribute("role").map(attr => attr.value.trim());

    return (
      Branched.of<Option<string>, Browser>(role.map(role => role.toLowerCase()))

        // Firefox currently treats the `role` attribute as case-sensitive so it
        // is not lowercased.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1407167
        .branch(role, ...Browser.query(["firefox"]))

        .map(role =>
          role
            .andThen(role => {
              if (options.explicit !== false) {
                for (const name of role.split(/\s+/)) {
                  const role = Role.lookup(name);

                  if (
                    role
                      .filter(role => role.category !== Role.Category.Abstract)
                      .isSome()
                  ) {
                    return role;
                  }
                }
              }

              return None;
            })
            .orElse(() => {
              if (options.implicit !== false) {
                return element.namespace.flatMap(namespace => {
                  const feature = Feature.lookup(namespace, element.name);

                  return feature.flatMap(feature =>
                    feature.role(element).flatMap(Role.lookup)
                  );
                });
              }

              return None;
            })
        )
    );
  }

  export namespace from {
    export interface Options {
      readonly explicit?: boolean;
      readonly implicit?: boolean;
    }
  }
}

import "./role/separator";

import "./role/abstract/command";
import "./role/abstract/composite";
import "./role/abstract/input";
import "./role/abstract/landmark";
import "./role/abstract/range";
import "./role/abstract/roletype";
import "./role/abstract/section";
import "./role/abstract/section-head";
import "./role/abstract/select";
import "./role/abstract/structure";
import "./role/abstract/widget";
import "./role/abstract/window";

import "./role/graphic/document";
import "./role/graphic/object";
import "./role/graphic/symbol";

import "./role/landmark/banner";
import "./role/landmark/complementary";
import "./role/landmark/content-info";
import "./role/landmark/form";
import "./role/landmark/main";
import "./role/landmark/navigation";
import "./role/landmark/region";
import "./role/landmark/search";

import "./role/live-region/alert";
import "./role/live-region/log";
import "./role/live-region/marquee";
import "./role/live-region/status";
import "./role/live-region/timer";

import "./role/structure/application";
import "./role/structure/article";
import "./role/structure/cell";
import "./role/structure/column-header";
import "./role/structure/definition";
import "./role/structure/directory";
import "./role/structure/document";
import "./role/structure/feed";
import "./role/structure/figure";
import "./role/structure/group";
import "./role/structure/heading";
import "./role/structure/img";
import "./role/structure/list";
import "./role/structure/list-item";
import "./role/structure/math";
import "./role/structure/none";
import "./role/structure/note";
import "./role/structure/presentation";
import "./role/structure/row";
import "./role/structure/row-group";
import "./role/structure/row-header";
import "./role/structure/table";
import "./role/structure/term";
import "./role/structure/toolbar";
import "./role/structure/tooltip";

import "./role/widget/button";
import "./role/widget/checkbox";
import "./role/widget/combobox";
import "./role/widget/grid";
import "./role/widget/grid-cell";
import "./role/widget/link";
import "./role/widget/list-box";
import "./role/widget/menu";
import "./role/widget/menu-bar";
import "./role/widget/menu-item";
import "./role/widget/menu-item-checkbox";
import "./role/widget/menu-item-radio";
import "./role/widget/option";
import "./role/widget/progress-bar";
import "./role/widget/radio";
import "./role/widget/radio-group";
import "./role/widget/scroll-bar";
import "./role/widget/search-box";
import "./role/widget/slider";
import "./role/widget/spin-button";
import "./role/widget/switch";
import "./role/widget/tab";
import "./role/widget/tab-list";
import "./role/widget/tab-panel";
import "./role/widget/text-box";
import "./role/widget/tree";
import "./role/widget/tree-grid";
import "./role/widget/tree-item";

import "./role/window/alert-dialog";
import "./role/window/dialog";
