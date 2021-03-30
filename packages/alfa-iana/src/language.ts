import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Err } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Languages } from "./language/data";

/**
 * @public
 */
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
      extended: this._extended.map((extended) => extended.toJSON()).getOr(null),
      script: this._script.map((script) => script.toJSON()).getOr(null),
      region: this._region.map((region) => region.toJSON()).getOr(null),
      variants: this._variants.map((variant) => variant.toJSON()),
    };
  }

  public toString(): string {
    return [
      this._primary,
      ...this._extended,
      ...this._script,
      ...this._region,
      ...this._variants,
    ].join("-");
  }
}

/**
 * @public
 */
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

  /**
   * {@link https://tools.ietf.org/html/bcp47#section-3.1.11}
   */
  export type Scope = Exclude<
    Languages["primary"][Primary.Name]["scope"],
    null
  >;

  /**
   * {@link https://tools.ietf.org/html/bcp47#section-3.1.2}
   */
  export abstract class Subtag<
    T extends string = string,
    N extends string = string
  > implements Equatable, Serializable<Subtag.JSON<T, N>> {
    protected readonly _name: N;

    protected constructor(name: N) {
      this._name = name;
    }

    /**
     * {@link https://tools.ietf.org/html/bcp47#section-3.1.3}
     */
    public abstract get type(): T;

    /**
     * {@link https://tools.ietf.org/html/bcp47#section-3.1.4}
     */
    public get name(): N {
      return this._name;
    }

    public abstract equals<T extends string, N extends string>(
      value: Subtag<T, N>
    ): boolean;

    public abstract equals(value: unknown): value is this;

    public abstract toJSON(): Subtag.JSON<T, N>;

    public toString(): string {
      return this._name;
    }
  }

  export namespace Subtag {
    export interface JSON<
      T extends string = string,
      N extends string = string
    > {
      [key: string]: json.JSON;
      type: T;
      name: N;
    }
  }

  /**
   * {@link https://tools.ietf.org/html/bcp47#section-2.2.1}
   */
  export class Primary extends Subtag<"primary", Primary.Name> {
    public static of(name: Primary.Name): Primary {
      return new Primary(name);
    }

    private constructor(name: Primary.Name) {
      super(name);
    }

    public get type(): "primary" {
      return "primary";
    }

    /**
     * {@link https://tools.ietf.org/html/bcp47#section-3.1.11}
     */
    public get scope(): Option<Scope> {
      return Option.from(Languages.primary[this._name].scope);
    }

    public equals(value: Primary): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return value instanceof Primary && value._name === this._name;
    }

    public toJSON(): Primary.JSON {
      return {
        type: "primary",
        name: this._name,
        scope: this.scope.getOr(null),
      };
    }
  }

  export namespace Primary {
    export type Name = keyof Languages["primary"];

    export interface JSON extends Subtag.JSON<"primary", Name> {
      scope: Scope | null;
    }

    export function isPrimary(value: unknown): value is Primary {
      return value instanceof Primary;
    }

    export function isName(name: string): name is Name {
      return name in Languages.primary;
    }
  }

  export const { of: primary, isPrimary, isName: isPrimaryName } = Primary;

  /**
   * {@link https://tools.ietf.org/html/bcp47#section-2.2.2}
   */
  export class Extended extends Subtag<"extended", Extended.Name> {
    public static of(name: Extended.Name): Extended {
      return new Extended(name);
    }

    private constructor(name: Extended.Name) {
      super(name);
    }

    public get type(): "extended" {
      return "extended";
    }

    /**
     * {@link https://tools.ietf.org/html/bcp47#section-3.1.8}
     */
    public get prefix(): Primary.Name {
      return Languages.extended[this._name].prefix;
    }

    public equals(value: Extended): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return value instanceof Extended && value._name === this._name;
    }

    public toJSON(): Extended.JSON {
      return {
        type: "extended",
        name: this._name,
        prefix: this.prefix,
      };
    }
  }

  export namespace Extended {
    export type Name = keyof Languages["extended"];

    export interface JSON extends Subtag.JSON<"extended", Name> {
      prefix: Primary.Name;
    }

    export function isExtended(value: unknown): value is Extended {
      return value instanceof Extended;
    }

    export function isName(name: string): name is Name {
      return name in Languages.extended;
    }
  }

  export const { of: extended, isExtended, isName: isExtendedName } = Extended;

  /**
   * {@link https://tools.ietf.org/html/bcp47#section-2.2.3}
   */
  export class Script extends Subtag<"script", Script.Name> {
    public static of(name: Script.Name): Script {
      return new Script(name);
    }

    private constructor(name: Script.Name) {
      super(name);
    }

    public get type(): "script" {
      return "script";
    }

    public equals(value: Script): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return value instanceof Script && value._name === this._name;
    }

    public toJSON(): Script.JSON {
      return {
        type: "script",
        name: this._name,
      };
    }
  }

  export namespace Script {
    export type Name = keyof Languages["script"];

    export interface JSON extends Subtag.JSON<"script", Name> {}

    export function isScript(value: unknown): value is Script {
      return value instanceof Script;
    }

    export function isName(name: string): name is Name {
      return name in Languages.script;
    }
  }

  export const { of: script, isScript, isName: isScriptName } = Script;

  /**
   * {@link https://tools.ietf.org/html/bcp47#section-2.2.4}
   */
  export class Region extends Subtag<"region", Region.Name> {
    public static of(name: Region.Name): Region {
      return new Region(name);
    }

    private constructor(name: Region.Name) {
      super(name);
    }

    public get type(): "region" {
      return "region";
    }

    public equals(value: Region): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return value instanceof Region && value._name === this._name;
    }

    public toJSON(): Region.JSON {
      return {
        type: "region",
        name: this._name,
      };
    }
  }

  export namespace Region {
    export type Name = keyof Languages["region"];

    export interface JSON extends Subtag.JSON<"region", Name> {}

    export function isRegion(value: unknown): value is Region {
      return value instanceof Region;
    }

    export function isName(name: string): name is Name {
      return name in Languages.region;
    }
  }

  export const { of: region, isRegion, isName: isRegionName } = Region;

  /**
   * {@link https://tools.ietf.org/html/bcp47#section-2.2.5}
   */
  export class Variant extends Subtag<"variant", Variant.Name> {
    public static of(name: Variant.Name): Variant {
      return new Variant(name);
    }

    private constructor(name: Variant.Name) {
      super(name);
    }

    public get type(): "variant" {
      return "variant";
    }

    /**
     * {@link https://tools.ietf.org/html/bcp47#section-3.1.8}
     */
    public get prefixes(): ReadonlyArray<string> {
      return Languages.variant[this._name].prefixes;
    }

    public equals(value: Variant): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return value instanceof Variant && value._name === this._name;
    }

    public toJSON(): Variant.JSON {
      return {
        type: "variant",
        name: this._name,
        prefixes: [...this.prefixes],
      };
    }
  }

  export namespace Variant {
    export type Name = keyof Languages["variant"];

    export interface JSON extends Subtag.JSON<"variant", Name> {
      prefixes: Array<string>;
    }

    export function isVariant(value: unknown): value is Variant {
      return value instanceof Variant;
    }

    export function isName(name: string): name is Name {
      return name in Languages.variant;
    }
  }

  export const { of: variant, isVariant, isName: isVariantName } = Variant;
}

/**
 * @public
 */
export namespace Language {
  export function parse(input: string): Result<Language, string> {
    let parts = Slice.of(input.toLowerCase().split("-"));

    return parts
      .get(0)
      .map((name) => {
        if (!isPrimaryName(name)) {
          return Err.of(`${name} is not a valid primary language`);
        }

        const primary = Primary.of(name);

        parts = parts.slice(1);

        const extended = parts.get(0).filter(isExtendedName).map(Extended.of);

        if (extended.isSome()) {
          parts = parts.slice(1);
        }

        const script = parts.get(0).filter(isScriptName).map(Script.of);

        if (script.isSome()) {
          parts = parts.slice(1);
        }

        const region = parts.get(0).filter(isRegionName).map(Region.of);

        if (region.isSome()) {
          parts = parts.slice(1);
        }

        const variants: Array<Variant> = [];

        while (true) {
          const variant = parts.get(0).filter(isVariantName).map(Variant.of);

          if (variant.isSome()) {
            parts = parts.slice(1);
            variants.push(variant.get());
          } else {
            break;
          }
        }

        return Result.of<Language, string>(
          Language.of(primary, extended, script, region, variants)
        );
      })
      .getOrElse(() => Err.of(`Expected a primary language name`));
  }
}
