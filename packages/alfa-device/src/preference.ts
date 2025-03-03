import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash, Hashable } from "@siteimprove/alfa-hash";
import type { Serializable } from "@siteimprove/alfa-json";

import type * as json from "@siteimprove/alfa-json";

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#mf-user-preferences}
 *
 * @public
 */
export class Preference<N extends Preference.Name = Preference.Name>
  implements Equatable, Hashable, Serializable
{
  public static of<N extends Preference.Name>(
    name: N,
    value: Preference.Value<N>,
  ): Preference<N> {
    return new Preference(name, value);
  }

  private readonly _name: N;
  private readonly _value: Preference.Value<N>;

  protected constructor(name: N, value: Preference.Value<N>) {
    this._name = name;
    this._value = value;
  }

  public get name(): N {
    return this._name;
  }

  public get value(): Preference.Value<N> {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Preference &&
      value._name === this._name &&
      value._value === this._value
    );
  }

  public hash(hash: Hash): void {
    hash.writeString(this._name).writeString(this._value);
  }

  public toJSON(options?: json.Serializable.Options): Preference.JSON<N> {
    return {
      name: this._name,
      value: this._value,
    };
  }
}

/**
 * @public
 */
export namespace Preference {
  export interface JSON<N extends Name = Name> {
    [key: string]: json.JSON;
    name: N;
    value: Value<N>;
  }

  export function isPreference<N extends Name>(
    value: unknown,
    name?: N,
  ): value is Preference<N> {
    return (
      value instanceof Preference && (name === undefined || value.name === name)
    );
  }

  export function from<N extends Name>(json: JSON<N>): Preference<N> {
    return Preference.of(json.name, json.value);
  }

  export const preferences = {
    /**
     * {@link https://drafts.csswg.org/mediaqueries-5/#forced-colors}
     */
    "forced-colors": ["none", "active"],

    /**
     * {@link https://drafts.csswg.org/mediaqueries-5/#inverted}
     */
    inverted: ["none", "inverted"],

    /**
     * {@link https://drafts.csswg.org/mediaqueries-5/#prefers-color-scheme}
     *
     * @remarks
     * For consistency, "no-preference" is also included.
     */
    "prefers-color-scheme": ["no-preference", "light", "dark"],

    /**
     * {@link https://drafts.csswg.org/mediaqueries-5/#prefers-contrast}
     *
     * @remarks
     * For consistency, "no-preference" is also included.
     */
    "prefers-contrast": ["no-preference", "less", "more", "custom"],

    /**
     * {@link https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-motion}
     */
    "prefers-reduced-motion": ["no-preference", "reduce"],

    /**
     * {@link https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-transparency}
     */
    "prefers-reduced-transparency": ["no-preference", "reduce"],

    /**
     * {@link https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-data}
     */
    "prefers-reduced-data": ["no-preference", "reduce"],
  } as const;

  export type Name = keyof typeof preferences;

  export type Value<N extends Name = Name> = (typeof preferences)[N][number];

  export function unset<N extends Name>(name: N): Value<N> {
    function unset(name: Name): Value {
      switch (name) {
        case "forced-colors":
        case "inverted":
          return "none";

        case "prefers-color-scheme":
        case "prefers-contrast":
        case "prefers-reduced-motion":
        case "prefers-reduced-transparency":
        case "prefers-reduced-data":
          return "no-preference";
      }
    }

    return unset(name) as Value<N>;
  }
}
