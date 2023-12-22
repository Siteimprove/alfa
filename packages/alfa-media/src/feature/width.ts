import { Length } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Err, Ok, type Result } from "@siteimprove/alfa-result";

import { Resolver } from "../resolver";
import { Value } from "../value";

import { Feature } from "./feature";

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#width}
 *
 * @internal
 */
export class Width extends Feature<Length.Fixed> {
  public static of(value: Value<Length.Fixed>): Width {
    return new Width(Option.of(value));
  }

  private static _boolean = new Width(None);

  public static boolean(): Width {
    return Width._boolean;
  }

  public get name(): "width" {
    return "width";
  }

  public matches(device: Device): boolean {
    const {
      viewport: { width },
    } = device;

    const value = this._value.map((value) =>
      value.map((length) => length.resolve(Resolver.length(device))),
    );

    return width > 0
      ? value.some((value) => value.matches(Length.of(width, "px")))
      : value.every((value) => value.matches(Length.of(0, "px")));
  }
}

/**
 * @internal
 */
export namespace Width {
  function tryFrom(value: Option<Value>): Result<Width, string> {
    return value
      .map((value) => (Value.Range.isRange(value) ? value.toLength() : value))
      .map((value) => {
        if (
          value.hasValue(Length.isLength) &&
          value.hasValue(
            (value): value is Length.Fixed => !value.hasCalculation(),
          )
        ) {
          return Ok.of(Width.of(value));
        }

        return Err.of(`Invalid value`);
      })
      .getOrElse(() => Ok.of(Width.boolean()));
  }

  export function isWidth(value: Feature): value is Width;

  export function isWidth(value: unknown): value is Width;

  export function isWidth(value: unknown): value is Width {
    return value instanceof Width;
  }

  export const parse = Feature.parseFeature("width", true, tryFrom);
}
