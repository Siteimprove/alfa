import { Values } from "../../values";

export type Color =
  | Values.Keyword<"transparent">
  | Color.Hex
  | Color.Named
  | Color.RGB
  | Color.HSL;

export namespace Color {
  export type Hex = Values.Number;

  export type Named = Values.String;

  export type RGB = Values.Function<
    "rgb",
    [
      Values.Number | Values.Percentage,
      Values.Number | Values.Percentage,
      Values.Number | Values.Percentage,
      (Values.Number | Values.Percentage)?
    ]
  >;

  export type HSL = Values.Function<
    "hsl",
    [
      Values.Number | Values.Angle,
      Values.Percentage,
      Values.Percentage,
      (Values.Number | Values.Percentage)?
    ]
  >;
}
