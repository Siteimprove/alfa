import { Keyword } from "./keyword";

type Keywordify<T extends string> = { [K in T]: Keyword<K> }[T];

export namespace Box {
  /**
   * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-box
   **/
  export type BoxName = "border-box" | "padding-box" | "content-box";
  export const box: ReadonlyArray<BoxName> = [
    "border-box",
    "padding-box",
    "content-box",
  ];
  export type Box = Keywordify<BoxName>;

  /**
   * @see https://drafts.csswg.org/css-shapes-1/#typedef-shape-box
   */
  export type ShapeBoxName = BoxName | "margin-box";
  export const shapeBox: ReadonlyArray<ShapeBoxName> = [...box, "margin-box"];
  export type ShapeBox = Keywordify<ShapeBoxName>;

  /**
   * @see https://drafts.fxtf.org/css-masking/#typedef-geometry-box
   *
   * fill-box and stroke-box seem to have poor browser support.
   */
  export type GeometryBoxName =
    | ShapeBoxName
    | "fill-box"
    | "stroke-box"
    | "view-box";
  export const geometryBox: ReadonlyArray<GeometryBoxName> = [
    ...shapeBox,
    "fill-box",
    "stroke-box",
    "view-box",
  ];
  export type GeometryBox = Keywordify<GeometryBoxName>;
}
