import {
  Angle,
  Keyword,
  Length,
  List,
  Matrix,
  Percentage,
  Perspective,
  Rotate,
  Scale,
  Skew,
  Transform,
  Translate,
} from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { map, either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Keyword<"none">
  | List<Matrix | Perspective | Rotate | Scale | Skew | Translate>;

/**
 * @internal
 */
export type Computed =
  | Keyword<"none">
  | List<
      | Matrix
      | Perspective<Length.Fixed<"px">>
      | Rotate<Angle<"deg">>
      | Scale
      | Skew<Angle<"deg">, Angle<"deg">>
      | Translate<
          Length.Fixed<"px"> | Percentage,
          Length.Fixed<"px"> | Percentage,
          Length.Fixed<"px">
        >
    >;

/**
 * @internal
 */
export const parse = either(
  Keyword.parse("none"),
  map(Transform.parseList, (transforms) => List.of(transforms))
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/transform}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (transform, style) =>
    transform.map((transform) => {
      switch (transform.type) {
        case "keyword":
          return transform;

        case "list":
          return List.of([
            ...Iterable.map(transform, (transform) => {
              switch (transform.kind) {
                case "matrix":
                  return transform;

                case "perspective":
                  return Perspective.of(
                    transform.depth.resolve(Resolver.length(style))
                  );

                case "rotate":
                  return Rotate.of(
                    transform.x,
                    transform.y,
                    transform.z,
                    transform.angle.withUnit("deg")
                  );

                case "scale":
                  return transform;

                case "skew":
                  return Skew.of(
                    transform.x.withUnit("deg"),
                    transform.y.withUnit("deg")
                  );

                case "translate":
                  return Translate.of(
                    transform.x.type === "percentage"
                      ? transform.x
                      : transform.x.resolve(Resolver.length(style)),

                    transform.y.type === "percentage"
                      ? transform.y
                      : transform.y.resolve(Resolver.length(style)),

                    transform.z.resolve(Resolver.length(style))
                  );
              }
            }),
          ]);
      }
    })
);
