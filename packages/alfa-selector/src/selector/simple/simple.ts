import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Selector } from "../selector";

const { either, left, map, option, pair } = Parser;

/**
 * @internal
 */
export abstract class Simple<
  T extends string = string,
  N extends string = string,
> extends Selector<T> {
  protected readonly _name: N;
  protected constructor(type: T, name: N) {
    super(type);
    this._name = name;
  }

  public get name(): N {
    return this._name;
  }

  public equals(value: Simple): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Simple &&
      super.equals(value) &&
      value._name === this._name
    );
  }

  public toJSON(): Simple.JSON<T, N> {
    return {
      ...super.toJSON(),
      name: this._name,
    };
  }
}

export namespace Simple {
  export interface JSON<T extends string = string, N extends string = string>
    extends Selector.JSON<T> {
    name: N;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-ns-prefix}
   *
   * @internal
   */
  export const parseNamespace = map(
    left(
      option(either(Token.parseIdent(), Token.parseDelim("*"))),
      Token.parseDelim("|"),
    ),
    (token) => token.map((token) => token.toString()).getOr(""),
  );

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-wq-name}
   *
   * @internal
   */
  export const parseName = pair(
    option(parseNamespace),
    map(Token.parseIdent(), (ident) => ident.value),
  );
}
