import { Parser } from "@siteimprove/alfa-parser";

import type { Parser as CSSParser } from "../../syntax/index.js";

import { Keyword } from "../keyword.js";
import { LengthPercentage } from "../numeric/index.js";

import { Keywords } from "./keywords.js";
import { Side } from "./side.js";

const { either, map } = Parser;

/**
 * @public
 */
export type Component<
  S extends Keywords.Horizontal | Keywords.Vertical =
    | Keywords.Horizontal
    | Keywords.Vertical,
  O extends LengthPercentage = LengthPercentage,
> = Keywords.Center | Side<S, O>;

/**
 * @public
 */
export namespace Component {
  export type Canonical<S extends Keywords.Horizontal | Keywords.Vertical> =
    | Keywords.Center
    | Side.Canonical<S>;

  export type PartiallyResolved<
    S extends Keywords.Horizontal | Keywords.Vertical,
  > = Keywords.Center | Side.PartiallyResolved<S>;

  export type JSON = Keyword.JSON | Side.JSON;

  export type Resolver = Side.Resolver;

  export function resolve<S extends Keywords.Horizontal | Keywords.Vertical>(
    resolver: Resolver,
  ): (value: Component<S>) => Canonical<S> {
    return (value) => (Side.isSide(value) ? value.resolve(resolver) : value);
  }

  export type PartialResolver = Side.PartialResolver;

  export function partiallyResolve<
    S extends Keywords.Horizontal | Keywords.Vertical,
  >(resolver: PartialResolver): (value: Component<S>) => PartiallyResolved<S> {
    return (value) =>
      Side.isSide(value) ? value.partiallyResolve(resolver) : value;
  }

  /**
   * Parses an isolated offset (length-percentage), and adds the provided default
   * side to make a Side.
   *
   * @internal
   */
  export function parseOffset<
    T extends Keywords.Horizontal | Keywords.Vertical,
  >(side: T): CSSParser<Component<T>> {
    return map(LengthPercentage.parse, (value) => Side.of(side, value));
  }

  // "center" is included in Side.parse[Horizontal, Vertical]
  /**
   * @internal
   */
  export const parseHorizontal = either(
    parseOffset(Keyword.of("left")),
    Side.parseHorizontal,
  );

  /**
   * @internal
   */
  export const parseVertical = either(
    parseOffset(Keyword.of("top")),
    Side.parseVertical,
  );
}
