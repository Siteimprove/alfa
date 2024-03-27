import {
  Function,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Thunk } from "@siteimprove/alfa-thunk";

import { Absolute, Selector } from "../../../selector";

import { PseudoElementSelector } from "./pseudo-element";

const { either, map, right, take } = Parser;

/**
 * {@link https://w3c.github.io/webvtt/#the-cue-pseudo-element}
 */
export class Cue extends PseudoElementSelector<"cue"> {
  public static of(selector?: Selector): Cue {
    return new Cue(Option.from(selector));
  }

  private readonly _selector: Option<Selector>;

  private constructor(selector: Option<Selector>) {
    super("cue");
    this._selector = selector;
  }

  public get selector(): Option<Selector> {
    return this._selector;
  }

  public *[Symbol.iterator](): Iterator<Cue> {
    yield this;
  }

  public equals(value: Cue): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Cue && value.selector.equals(this.selector);
  }

  public toJSON(): Cue.JSON {
    return {
      ...super.toJSON(),
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `::${this.name}` + this._selector.isSome()
      ? `(${this._selector})`
      : "";
  }
}

export namespace Cue {
  export interface JSON extends PseudoElementSelector.JSON<"cue"> {
    selector: Option.JSON<Selector>;
  }

  export function parse(
    parseSelector: Thunk<CSSParser<Absolute>>,
  ): CSSParser<Cue> {
    return right(
      take(Token.parseColon, 2),
      // We need to try and fail the functional notation first to avoid accepting
      // the `::cue` prefix of a `::cue(selector)`.
      either(
        map(Function.parse("cue", parseSelector), ([_, selector]) =>
          Cue.of(selector),
        ),
        // We need to eta-expand in order to discard the result of parseIdent.
        map(Token.parseIdent("cue"), () => Cue.of()),
      ),
    );
  }
}
