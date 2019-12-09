import { Property } from "../property";
import { Angle } from "../value/angle";
import { Function } from "../value/function";
import { Keyword } from "../value/keyword";
import { Length } from "../value/length";
import { Percentage } from "../value/percentage";

export namespace Transform {
  export type None = Keyword<"none">;

  export type Matrix = Function<
    "matrix",
    [
      [number, number, number, number],
      [number, number, number, number],
      [number, number, number, number],
      [number, number, number, number]
    ]
  >;

  export type Rotate = Function<"rotate", [number, number, number, Angle]>;

  export type Translate = Function<
    "translate",
    [Length | Percentage, Length | Percentage]
  >;
}

export type Transform =
  | Transform.None
  | Iterable<Transform.Matrix | Transform.Rotate | Transform.Translate>;

const Transform: Property<Transform> = Property.of(
  Keyword.of("none"),
  Keyword.parse("none"),
  style => style.specified("transform")
);

export default Transform;
