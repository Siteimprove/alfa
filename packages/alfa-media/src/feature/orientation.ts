import { Keyword } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok, type Result } from "@siteimprove/alfa-result";

import { Value } from "../value";
import { Feature } from "./feature";

const { equals, property } = Predicate;

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#orientation}
 *
 * @internal
 */
export class Orientation extends Feature<Keyword> {
  public static of(value: Value<Keyword>): Orientation {
    return new Orientation(Option.of(value));
  }

  private static _boolean = new Orientation(None);

  public static boolean(): Orientation {
    return Orientation._boolean;
  }

  public get name(): "orientation" {
    return "orientation";
  }

  public matches(device: Device): boolean {
    return this._value.every((value) =>
      value.matches(Keyword.of(device.viewport.orientation)),
    );
  }
}

/**
 * @internal
 */
export namespace Orientation {
  function tryFrom(value: Option<Value<any>>): Result<Orientation, string> {
    return value
      .map((value) => {
        if (
          Value.isDiscrete(value) &&
          value.hasValue(
            Refinement.and(
              Keyword.isKeyword,
              property("value", equals("landscape", "portrait")),
            ),
          )
        ) {
          return Ok.of(Orientation.of(value));
        } else {
          return Err.of(`Invalid value`);
        }
      })
      .getOrElse(() => Ok.of(Orientation.boolean()));
  }

  export const parse = Feature.parseFeature("orientation", false, tryFrom);
}
