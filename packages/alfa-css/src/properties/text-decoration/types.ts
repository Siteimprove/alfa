import { Values } from "../../values";

export type TextDecorationLine = Values.Keyword<
  "none" | "underline" | "overline" | "line-through" | "blink"
>;

export type TextDecorationStyle = Values.Keyword<
  "none" | "solid" | "double" | "dotted" | "dashed" | "wavy"
>;
