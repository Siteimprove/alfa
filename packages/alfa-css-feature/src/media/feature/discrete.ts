import { Keyword, Parser as CSSParser } from "@siteimprove/alfa-css";
import { Device, Preference } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";

import { Media } from "./media";
import { Value } from "./value";

export interface Discrete<N extends string, K extends string> {
  of(value: Value<Keyword<K>>): Media<N, Keyword<K>>;
  boolean(): Media<N, Keyword<K>>;
  parse: CSSParser<Media<N, Keyword<K>>>;
}
export function discrete<N extends string, K extends string>(
  name: N,
  keywords: Array<K>,
  getDeviceValue: (device: Device) => K,
  booleanFalse?: K,
): Discrete<N, K> {
  return class Discrete extends Media<N, Keyword<K>> {
    public static of(value: Value<Keyword<K>>): Discrete {
      return new Discrete(Option.of(value));
    }

    private static _boolean = new Discrete(None);

    private constructor(value: Option<Value<Keyword<K>>>) {
      super(name, value);
    }

    public static boolean(): Discrete {
      return Discrete._boolean;
    }

    public matches(device: Device): boolean {
      const deviceValue = getDeviceValue(device);

      return this._value
        .map((value) => value.matches(Keyword.of(deviceValue)))
        .getOr(deviceValue !== booleanFalse ?? "none");
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

export function userPreference<N extends Preference.Name>(
  name: N,
  keywords: Array<Preference.Value<N>>,
): Discrete<N, Preference.Value<N>> {
  return discrete(
    name,
    keywords,
    (device) => device.preference(name).value,
    Preference.unset(name),
  );
}
