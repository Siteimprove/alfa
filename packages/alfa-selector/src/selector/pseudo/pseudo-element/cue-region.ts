import {
  Function,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import type { Thunk } from "@siteimprove/alfa-thunk";

import type { Selector } from "../../index.js";
import { type Absolute } from "../../index.js";
import { PseudoElementSelector } from "./pseudo-element.js";

const { either, map, right, take } = Parser;

/**
 * {@link https://w3c.github.io/webvtt/#the-cue-region-pseudo-element}
 */
export class CueRegion extends PseudoElementSelector<"cue-region"> {
  public static of(selector?: Selector): CueRegion {
    return new CueRegion(Option.from(selector));
  }

  private readonly _selector: Option<Selector>;

  protected constructor(selector: Option<Selector>) {
    super("cue-region");
    this._selector = selector;
  }

  public get selector(): Option<Selector> {
    return this._selector;
  }

  public *[Symbol.iterator](): Iterator<CueRegion> {
    yield this;
  }

  public equals(value: CueRegion): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof CueRegion && value.selector.equals(this.selector);
  }

  public toJSON(): CueRegion.JSON {
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

export namespace CueRegion {
  export interface JSON extends PseudoElementSelector.JSON<"cue-region"> {
    selector: Option.JSON<Selector>;
  }

  export function parse(
    parseSelector: Thunk<CSSParser<Absolute>>,
  ): CSSParser<CueRegion> {
    return right(
      take(Token.parseColon, 2),
      // We need to try and fail the functional notation first to avoid accepting
      // the `::cue-region` prefix of a `::cue-region(selector)`.
      either(
        map(Function.parse("cue-region", parseSelector), ([_, selector]) =>
          CueRegion.of(selector),
        ),
        // We need to eta-expand in order to discard the result of parseIdent.
        map(Token.parseIdent("cue-region"), () => CueRegion.of()),
      ),
    );
  }
}
