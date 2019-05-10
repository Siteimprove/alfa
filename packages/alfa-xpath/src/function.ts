import { Map } from "@siteimprove/alfa-collection";
import { Environment } from "./environment";
import { Item, Sequence } from "./types";

export interface Function<
  P extends [...Array<Sequence.Value>] = [...Array<Sequence.Value>],
  R extends Sequence.Value = Sequence.Value
> {
  readonly prefix: string;
  readonly name: string;
  readonly parameters: { readonly [Q in keyof P]: Sequence.Type.Name<P[Q]> };
  readonly result: Sequence.Type.Name<R>;

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
  P extends [...Array<Sequence.Value>],
  R extends Sequence.Value
>(definition: Function<P, R>, parameters: Iterable<Iterable<Item>>): P | null {
  const result: P = ([] as unknown) as P;

  let index = 0;

  for (const parameter of parameters) {
    const value = coerceValue(parameter, definition.parameters[index++]);

    if (value === null) {
      return null;
    }

    result.push(value);
  }

  return result;
}

export function coerceValue<T extends Sequence.Value>(
  value: Iterable<Item>,
  type: Sequence.Type.Name<T>
): T | null {
  const items = [...value];

  switch (type) {
    case "node()":
      for (const item of items) {
        if (item.type === type) {
          return item.value as T;
        } else {
          return null;
        }
      }

      return null;

    case "node()?":
      for (const item of value) {
        if (item.type === type) {
          return item.value as T;
        } else {
          return null;
        }
      }

      return undefined as T;

    case "node()*":
      for (const item of items) {
        if (item.type !== type) {
          return null;
        }
      }

      return (items.map(item => item.value) as unknown) as T;
  }

  return null;
}
