import { Keyword } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";

import { Media } from "./media";
import { Value } from "./value";

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#orientation}
 *
 * @internal
 */
export class Orientation extends Media<"orientation", Keyword> {
  public static of(value: Value<Keyword>): Orientation {
    return new Orientation(Option.of(value));
  }

  private static _boolean = new Orientation(None);

  private constructor(value: Option<Value<Keyword>>) {
    super("orientation", value);
  }

  public static boolean(): Orientation {
    return Orientation._boolean;
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
  function from(value: Option<Value<Keyword>>): Orientation {
    return value.map(Orientation.of).getOrElse(Orientation.boolean);
  }

  export const parse = Media.parseDiscrete(
    "orientation",
    from,
    "portrait",
    "landscape",
  );
}
