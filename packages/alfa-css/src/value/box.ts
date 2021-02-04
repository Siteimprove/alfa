import { Keyword } from "./keyword";

type Keywordify<T extends string> = { [K in T]: Keyword<K> }[T];

export namespace Box {
  /**
   * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-box
   **/
  type BoxString = "border-box" | "padding-box" | "content-box";
  export const box: ReadonlyArray<BoxString> = [
    "border-box",
    "padding-box",
    "content-box",
  ];
  export type Box = Keywordify<BoxString>;

  /**
   * @see https://drafts.csswg.org/css-shapes-1/#typedef-shape-box
   */
  type ShapeBoxString = BoxString | "margin-box";
  export const shapeBox: ReadonlyArray<ShapeBoxString> = [...box, "margin-box"];
  export type ShapeBox = Keywordify<ShapeBoxString>;

  /**
   * @see https://drafts.fxtf.org/css-masking/#typedef-geometry-box
   */
  type GeometryBoxString =
    | ShapeBoxString
    | "fill-box"
    | "stroke-box"
    | "view-box";
  export const geometryBox: ReadonlyArray<GeometryBoxString> = [
    ...shapeBox,
    "fill-box",
    "stroke-box",
    "view-box",
  ];
  export type GeometryBox = Keywordify<GeometryBoxString>;
}
