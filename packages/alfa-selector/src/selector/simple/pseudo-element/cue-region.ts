import { Option } from "@siteimprove/alfa-option";

import { Selector } from "../../../selector";
import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://w3c.github.io/webvtt/#the-cue-region-pseudo-element}
 */
export class CueRegion extends PseudoElementSelector<"cue-region"> {
  public static of(selector?: Selector): CueRegion {
    return new CueRegion(Option.from(selector));
  }

  private readonly _selector: Option<Selector>;

  private constructor(selector: Option<Selector>) {
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
}
