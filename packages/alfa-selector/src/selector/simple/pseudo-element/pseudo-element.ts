import { WithName } from "../../selector";

export abstract class PseudoElementSelector<
  N extends string = string,
> extends WithName<"pseudo-element", N> {
  protected constructor(name: N) {
    super("pseudo-element", name);
  }

  public equals(value: PseudoElementSelector): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof PseudoElementSelector && super.equals(value);
  }

  public toJSON(): PseudoElementSelector.JSON<N> {
    return {
      ...super.toJSON(),
    };
  }

  public toString(): string {
    return `::${this._name}`;
  }
}

export namespace PseudoElementSelector {
  export interface JSON<N extends string = string>
    extends WithName.JSON<"pseudo-element", N> {}
}
