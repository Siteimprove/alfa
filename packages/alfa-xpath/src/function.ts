import { Map } from "@siteimprove/alfa-collection";
import { Element } from "@siteimprove/alfa-dom";
import { Environment } from "./environment";
import { Tree } from "./tree";
import { Value } from "./types";

export interface TypeMap {
  "node()": Tree<Node>;
  "element()": Tree<Element>;
}

export type TypeName<T> = {
  [P in keyof TypeMap]: TypeMap[P] extends T ? P : never
}[keyof TypeMap];

export type FunctionParameters = [...Array<Value | Iterable<Value>>];

export type FunctionResult = Value | Iterable<Value>;

export interface Function<
  P extends FunctionParameters = FunctionParameters,
  R extends FunctionResult = FunctionResult
> {
  readonly prefix: string;
  readonly name: string;
  readonly parameters: { readonly [Q in keyof P]: TypeName<P[Q]> };
  readonly result: TypeName<R>;

  apply(environment: Environment, ...parameters: P): R;
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

export function coerceParameters<
  P extends FunctionParameters,
  R extends FunctionResult
>(definition: Function<P, R>, parameters: Iterable<Iterable<Value>>): P | null {
  const result: FunctionParameters = [];

  let index = 0;

  for (const parameter of parameters) {
    const value = coerceValue(parameter, definition.parameters[index++]);

    if (value === null) {
      return null;
    }

    result.push(value);
  }

  return (result as unknown) as P;
}

export function coerceValue<T extends Value | Iterable<Value>>(
  value: Iterable<Value>,
  type: TypeName<T>
): T | null {
  switch (type) {
    case "node()":
      for (const item of value) {
        return item as T;
      }
  }

  return null;
}
