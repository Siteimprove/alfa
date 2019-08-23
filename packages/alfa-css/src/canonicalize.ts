import { Converters } from "./converters";
import { Units } from "./units";
import { Value, Values } from "./values";

// prettier-ignore
export type Canonical<V extends Value> =
  V extends Values.Length<Units.AbsoluteLength> ? Values.Length<"px"> :
  V extends Values.Angle ? Values.Angle<"deg"> :
  V extends Values.List<infer V> ? Canonical.List<V> :
  V extends Values.Function<infer N, infer A> ? Canonical.Function<N, A> :
  V;

export namespace Canonical {
  export type Object<T> = {
    [K in keyof T]: T[K] extends Value ? Canonical<T[K]> : T[K];
  };

  export interface List<V extends Value> extends Values.List<Canonical<V>> {}

  export interface Function<
    N extends Values.Function.Name,
    A extends Values.Function.Arguments
  > extends Values.Function<N, Object<A>> {}
}

export function canonicalize<V extends Value>(value: V): Canonical<V>;

export function canonicalize(value: Value): Value {
  if (Values.isLength(value)) {
    if (Units.isRelativeLength(value.unit)) {
      return Values.length(value.value, value.unit);
    }

    return Values.length(
      Converters.length(value.value, value.unit, "px"),
      "px"
    );
  }

  if (Values.isAngle(value)) {
    return Values.angle(
      Converters.angle(value.value, value.unit, "deg"),
      "deg"
    );
  }

  if (Values.isList(value)) {
    return Values.list(...value.value.map(canonicalize));
  }

  if (Values.isFunction(value)) {
    return Values.func(
      value.value.name,
      value.value.args.map(canonicalize) as any // tslint:disable-line:no-any
    );
  }

  return value;
}
