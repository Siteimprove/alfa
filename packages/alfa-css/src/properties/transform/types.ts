import { Values } from "../../values";

export type Transform =
  | Values.Keyword<"none">
  | Values.List<Transform.Function>;

export namespace Transform {
  export type Function =
    | Values.Function<"rotate", [Values.Angle]>
    | Values.Function<
        "matrix",
        [
          Values.Number,
          Values.Number,
          Values.Number,
          Values.Number,
          Values.Number,
          Values.Number
        ]
      >
    | Values.Function<
        "translate",
        [
          Values.Length | Values.Percentage,
          (Values.Length | Values.Percentage)?
        ]
      >;
}
