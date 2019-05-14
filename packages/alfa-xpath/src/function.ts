import { Map } from "@siteimprove/alfa-collection";
import { Environment } from "./environment";
import { TypeFor, Value } from "./types";

export interface Function<
  P extends [...Array<Value>] = [...Array<Value>],
  R extends Value = Value
> {
  readonly prefix: string;
  readonly name: string;
  readonly parameters: Function.Parameters<P>;
  readonly result: Function.Result<R>;

  apply(environment: Environment, ...parameters: P): R;
}

export namespace Function {
  export type Parameters<V extends [...Array<Value>]> = {
    readonly [P in keyof V]: V[P] extends Value ? TypeFor<V[P]> : never
  };

  export type Result<V extends Value> = TypeFor<V>;
}

export type FunctionMap = Map<string, Map<number, Function>>;

export function lookupFunction(
  functions: FunctionMap,
  prefix: string | null,
  name: string,
  arity: number
): Function | null {
  const definitions = functions.get(`${prefix}:${name}`);

  if (definitions === undefined) {
    return null;
  }

  const definition = definitions.get(arity);

  if (definition === undefined) {
    return null;
  }

  return definition;
}

export function registerFunction(
  functions: FunctionMap,
  definition: Function
): FunctionMap {
  const { prefix, name, parameters } = definition;
  const arity = parameters.length;

  let definitions = functions.get(`${prefix}:${name}`);

  if (definitions === undefined) {
    definitions = Map();
  }

  return functions.set(`${prefix}:${name}`, definitions.set(arity, definition));
}
