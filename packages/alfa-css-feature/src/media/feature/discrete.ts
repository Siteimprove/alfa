import { Keyword, type Parser as CSSParser } from "@siteimprove/alfa-css";
import type { Device } from "@siteimprove/alfa-device";
import { Preference } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";

import { Media } from "./media.js";
import type { Value } from "./value/index.js";

export namespace Discrete {
  interface Discrete<N extends string, K extends string> {
    of(value: Value<Keyword<K>>): Media<N, Keyword<K>>;

    boolean(): Media<N, Keyword<K>>;

    parse: CSSParser<Media<N, Keyword<K>>>;
  }

  function discrete<N extends string, K extends string>(
    name: N,
    keywords: ReadonlyArray<K>,
    getDeviceValue: (device: Device) => K,
    booleanFalse?: K,
  ): Discrete<N, K> {
    return class Discrete extends Media<N, Keyword<K>> {
      public static of(value: Value<Keyword<K>>): Discrete {
        return new Discrete(Option.of(value));
      }

      private static _boolean = new Discrete(None);

      protected constructor(value: Option<Value<Keyword<K>>>) {
        super(name, value);
      }

      public static boolean(): Discrete {
        return Discrete._boolean;
      }

      public matches(device: Device): boolean {
        const deviceValue = getDeviceValue(device);

        return this._value
          .map((value) => value.matches(Keyword.of(deviceValue)))
          .getOr(deviceValue !== (booleanFalse ?? "none"));
      }

      private static _from(value: Option<Value<Keyword<K>>>): Discrete {
        return value.map(Discrete.of).getOrElse(Discrete.boolean);
      }

      public static parse = Media.parseDiscrete(
        name,
        Discrete._from,
        ...keywords,
      );
    };
  }

  function userPreference<N extends Preference.Name>(
    name: N,
  ): Discrete<N, Preference.Value<N>> {
    return discrete(
      name,
      [...Preference.preferences[name]],
      (device) => device.preference(name).value,
      Preference.unset(name),
    );
  }

  export const Orientation = discrete(
    "orientation",
    ["landscape", "portrait"],
    (device) => device.viewport.orientation,
  );

  export const ForcedColors = userPreference("forced-colors");
  export const Inverted = userPreference("inverted");
  export const PrefersColorScheme = userPreference("prefers-color-scheme");
  export const PrefersContrast = userPreference("prefers-contrast");
  export const PrefersReducedData = userPreference("prefers-reduced-data");
  export const PrefersReducedMotion = userPreference("prefers-reduced-motion");
  export const PrefersReducedTransparency = userPreference(
    "prefers-reduced-transparency",
  );
}
