import {
  Angle,
  Function,
  Keyword,
  Length,
  Percentage
} from "@siteimprove/alfa-css";

import { Property } from "../property";

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

export const Transform: Property<Transform> = Property.of(
  Keyword.of("none"),
  Keyword.parse("none"),
  style => style.specified("transform")
);
