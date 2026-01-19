/*
 * Represents CSS mix notation.
 * {@see https://drafts.csswg.org/css-values-5/#mixing}
 *
 * This currently lives in value/color/ because the only mix notation we have
 * is color-mix. However, this should probably be shared elsewhere.
 * The main problem is that calc-mix should live somewhere in calculation/ while
 * still depending on fully calculatable Percentages.
 */
import type { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Maybe, None, Option, Some } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Token } from "../../syntax/index.js";

import type { Parser as CSSParser } from "../../syntax/parser.js";
import { List } from "../collection/index.js";

import { Percentage } from "../numeric/index.js";
import { type Resolvable } from "../resolvable.js";
import { Value } from "../value.js";

const { map, option, pair, right } = Parser;

/**
 * @public
 */
export class MixItem<
  V extends Value = Value,
  P extends Option<Percentage.Fixed> = Option<Percentage.Fixed>,
>
  extends Value<"mix-item", Value.HasCalculation<[V]>>
  implements Resolvable<MixItem<Resolvable.Resolved<V>>, Resolvable.Resolver<V>>
{
  public static of<V extends Value>(
    value: V,
    percentage?: None,
  ): MixItem<V, None>;

  public static of<V extends Value>(
    value: V,
    percentage: Percentage.Fixed | Some<Percentage.Fixed>,
  ): MixItem<V, Some<Percentage.Fixed>>;

  public static of<V extends Value>(
    value: V,
    percentage?: Maybe<Percentage.Fixed>,
  ): MixItem<V>;

  public static of<V extends Value>(
    value: V,
    percentage?: Maybe<Percentage.Fixed>,
  ): MixItem<V> {
    return new MixItem(value, Maybe.toOption(percentage ?? None));
  }

  private readonly _value: V;
  private readonly _percentage: P;

  private constructor(value: V, percentage: P) {
    super("mix-item", Value.hasCalculation(value));

    this._value = value;
    this._percentage = percentage;
  }

  public get value(): V {
    return this._value;
  }

  public get percentage(): P {
    return this._percentage;
  }

  public resolve(
    resolver: Resolvable.Resolver<Value>,
  ): MixItem<Resolvable.Resolved<V>> {
    return new MixItem(
      this._value.resolve(resolver) as Resolvable.Resolved<V>,
      this._percentage,
    );
  }

  public hasPercentage(): this is MixItem<V, Some<Percentage.Fixed>> {
    return this._percentage.isSome();
  }

  public withPercentage(
    percentage: Percentage.Fixed,
  ): MixItem<V, Some<Percentage.Fixed>> {
    return new MixItem(this._value, Some.of(percentage));
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof MixItem &&
      this._value.equals(value._value) &&
      this._percentage.equals(value._percentage)
    );
  }

  public hash(hash: Hash) {
    this._value.hash(hash);
    this._percentage.hash(hash);
  }

  public toJSON(): MixItem.JSON<V> {
    return {
      ...super.toJSON(),
      value: this._value.toJSON() as Serializable.ToJSON<V>,
      percentage: this._percentage
        .map((percentage) => percentage.toJSON())
        .getOr(null),
    };
  }

  public toString(): string {
    return (
      this._value.toString() +
      this._percentage.map((percentage) => ` ${percentage}`).getOr("")
    );
  }
}

/**
 * @public
 */
export namespace MixItem {
  export interface JSON<V extends Value> extends Value.JSON<"mix-item"> {
    value: Serializable.ToJSON<V>;
    percentage: Percentage.Fixed.JSON | null;
  }

  export function isMixItem(value: unknown): value is MixItem {
    return value instanceof MixItem;
  }

  export function parse<T extends Value>(
    parser: CSSParser<T>,
  ): CSSParser<MixItem<T>> {
    return map(
      pair(
        parser,
        option(right(Token.parseWhitespace, Percentage.parse<"percentage">)),
      ),
      ([value, percentage]) =>
        MixItem.of(
          value,
          percentage.map((percentage) => percentage.resolve()),
        ),
    );
  }
}

/**
 * @public
 */
export namespace Mix {
  function sum(p1: Percentage.Fixed, p2: Percentage.Fixed): Percentage.Fixed {
    return Percentage.of(p1.value + p2.value);
  }

  /**
   * {@link https://drafts.csswg.org/css-values-5/#mix-percentage-normalization}
   */
  export function normalize<V extends Value>(
    items: List<MixItem<V>>,
    force: boolean = false,
  ): [
    normalized: List<MixItem<V, Some<Percentage.Fixed>>>,
    leftover: Percentage.Fixed,
  ] {
    let omitted = 0;

    // 1. Sum of the specified percentages.
    const specifiedSum = Iterable.reduce(
      items,
      (total, item) =>
        sum(
          total,
          item.percentage.getOrElse(() => {
            omitted++;
            return Percentage.of(0);
          }),
        ),
      Percentage.of(0),
    );

    // 2. Replace unspecified percentage by equal shares of the omitted part.
    // If omitted is 0, this won't be used.
    // We do not create the intermediate list, just remember the "missing" value.
    const omittedPercentage = Percentage.of((1 - specifiedSum.value) / omitted);

    // 3. "Recompute" total. This will be 100% if there were any omission, or the
    // same as the previous total.
    const total = omitted === 0 ? specifiedSum : Percentage.of(1);

    // 4. Normalize percentages, so that total is 100%. For smaller total, only
    // normalize if forced.

    // Replace unspecified percentages with the computed omitted percentage.
    function fallback(item: MixItem<V>): MixItem<V, Some<Percentage.Fixed>> {
      return item.withPercentage(item.percentage.getOr(omittedPercentage));
    }

    // Normalize all percentages, replacing unspecified ones as needed, so that
    // the sum is 100%.
    function fallbackAndNormalize(
      item: MixItem<V>,
    ): MixItem<V, Some<Percentage.Fixed>> {
      return item.withPercentage(
        Percentage.of(
          item.percentage.getOr(omittedPercentage).value / total.value,
        ),
      );
    }

    const normalized =
      total.value > 1 || (force && total.value > 0)
        ? items.map(fallbackAndNormalize)
        : items.map(fallback);

    // 5. Compute leftover (unspecified) percentage.
    const leftover =
      total.value < 1 ? Percentage.of(1 - total.value) : Percentage.of(0);

    // 6.
    return [normalized, leftover];
  }

  export function parse<T extends Value>(
    parser: CSSParser<T>,
  ): CSSParser<List<MixItem<T>>> {
    return List.parseCommaSeparated(MixItem.parse(parser));
  }
}
