import type { Environment } from "./environment.js";
import type { evaluate } from "./evaluate.js";
import type { Item, TypeFor, Value } from "./types.js";

/**
 * @internal
 */
export interface Function<
  P extends Array<Value> = Array<Value>,
  R extends Value = Value,
> {
  readonly prefix: string;
  readonly name: string;
  readonly parameters: Function.Parameters<P>;
  readonly result: Function.Result<R>;

  apply<T extends Item.Value>(
    environment: Environment<T>,
    options: evaluate.Options,
    ...parameters: P
  ): R;
}

/**
 * @internal
 */
export namespace Function {
  export type Parameters<V extends Array<Value>> = {
    // https://github.com/microsoft/TypeScript/issues/49517#issuecomment-1154234114
    readonly [P in keyof V]: V[P] extends infer T extends Value
      ? TypeFor<T>
      : never;
  };

  export type Result<V extends Value> = TypeFor<V>;
}

/**
 * @internal
 */
export type FunctionMap = Map<string, Map<number, Function>>;

/**
 * @internal
 */
export function lookupFunction(
  functions: FunctionMap,
  prefix: string | null,
  name: string,
  arity: number,
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

/**
 * @internal
 */
export function registerFunction(
  functions: FunctionMap,
  definition: Function,
): FunctionMap {
  const { prefix, name, parameters } = definition;
  const arity = parameters.length;

  let definitions = functions.get(`${prefix}:${name}`);

  if (definitions === undefined) {
    definitions = new Map();
  }

  return functions.set(`${prefix}:${name}`, definitions.set(arity, definition));
}
