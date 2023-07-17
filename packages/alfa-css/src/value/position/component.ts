import { Some } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Parser as CSSParser } from "../../syntax";
import { Unit } from "../../unit";

import { Keyword } from "../keyword";
import { LengthPercentage } from "../numeric";

import { Keywords } from "./keywords";
import { Side } from "./side";

const { either, map } = Parser;

/**
 * @public
 */
export type Component<
  S extends Keywords.Horizontal | Keywords.Vertical =
    | Keywords.Horizontal
    | Keywords.Vertical,
  U extends Unit.Length = Unit.Length,
  CALC extends boolean = boolean
> = Keywords.Center | Side<S, U, CALC>;

/**
 * @public
 */
export namespace Component {
  export type Canonical<S extends Keywords.Horizontal | Keywords.Vertical> =
    | Keywords.Center
    | Side.Canonical<S>;

  export type PartiallyResolved<
    S extends Keywords.Horizontal | Keywords.Vertical
  > = Keywords.Center | Side.PartiallyResolved<S>;

  export type JSON = Keyword.JSON | Side.JSON;

  export type Resolver = Side.Resolver;

  export function resolve<S extends Keywords.Horizontal | Keywords.Vertical>(
    resolver: Resolver
  ): (value: Component<S>) => Canonical<S> {
    return (value) => (Side.isSide(value) ? value.resolve(resolver) : value);
  }

  export type PartialResolver = Side.PartialResolver;

  export function partiallyResolve<
    S extends Keywords.Horizontal | Keywords.Vertical
  >(resolver: PartialResolver): (value: Component<S>) => PartiallyResolved<S> {
    return (value) =>
      Side.isSide(value) ? Side.partiallyResolve<S>(resolver)(value) : value;
  }

  /**
   * Parses an isolated offset (length-percentage), and adds the provided default
   * side to make a Side.
   *
   * @internal
   */
  export const parseOffset = <
    T extends Keywords.Horizontal | Keywords.Vertical
  >(
    side: T
  ): CSSParser<Component<T>> =>
    map(LengthPercentage.parse, (value) => Side.of(side, value));

  // "center" is included in Side.parse[Horizontal, Vertical]
  /**
   * @internal
   */
  export const parseHorizontal: CSSParser<Component<Keywords.Horizontal>> =
    either(parseOffset(Keyword.of("left")), Side.parseHorizontal);

  /**
   * @internal
   */
  export const parseVertical: CSSParser<Component<Keywords.Vertical>> = either(
    parseOffset(Keyword.of("top")),
    Side.parseVertical
  );
}
