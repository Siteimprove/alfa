import { Values } from "../../values";

export type Content =
  | Values.Keyword<"normal" | "none">
  | Values.List<Values.String>;
