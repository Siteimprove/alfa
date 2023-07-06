import { Real } from "@siteimprove/alfa-math";
import { Number, Percentage } from "../numeric";
import { Value } from "../value";

/**
 * @internal
 */
export abstract class Format<
  F extends string = string,
  CALC extends boolean = boolean
> extends Value<"color", CALC> {
  private readonly _format: F;
  protected constructor(format: F, hasCalculation: CALC) {
    super("color", hasCalculation);
    this._format = format;
  }

  public get format(): F {
    return this._format;
  }

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
    channel: Number | Percentage,
    max: number
  ): Percentage.Canonical {
    const resolved = channel.resolve();

    return Percentage.of(
      Real.clamp(resolved.value / (Number.isNumber(resolved) ? max : 1), 0, 1)
    );
  }

  export function resolve(
    red: Number | Percentage,
    green: Number | Percentage,
    blue: Number | Percentage,
    alpha: Number | Percentage
  ): [
    Percentage.Canonical,
    Percentage.Canonical,
    Percentage.Canonical,
    Percentage.Canonical
  ] {
    return [
      toPercentage(red, 0xff),
      toPercentage(green, 0xff),
      toPercentage(blue, 0xff),
      toPercentage(alpha, 1),
    ];
  }
}
