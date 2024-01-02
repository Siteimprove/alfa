import { Length } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";

import { Resolver } from "../resolver";
import { Value } from "../value";

import { Feature } from "./feature";

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#width}
 *
 * @internal
 */
export class Width extends Feature<"width", Length.Fixed> {
  public static of(value: Value<Length.Fixed>): Width {
    return new Width(Option.of(value));
  }

  private static _boolean = new Width(None);

  private constructor(value: Option<Value<Length.Fixed>>) {
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
 * @internal
 */
export namespace Width {
  function from(value: Option<Value<Length.Fixed>>): Width {
    return value.map(Width.of).getOrElse(Width.boolean);
  }

  export function isWidth(value: Feature): value is Width;

  export function isWidth(value: unknown): value is Width;

  export function isWidth(value: unknown): value is Width {
    return value instanceof Width;
  }

  export const parse = Feature.parseContinuous("width", from);
}
