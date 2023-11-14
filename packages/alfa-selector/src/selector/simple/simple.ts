import { Selector } from "../selector";

/**
 * @internal
 */
export abstract class Simple<
  T extends string = string,
  N extends string = string,
> extends Selector<T> {
  private readonly _name: N;
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
}
