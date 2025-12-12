import { Real } from "@siteimprove/alfa-math";

import { Number, Percentage } from "../numeric/index.js";
import type { Resolvable } from "../resolvable.js";
import { Value } from "../value.js";

import type { RGB } from "./rgb.js";

/**
 * @remarks
 * While colors can be calculated, they only use numbers and raw percentages.
 * Therefore, the calculations can be fully resolved at parse time and do not
 * need to be stored.
 *
 * @internal
 */
export abstract class Format<F extends string = string>
  extends Value<"color", false>
  implements Resolvable<RGB.Canonical, never>
{
  protected readonly _format: F;

  protected constructor(format: F) {
    super("color", false);
    this._format = format;
  }

  public abstract get red(): Number.Canonical | Percentage.Canonical;

  public abstract get green(): Number.Canonical | Percentage.Canonical;

  public abstract get blue(): Number.Canonical | Percentage.Canonical;

  public abstract resolve(): RGB.Canonical;

  public toJSON(): Format.JSON<F> {
    return {
      ...super.toJSON(),
      format: this._format,
    };
  }
}

/**
 * @internal
 */
export namespace Format {
  export interface JSON<F extends string = string> extends Value.JSON<"color"> {
    format: F;
  }

  function toPercentage(
    channel: Number.Canonical | Percentage.Canonical,
    max: number,
  ): Percentage.Canonical {
    return Percentage.of<"percentage">(
      Real.clamp(channel.value / (Number.isNumber(channel) ? max : 1), 0, 1),
    );
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#resolving-color-values}
   */
  export function resolve(
    red: Number.Canonical | Percentage.Canonical,
    green: Number.Canonical | Percentage.Canonical,
    blue: Number.Canonical | Percentage.Canonical,
    alpha: Number.Canonical | Percentage.Canonical,
  ): [
    Percentage.Canonical,
    Percentage.Canonical,
    Percentage.Canonical,
    Percentage.Canonical,
  ] {
    return [
      toPercentage(red, 0xff),
      toPercentage(green, 0xff),
      toPercentage(blue, 0xff),
      toPercentage(alpha, 1),
    ];
  }
}
