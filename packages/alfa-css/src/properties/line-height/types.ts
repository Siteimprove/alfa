import { Values } from "../../values";

export type LineHeight =
  | Values.Keyword<"normal">
  | Values.Number
  | Values.Length
  | Values.Percentage;
