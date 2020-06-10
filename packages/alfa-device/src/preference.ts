import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

/**
 * @see https://drafts.csswg.org/mediaqueries-5/#mf-user-preferences
 */
export class Preference<N extends Preference.Name = Preference.Name>
  implements Equatable, Hashable, Serializable {
  public static of<N extends Preference.Name>(
    name: N,
    value: Preference.Value<N>
  ): Preference<N> {
    return new Preference(name, value);
  }

  private readonly _name: N;
  private readonly _value: Preference.Value<N>;

  private constructor(name: N, value: Preference.Value<N>) {
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
    Hash.writeString(hash, this._name);
    Hash.writeString(hash, this._value);
  }

  public toJSON(): Preference.JSON {
    return {
      name: this._name,
      value: this._value,
    };
  }
}

export namespace Preference {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    value: string;
  }

  export function isPreference<N extends Name>(
    value: unknown,
    name?: N
  ): value is Preference<N> {
    return (
      value instanceof Preference && (name === undefined || value.name === name)
    );
  }

  export function from<N extends Name>(json: JSON): Preference<N> {
    return Preference.of(json.name as N, json.value as Preference.Value<N>);
  }

  export type Name = keyof Preferences;

  export type Value<N extends Name = Name> = Preferences[N];

  interface Preferences {
    /**
     * @see https://drafts.csswg.org/mediaqueries-5/#forced-colors
     */
    "forced-colors": "none" | "active";

    /**
     * @see https://drafts.csswg.org/mediaqueries-5/#inverted
     */
    inverted: "none" | "inverted";

    /**
     * @see https://drafts.csswg.org/mediaqueries-5/#prefers-color-scheme
     *
     * @remarks
     * For consistency, "no-preference" is also included.
     */
    "prefers-color-scheme": "no-preference" | "light" | "dark";

    /**
     * @see https://drafts.csswg.org/mediaqueries-5/#prefers-contrast
     *
     * @remarks
     * For consistency, "no-preference" is also included.
     */
    "prefers-contrast": "no-preference" | "high" | "low";

    /**
     * @see https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-motion
     */
    "prefers-reduced-motion": "no-preference" | "reduce";

    /**
     * @see https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-transparency
     */
    "prefers-reduced-transparency": "no-preference" | "reduce";
  }

  export function initial<N extends Name>(name: N): Value<N> {
    function initial(name: Name): Value {
      switch (name) {
        case "forced-colors":
        case "inverted":
          return "none";

        case "prefers-color-scheme":
        case "prefers-contrast":
        case "prefers-reduced-motion":
        case "prefers-reduced-transparency":
          return "no-preference";
      }
    }

    return initial(name) as Value<N>;
  }
}
