import { Values } from "../../values";

export type Transform = Transform.None | Values.List<Transform.Function>;

export namespace Transform {
  export type None = Values.Keyword<"none">;

  export type Matrix = Values.Function<
    "matrix",
    [Values.Number, ...Array<Values.Number>] & { readonly length: 16 }
  >;

  export type Rotate = Values.Function<"rotate", [Values.Angle]>;

  export type Translate = Values.Function<
    "translate",
    | [Values.Length | Values.Percentage]
    | [Values.Length | Values.Percentage, Values.Length | Values.Percentage]
  >;

  export type Function = Matrix | Rotate | Translate;
}
