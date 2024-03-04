import { Keyword, Numeric } from "@siteimprove/alfa-css";
import { String } from "@siteimprove/alfa-string";
import { Longhands, Shorthands, Style } from "@siteimprove/alfa-style";

type Name = Longhands.Name | Shorthands.Name;

/**
 * @internal
 *
 * CSS properties serialisation helpers.
 * These may be better suited with the actual properties in alfa-style.
 **/
export namespace Serialise {
  // Trying to reduce the footprint of the result by exporting shorthands
  // rather than longhands, and avoiding to export values that are the same
  // as the initial value of the property.
  export function borderShorthand(
    style: Style,
    property: "color" | "style" | "width",
  ): readonly [Name, string] {
    const shorthand = `border-${property}` as const;

    function getLongHand(side: "top" | "right" | "bottom" | "left"): string {
      return style.computed(`border-${side}-${property}`).toString();
    }

    let top = getLongHand("top");
    let right = getLongHand("right");
    let bottom = getLongHand("bottom");
    let left = getLongHand("left");

    if (left === right) {
      left = "";
      if (bottom === top) {
        bottom = "";
        if (right === top) {
          right = "";
          if (
            top === Longhands.get(`border-top-${property}`).initial.toString()
          ) {
            top = "";
          }
        }
      }
    }

    return [shorthand, `${top} ${right} ${bottom} ${left}`.trim()];
  }

  export function getLonghand(style: Style, name: Longhands.Name): string {
    const property = style.computed(name).toString();

    return property === Longhands.get(name).initial.toString() ? "" : property;
  }

  export function outline(style: Style): string {
    return String.normalize(
      (["color", "style", "width"] as const)
        .map((property) => getLonghand(style, `outline-${property}`))
        .join(" "),
    );
  }

  // While text-decoration-style and text-decoration-thickness are not
  // important for deciding if there is a text-decoration, they are important
  // for rendering the link with the correct styling.
  export function textDecoration(style: Style): string {
    return String.normalize(
      (["line", "color", "style", "thickness"] as const)
        .map((property) => getLonghand(style, `text-decoration-${property}`))
        .join(" "),
    );
  }

  export function boxShadow(style: Style): string {
    const boxShadow = style.computed("box-shadow").value;

    if (Keyword.isKeyword(boxShadow)) {
      return "";
    }

    const serializedShadows: Array<string> = [];

    for (const shadow of boxShadow) {
      const { vertical, horizontal, blur, spread, isInset, color } = shadow;
      const omitBlur = Numeric.isZero(spread) && Numeric.isZero(blur);
      const omitSpread = Numeric.isZero(spread);
      const blurToString = omitBlur ? "" : blur.toString();
      const spreadToString = omitSpread ? "" : spread.toString();
      const insetToString = isInset ? "inset" : "";
      const colorToString = Keyword.isKeyword(color) ? "" : `${color}`;
      const serialized = String.normalize(
        `${horizontal.toString()} ${vertical.toString()} ${blurToString} ${spreadToString} ${colorToString} ${insetToString}`,
      );
      serializedShadows.push(serialized);
    }

    return serializedShadows.join(", ");
  }

  export function font(style: Style): string {
    const optional = (["style", "weight"] as const)
      .map((property) => getLonghand(style, `font-${property}`))
      .join(" ");

    const size = style.computed("font-size");
    const family = style.computed("font-family");

    if (optional !== " ") {
      // Optional properties were changed, need to output the mandatory ones.
      return String.normalize(`${optional} ${size} ${family}`);
    }

    if (
      size.value.equals(Longhands.get("font-size").initial.value) &&
      family.value.values[0].equals(
        Longhands.get("font-family").initial.values[0],
      )
    ) {
      // Both mandatory properties are set to their initial values.
      // Since optional properties also are, we can skip `font` altogether.
      return "";
    }

    // Optional properties were not changed but some mandatory ones were.
    return String.normalize(`${size} ${family}`);
  }

  // Only background-color and background-image are used for deciding if the
  // link is distinguishable, but all longhands are needed for rendering it
  // with the correct style.
  export function background(style: Style): string {
    // Most properties are layered and need special handling.
    const attachment = style.computed("background-attachment").value.values;
    const clip = style.computed("background-clip").value.values;
    const image = style.computed("background-image").value.values;
    const origin = style.computed("background-origin").value.values;
    const positionX = style.computed("background-position-x").value.values;
    const positionY = style.computed("background-position-y").value.values;
    const repeatX = style.computed("background-repeat-x").value.values;
    const repeatY = style.computed("background-repeat-y").value.values;
    const size = style.computed("background-size").value.values;

    function getValue<T>(
      array: ReadonlyArray<T>,
      n: number,
      property?: Longhands.Name,
    ): string {
      // Longhands with missing layers use the same value as their first layer
      const value = `${array?.[n] ?? array[0]}`;

      if (property === undefined) {
        return value;
      }

      return value === Longhands.get(property).initial.toString() ? "" : value;
    }

    function getSize(n: number): string {
      const value = getValue(size, n, "background-size");

      return value === "" ? "" : " / " + value;
    }

    function getPosition(n: number): string {
      const posX = getValue(positionX, n, "background-position-x");
      const posY = getValue(positionY, n, "background-position-y");

      // If there is a posY, we need to keep posX anyway
      const value = (posX === "" && posY !== "" ? "0px" : posX) + " " + posY;

      // If there is a size, we need to keep a position anyway
      // size does contain a leading space.
      // value hasn't been trimmed and contains one space if empty.
      const size = getSize(n);
      return size === "" ? value : (value === " " ? "0px 0px" : value) + size;
    }

    function getRepeat(n: number): string {
      // Due to the one value syntax, we can't easily fallback on initial value.
      const value = getValue(repeatX, n) + " " + getValue(repeatY, n);

      switch (value) {
        case "repeat no-repeat":
          return "repeat-x";
        case "no-repeat repeat":
          return "repeat-y";
        case "repeat repeat":
          return ""; // initial value
        case "space space":
          return "space";
        case "round round":
          return "round";
        case "no-repeat no-repeat":
          return "no-repeat";
        default:
          return value;
      }
    }

    function getBoxes(n: number): string {
      const originBox = getValue(origin, n);
      const clipBox = getValue(clip, n);

      return originBox === clipBox
        ? // Since they have different initial value, they can't be both at their
        // initial value and therefore we need to output something
        originBox
        : originBox === Longhands.get("background-origin").initial.toString() &&
          clipBox === Longhands.get("background-clip").initial.toString()
          ? // They are both at their initial value and nothing is needed
          ""
          : // They are different and at least one is not initial, hence needed;
          // we can't skip one without the remaining value leaking to both.
          originBox + " " + clipBox;
    }

    function getLayer(n: number): string {
      const imageValue = getValue(image, n);

      // If there is no image the rest doesn't matter (color is handled later).
      return imageValue === "none"
        ? ""
        : `${imageValue} ${getPosition(n)} ${getRepeat(n)} ${getValue(
          attachment,
          n,
          "background-attachment",
        )} ${getBoxes(n)}`;
    }

    const layers = image.map((_, i) => getLayer(i));

    // `background-color` is added to the last layer
    layers[layers.length - 1] =
      getLonghand(style, "background-color") + " " + layers[layers.length - 1];

    return layers
      .map((input) => String.normalize(input, true))
      .filter((layer) => layer !== "")
      .join(", ");
  }
}
