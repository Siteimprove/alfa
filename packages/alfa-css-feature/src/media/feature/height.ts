import { Length } from "@siteimprove/alfa-css";
import type { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";

import { Media } from "./media.js";
import { Resolver } from "./resolver.js";
import type { Value } from "./value/index.js";

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#height}
 *
 * @public
 */
export class Height extends Media<"height", Length.Fixed> {
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
 * @public
 */
export namespace Height {
  function from(value: Option<Value<Length.Fixed>>): Height {
    return value.map(Height.of).getOrElse(Height.boolean);
  }

  export function isHeight(value: Media): value is Height;

  export function isHeight(value: unknown): value is Height;

  export function isHeight(value: unknown): value is Height {
    return value instanceof Height;
  }

  export const parse = Media.parseContinuous("height", from);
}
