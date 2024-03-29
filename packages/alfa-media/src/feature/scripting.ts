import { Keyword } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";

import { Value } from "../value";
import { Feature } from "./feature";

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#scripting}
 *
 * @internal
 */
export class Scripting extends Feature<"scripting", Keyword> {
  public static of(value: Value<Keyword>): Scripting {
    return new Scripting(Option.of(value));
  }

  private static _boolean = new Scripting(None);

  private constructor(value: Option<Value<Keyword>>) {
    super("scripting", value);
  }

  public static boolean(): Scripting {
    return Scripting._boolean;
  }

  public matches(device: Device): boolean {
    return device.scripting.enabled
      ? this._value.every((value) => value.matches(Keyword.of("enabled")))
      : this._value.some((value) => value.matches(Keyword.of("none")));
  }
}

/**
 * @internal
 */
export namespace Scripting {
  function from(value: Option<Value<Keyword>>): Scripting {
    return value.map(Scripting.of).getOrElse(Scripting.boolean);
  }

  export const parse = Feature.parseDiscrete(
    "scripting",
    from,
    "none",
    "initial-only",
    "enabled",
  );
}
