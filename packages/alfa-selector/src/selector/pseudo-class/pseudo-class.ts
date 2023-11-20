import type { Element } from "@siteimprove/alfa-dom";

import type { Context } from "../../context";

import { WithName } from "../selector";

export abstract class PseudoClassSelector<
  N extends string = string,
> extends WithName<"pseudo-class", N> {
  protected constructor(name: N) {
    super("pseudo-class", name);
  }

  public matches(element: Element, context?: Context): boolean {
    return false;
  }

  public equals(value: PseudoClassSelector): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof PseudoClassSelector && super.equals(value);
  }

  public toJSON(): PseudoClassSelector.JSON<N> {
    return {
      ...super.toJSON(),
    };
  }

  public toString(): string {
    return `:${this._name}`;
  }
}

export namespace PseudoClassSelector {
  export interface JSON<N extends string = string>
    extends WithName.JSON<"pseudo-class", N> {}
}
