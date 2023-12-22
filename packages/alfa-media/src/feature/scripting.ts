import { Keyword } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok, type Result } from "@siteimprove/alfa-result";

import { Value } from "../value";
import { Feature } from "./feature";

const { property, equals } = Predicate;

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
  function tryFrom(value: Option<Value<any>>): Result<Scripting, string> {
    return value
      .map((value) => {
        if (
          Value.isDiscrete(value) &&
          value.hasValue(
            Refinement.and(
              Keyword.isKeyword,
              property("value", equals("none", "enabled", "initial-only")),
            ),
          )
        ) {
          return Ok.of(Scripting.of(value));
        } else {
          return Err.of(`Invalid value`);
        }
      })
      .getOrElse(() => Ok.of(Scripting.boolean()));
  }

  export const parse = Feature.parseFeature("scripting", false, tryFrom);
}
