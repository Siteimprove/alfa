import { Length } from "@siteimprove/alfa-css";
import type { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";

import { Media } from "./media.js";
import { Resolver } from "./resolver.js";
import type { Value } from "./value/index.js";

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#width}
 *
 * @public
 */
export class Width extends Media<"width", Length.Fixed> {
  public static of(value: Value<Length.Fixed>): Width {
    return new Width(Option.of(value));
  }

  private static _boolean = new Width(None);

  protected constructor(value: Option<Value<Length.Fixed>>) {
    super("width", value);
  }

  public static boolean(): Width {
    return Width._boolean;
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
 * @public
 */
export namespace Width {
  function from(value: Option<Value<Length.Fixed>>): Width {
    return value.map(Width.of).getOrElse(Width.boolean);
  }

  export function isWidth(value: Media): value is Width;

  export function isWidth(value: unknown): value is Width;

  export function isWidth(value: unknown): value is Width {
    return value instanceof Width;
  }

  export const parse = Media.parseContinuous("width", from);
}
