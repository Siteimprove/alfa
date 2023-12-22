import { Length } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Err, Ok, type Result } from "@siteimprove/alfa-result";

import { Resolver } from "../resolver";
import { Value } from "../value";

import { Feature } from "./feature";

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#height}
 *
 * @internal
 */
export class Height extends Feature<"height", Length.Fixed> {
  public static of(value: Value<Length.Fixed>): Height {
    return new Height(Option.of(value));
  }

  private static _boolean = new Height(None);

  private constructor(value: Option<Value<Length.Fixed>>) {
    super("height", value);
  }

  public static boolean(): Height {
    return Height._boolean;
  }

  public matches(device: Device): boolean {
    const {
      viewport: { height },
    } = device;

    const value = this._value.map((value) =>
      value.map((length) => length.resolve(Resolver.length(device))),
    );

    return height > 0
      ? value.some((value) => value.matches(Length.of(height, "px")))
      : value.every((value) => value.matches(Length.of(0, "px")));
  }
}

/**
 * @internal
 */
export namespace Height {
  function tryFrom(value: Option<Value>): Result<Height, string> {
    return value
      .map((value) => (Value.Range.isRange(value) ? value.toLength() : value))
      .map((value) => {
        if (
          value.hasValue(Length.isLength) &&
          value.hasValue(
            (value): value is Length.Fixed => !value.hasCalculation(),
          )
        ) {
          return Ok.of(Height.of(value));
        }

        return Err.of(`Invalid value`);
      })
      .getOrElse(() => Ok.of(Height.boolean()));
  }

  export function isHeight(value: Feature): value is Height;

  export function isHeight(value: unknown): value is Height;

  export function isHeight(value: unknown): value is Height {
    return value instanceof Height;
  }

  export const parse = Feature.parseFeature("height", true, tryFrom);
}
