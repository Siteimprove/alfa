import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

export class Language implements Equatable, Serializable {
  public static of(
    primary: Language.Primary,
    extended: Option<Language.Extended> = None,
    script: Option<Language.Script> = None,
    region: Option<Language.Region> = None,
    variants: Array<Language.Variant> = []
  ): Language {
    return new Language(primary, extended, script, region, variants);
  }

  private readonly _primary: Language.Primary;
  private readonly _extended: Option<Language.Extended>;
  private readonly _script: Option<Language.Script>;
  private readonly _region: Option<Language.Region>;
  private readonly _variants: Array<Language.Variant>;

  constructor(
    primary: Language.Primary,
    extended: Option<Language.Extended>,
    script: Option<Language.Script>,
    region: Option<Language.Region>,
    variants: Array<Language.Variant>
  ) {
    this._primary = primary;
    this._extended = extended;
    this._script = script;
    this._region = region;
    this._variants = variants;
  }

  public get primary(): Language.Primary {
    return this._primary;
  }

  public get extended(): Option<Language.Extended> {
    return this._extended;
  }

  public get script(): Option<Language.Script> {
    return this._script;
  }

  public get region(): Option<Language.Region> {
    return this._region;
  }

  public get variants(): Iterable<Language.Variant> {
    return this._variants;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Language &&
      value._primary.equals(this._primary) &&
      value._extended.equals(this._extended) &&
      value._script.equals(this._script) &&
      value._region.equals(this._region) &&
      value._variants.length === this._variants.length &&
      value._variants.every((variant, i) => variant.equals(this._variants[i]))
    );
  }

  public toJSON(): Language.JSON {
    return {
      type: "language",
      primary: this._primary.toJSON(),
      extended: this._extended.map(extended => extended.toJSON()).getOr(null),
      script: this._script.map(script => script.toJSON()).getOr(null),
      region: this._region.map(region => region.toJSON()).getOr(null),
      variants: this._variants.map(variant => variant.toJSON())
    };
  }

  public toString(): string {
    return [
      this._primary,
      ...this._extended,
      ...this._script,
      ...this._region,
      ...this._variants
    ].join("-");
  }
}

export namespace Language {
  export interface JSON {
    [key: string]: json.JSON;
    type: "language";
    primary: Primary.JSON;
    extended: Extended.JSON | null;
    script: Script.JSON | null;
    region: Region.JSON | null;
    variants: Array<Variant.JSON>;
  }

  export type Scope =
    | "macrolanguage"
    | "collection"
    | "special"
    | "private-use";

  /**
   * @see https://tools.ietf.org/html/bcp47#section-3.1.2
   */
  export abstract class Subtag implements Equatable, Serializable {
    protected readonly _name: string;

    protected constructor(name: string) {
      this._name = name;
    }

    /**
     * @see https://tools.ietf.org/html/bcp47#section-3.1.3
     */
    public abstract get type(): string;

    /**
     * @see https://tools.ietf.org/html/bcp47#section-3.1.4
     */
    public get name(): string {
      return this._name;
    }

    public abstract equals(value: unknown): value is this;

    public abstract toJSON(): Subtag.JSON;

    public toString(): string {
      return this._name;
    }
  }

  export namespace Subtag {
    export interface JSON {
      [key: string]: json.JSON;
      type: string;
      name: string;
    }
  }

  /**
   * @see https://tools.ietf.org/html/bcp47#section-2.2.1
   */
  export class Primary extends Subtag {
    public static of(name: string, scope: Option<Scope> = None): Primary {
      return new Primary(name, scope);
    }

    private readonly _scope: Option<Scope>;

    private constructor(name: string, scope: Option<Scope>) {
      super(name);
      this._scope = scope;
    }

    public get type(): "primary" {
      return "primary";
    }

    /**
     * @see https://tools.ietf.org/html/bcp47#section-3.1.11
     */
    public get scope(): Option<Scope> {
      return this._scope;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Primary &&
        value._name === this._name &&
        value._scope.equals(this._scope)
      );
    }

    public toJSON(): Primary.JSON {
      return {
        type: "primary",
        name: this._name,
        scope: this._scope.getOr(null)
      };
    }
  }

  export namespace Primary {
    export interface JSON extends Subtag.JSON {
      type: "primary";
      scope: Scope | null;
    }
  }

  /**
   * @see https://tools.ietf.org/html/bcp47#section-2.2.2
   */
  export class Extended extends Subtag {
    public static of(
      name: string,
      prefix: string,
      scope: Option<Scope> = None
    ): Extended {
      return new Extended(name, prefix, scope);
    }

    private readonly _prefix: string;
    private readonly _scope: Option<Scope>;

    private constructor(name: string, prefix: string, scope: Option<Scope>) {
      super(name);
      this._prefix = prefix;
      this._scope = scope;
    }

    public get type(): "extended" {
      return "extended";
    }

    /**
     * @see https://tools.ietf.org/html/bcp47#section-3.1.8
     */
    public get prefix(): string {
      return this._prefix;
    }

    /**
     * @see https://tools.ietf.org/html/bcp47#section-3.1.11
     */
    public get scope(): Option<Scope> {
      return this._scope;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Extended &&
        value._name === this._name &&
        value._prefix === this._prefix &&
        value._scope.equals(this._scope)
      );
    }

    public toJSON(): Extended.JSON {
      return {
        type: "extended",
        name: this._name,
        prefix: this._prefix,
        scope: this._scope.getOr(null)
      };
    }
  }

  export namespace Extended {
    export interface JSON extends Subtag.JSON {
      type: "extended";
      prefix: string;
      scope: Scope | null;
    }
  }

  /**
   * @see https://tools.ietf.org/html/bcp47#section-2.2.3
   */
  export class Script extends Subtag {
    public static of(name: string): Script {
      return new Script(name);
    }

    private constructor(name: string) {
      super(name);
    }

    public get type(): "script" {
      return "script";
    }

    public equals(value: unknown): value is this {
      return value instanceof Script && value._name === this._name;
    }

    public toJSON(): Script.JSON {
      return {
        type: "script",
        name: this._name
      };
    }
  }

  export namespace Script {
    export interface JSON extends Subtag.JSON {
      type: "script";
    }
  }

  /**
   * @see https://tools.ietf.org/html/bcp47#section-2.2.4
   */
  export class Region extends Subtag {
    public static of(name: string): Region {
      return new Region(name);
    }

    private constructor(name: string) {
      super(name);
    }

    public get type(): "region" {
      return "region";
    }

    public equals(value: unknown): value is this {
      return value instanceof Region && value._name === this._name;
    }

    public toJSON(): Region.JSON {
      return {
        type: "region",
        name: this._name
      };
    }
  }

  export namespace Region {
    export interface JSON extends Subtag.JSON {
      type: "region";
    }
  }

  /**
   * @see https://tools.ietf.org/html/bcp47#section-2.2.5
   */
  export class Variant extends Subtag {
    public static of(name: string, prefixes: Array<string>): Variant {
      return new Variant(name, prefixes);
    }

    private readonly _prefixes: Array<string>;

    private constructor(name: string, prefixes: Array<string>) {
      super(name);
      this._prefixes = prefixes;
    }

    public get type(): "variant" {
      return "variant";
    }

    /**
     * @see https://tools.ietf.org/html/bcp47#section-3.1.8
     */
    public get prefixes(): Array<string> {
      return this._prefixes;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Variant &&
        value._name === this._name &&
        value._prefixes.length === this._prefixes.length &&
        value._prefixes.every((prefix, i) => prefix === this._prefixes[i])
      );
    }

    public toJSON(): Variant.JSON {
      return {
        type: "variant",
        name: this._name,
        prefixes: [...this._prefixes]
      };
    }
  }

  export namespace Variant {
    export interface JSON extends Subtag.JSON {
      type: "variant";
      prefixes: Array<string>;
    }
  }
}

import * as subtags from "./language/subtags";

export namespace Language {
  export function parse(input: string): Option<Language> {
    let parts = Slice.of(input.toLowerCase().split("-"));

    return parts
      .get(0)
      .flatMap(name => subtags.Primary.get(name))
      .map(primary => {
        parts = parts.slice(1);

        const extended = parts
          .get(0)
          .flatMap(name => subtags.Extended.get(name));

        if (extended.isSome()) {
          parts = parts.slice(1);
        }

        const script = parts.get(0).flatMap(name => subtags.Script.get(name));

        if (script.isSome()) {
          parts = parts.slice(1);
        }

        const region = parts.get(0).flatMap(name => subtags.Region.get(name));

        if (region.isSome()) {
          parts = parts.slice(1);
        }

        const variants: Array<Variant> = [];

        while (true) {
          const variant = parts
            .get(0)
            .flatMap(name => subtags.Variant.get(name));

          if (variant.isSome()) {
            parts = parts.slice(1);
            variants.push(variant.get());
          } else {
            break;
          }
        }

        return Language.of(primary, extended, script, region, variants);
      });
  }
}
