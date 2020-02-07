import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import * as json from "@siteimprove/alfa-json";

/**
 * @see https://drafts.csswg.org/css-values/#functional-notations
 */
export class Function<
  N extends string = string,
  A extends Array<unknown> = Array<unknown>
> implements Equatable, Serializable {
  public static of<N extends string, A extends Array<unknown>>(
    name: N,
    args: A
  ): Function<N, A> {
    return new Function(name, args);
  }

  private readonly _name: N;
  private readonly _args: Array<unknown>;

  private constructor(name: N, args: A) {
    this._name = name;
    this._args = args;
  }

  public get type(): "function" {
    return "function";
  }

  public get name(): N {
    return this._name;
  }

  public get args(): A {
    return this._args as A;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Function &&
      value._name === this._name &&
      value._args.length === this._args.length &&
      value._args.every((arg, i) => Equatable.equals(arg, this._args[i]))
    );
  }

  public toString(): string {
    return `${this._name}(${this._args.join(", ")})`;
  }

  public toJSON(): Function.JSON {
    return {
      type: "function",
      name: this._name,
      args: this._args.map(Serializable.toJSON)
    };
  }
}

export namespace Function {
  export interface JSON {
    [key: string]: json.JSON;
    type: "function";
    name: string;
    args: Array<json.JSON>;
  }
}
