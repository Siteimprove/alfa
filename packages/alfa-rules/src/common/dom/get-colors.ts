import { Diagnostic } from "@siteimprove/alfa-act";
import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Current, Percentage, RGB, System } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Err } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

import { getInterposedDescendant } from "./get-interposed-descendant";
import { isVisibleShadow } from "../../../../alfa-style/src/element/predicate/is-visible-shadow";

const { isElement } = Element;
const { isPositioned } = Style;

type Color = RGB<Percentage, Percentage>;

namespace Color {
  export function resolve(
    color: Color | Current | System,
    style: Style
  ): Option<Color> {
    switch (color.type) {
      case "keyword":
        if (color.value === "currentcolor") {
          color = style.computed("color").value;

          if (color.type === "color") {
            return Option.of(
              RGB.of(
                color.red,
                color.green,
                color.blue,
                Percentage.of(color.alpha.value)
              )
            );
          }
        }

        if (color.value === "canvastext") {
          return Option.of(
            RGB.of(
              Percentage.of(0),
              Percentage.of(0),
              Percentage.of(0),
              Percentage.of(1)
            )
          );
        }

        return None;

      case "color":
        return Option.of(
          RGB.of(
            color.red,
            color.green,
            color.blue,
            Percentage.of(color.alpha.value)
          )
        );
    }
  }

  /**
   * {@link https://drafts.fxtf.org/compositing-1/#simplealphacompositing}
   */
  export function composite(
    foreground: Color,
    background: Color,
    opacity: number
  ): Color {
    const foregroundOpacity = foreground.alpha.value * opacity;

    if (foregroundOpacity === 1) {
      return foreground;
    }

    const alpha = background.alpha.value * (1 - foregroundOpacity);

    const [red, green, blue] = [
      [foreground.red, background.red],
      [foreground.green, background.green],
      [foreground.blue, background.blue],
    ].map(([a, b]) => a.value * foregroundOpacity + b.value * alpha);

    return RGB.of(
      Percentage.of(red),
      Percentage.of(green),
      Percentage.of(blue),
      Percentage.of(foregroundOpacity + alpha)
    );
  }
}

class Layer {
  public static of(colors: Iterable<Color>, opacity: number): Layer {
    return new Layer(Array.from(colors), opacity);
  }

  private readonly _colors: ReadonlyArray<Color>;
  private readonly _opacity: number;

  private constructor(colors: ReadonlyArray<Color>, opacity: number) {
    this._colors = colors;
    this._opacity = opacity;
  }

  public get colors(): ReadonlyArray<Color> {
    return this._colors;
  }

  public get opacity(): number {
    return this._opacity;
  }
}

const layersCacheWithFakeOpacity = Cache.empty<
  Device,
  Cache<Context, Cache<Element, Result<Array<Layer>, ColorError<"layer">>>>
>();

const layersCacheWithDefaultOpacity = Cache.empty<
  Device,
  Cache<Context, Cache<Element, Result<Array<Layer>, ColorError<"layer">>>>
>();

function getLayers(
  element: Element,
  device: Device,
  context: Context = Context.empty(),
  opacity?: number
): Result<Array<Layer>, ColorError<"layer">> {
  const cache =
    opacity === 1 ? layersCacheWithFakeOpacity : layersCacheWithDefaultOpacity;

  return cache
    .get(device, Cache.empty)
    .get(context, Cache.empty)
    .get(element, () => {
      const style = Style.from(element, device, context);
      const backgroundColor = style.computed("background-color").value;
      const backgroundImage = style.computed("background-image").value;
      const backgroundSize = style.computed("background-size").value;

      const color = Color.resolve(backgroundColor, style);

      opacity = opacity ?? style.computed("opacity").value.value;

      const layers: Array<Layer> = [];

      if (color.isSome()) {
        layers.push(Layer.of([color.get()], opacity));
      } else {
        return Err.of(
          ColorError.unresolvableBackgroundColor(element, backgroundColor)
        );
      }

      for (const image of backgroundImage) {
        if (image.type === "keyword") {
          continue;
        }

        // We currently have no way of extracting colors from images, so we simply
        // bail out if we encounter a background image.
        if (image.image.type === "url") {
          return Err.of(
            ColorError.externalBackgroundImage(element, backgroundImage)
          );
        }

        // If there is a background-size, we currently have no way of guessing
        // whether it is large enough to go under the text or not.
        // So we simply bail out.
        if (!backgroundSize.equals(style.initial("background-size").value)) {
          return Err.of(ColorError.backgroundSize(element, backgroundSize));
        }

        // For each gradient, we extract all color stops into a background layer of
        // their own. As gradients need a start and an end point, there will always
        // be at least two color stops.
        const stops: Array<Color> = [];

        for (const item of image.image.items) {
          if (item.type === "stop") {
            const color = Color.resolve(item.color, style);

            if (color.isSome()) {
              stops.push(color.get());
            } else {
              return Err.of(
                ColorError.unresolvableGradientStop(
                  element,
                  backgroundImage,
                  item.color
                )
              );
            }
          }
        }

        layers.push(Layer.of(stops, opacity));
      }

      if (
        layers.length > 0 &&
        layers.every(
          (layer) =>
            layer.opacity === 1 &&
            layer.colors.every((color) => color.alpha.value === 1)
        )
      ) {
        return Result.of<Array<Layer>, ColorError<"layer">>(layers);
      }

      if (isPositioned(device, "absolute", "fixed")(element)) {
        return Err.of(
          ColorError.nonStaticPosition(
            element,
            style.computed("position").value
          )
        );
      }

      const interposedDescendants = getInterposedDescendant(device, element);
      if (!interposedDescendants.isEmpty()) {
        return Err.of(
          ColorError.interposedDescendants(element, interposedDescendants)
        );
      }

      // If the background layer does not have a lower layer that is fully opaque,
      // we need to also locate the background layers sitting behind the current
      // layer.

      // Only use the background layers from the parent if there is one. If there
      // isn't, this means we're at the root. In that case, we simply return the
      // layers we've found so far.
      for (const parent of element
        .parent({
          flattened: true,
        })
        .filter(isElement)) {
        // The opacity override only applies to the last layer, so it is not
        // used in the recursive calls
        return getLayers(parent, device, context).map((parentLayers) =>
          parentLayers.concat(layers)
        );
      }

      return Result.of<Array<Layer>, ColorError<"layer">>(layers);
    });
}

export type Foreground = Array<Color>;

const foregroundCache = Cache.empty<
  Device,
  Cache<Context, Cache<Element, Result<Foreground, ColorError>>>
>();

export function getForeground(
  element: Element,
  device: Device,
  context: Context = Context.empty()
): Result<Foreground, ColorError> {
  return foregroundCache
    .get(device, Cache.empty)
    .get(context, Cache.empty)
    .get(element, () => {
      const style = Style.from(element, device, context);
      const foregroundColor = style.computed("color").value;

      const color = Color.resolve(foregroundColor, style);

      if (color.isNone()) {
        return Err.of(
          ColorError.unresolvableForegroundColor(element, foregroundColor)
        );
      }

      const opacity = style.computed("opacity").value;

      // If the color is not transparent, and the element is fully opaque,
      // then we do not need to dig further
      if (color.get().alpha.value * opacity.value === 1) {
        return Result.of<Foreground, ColorError>([color.get()]);
      }

      const interposedDescendants = getInterposedDescendant(device, element);
      if (!interposedDescendants.isEmpty()) {
        return Err.of(
          ColorError.interposedDescendants(element, interposedDescendants)
        );
      }

      // First, we mix the color with the element's background according to the
      // color's alpha channel (only).
      // For this, we fake the opacity of the element at 1. That way, the
      // background color is correctly handled. The background color may itself have
      // an alpha channel, independently of its opacity, and this alpha channel
      // needs to be taken into account (as well as the alpha/opacity of all the
      // previous layers).
      const colors = getBackground(element, device, context, 1).map(
        (background) =>
          background.map((backdrop) =>
            Color.composite(color.get(), backdrop, 1)
          )
      );

      for (const parent of element
        .parent({
          flattened: true,
        })
        .filter(isElement)) {
        // Next, we handle the opacity of the element.
        // For this, we need the background colors of the parent (assuming that DOM
        // reflects layout).
        return colors.flatMap((colors) =>
          getBackground(parent, device, context).map((background) =>
            colors.flatMap((color) =>
              background.map((backdrop) =>
                Color.composite(color, backdrop, opacity.value)
              )
            )
          )
        );
      }

      return colors;
    });
}

export type Background = Array<Color>;

const backgroundCacheWithFakeOpacity = Cache.empty<
  Device,
  Cache<
    Context,
    Cache<Element, Result<Background, ColorError<"background" | "layer">>>
  >
>();

const backgroundCacheWithDefaultOpacity = Cache.empty<
  Device,
  Cache<
    Context,
    Cache<Element, Result<Background, ColorError<"background" | "layer">>>
  >
>();

export function getBackground(
  element: Element,
  device: Device,
  context: Context = Context.empty(),
  opacity?: number
): Result<Background, ColorError<"background" | "layer">> {
  const textShadow = Style.from(element, device, context).computed(
    "text-shadow"
  ).value;
  const cache =
    opacity === 1
      ? backgroundCacheWithFakeOpacity
      : backgroundCacheWithDefaultOpacity;
  return cache
    .get(device, Cache.empty)
    .get(context, Cache.empty)
    .get(element, () => {
      // We ignore invisible text-shadow
      if (textShadow.type !== "keyword" && isVisibleShadow(textShadow)) {
        return Err.of(ColorError.textShadow(element, textShadow));
      }

      const interposedDescendants = getInterposedDescendant(device, element);
      if (!interposedDescendants.isEmpty()) {
        return Err.of(
          ColorError.interposedDescendants(element, interposedDescendants)
        );
      }

      return getLayers(element, device, context, opacity).map((layers) =>
        layers.reduce(
          (backdrops, layer) =>
            layer.colors.reduce(
              (layers, color) =>
                layers.concat(
                  backdrops.map((backdrop) =>
                    Color.composite(color, backdrop, layer.opacity)
                  )
                ),
              [] as Array<Color>
            ),
          // We make the initial backdrop solid white as this can be assumed
          // to be the color of the canvas onto which the other backgrounds
          // are rendered.
          [
            RGB.of(
              Percentage.of(1),
              Percentage.of(1),
              Percentage.of(1),
              Percentage.of(1)
            ),
          ]
        )
      );
    });
}

// Extended diagnostic for getColor

interface ErrorName {
  layer:
    | "unresolvable-background-color"
    | "unresolvable-gradient"
    | "background-size"
    | "background-image"
    | "non-static"
    | "interposed-descendant";
  foreground: "unresolvable-foreground-color";
  background: "text-shadow";
}

/**
 * @internal
 */
export abstract class ColorError<
  T extends keyof ErrorName = keyof ErrorName,
  K extends ErrorName[T] = ErrorName[T]
> extends Diagnostic {
  protected readonly _element: Element;
  protected readonly _type: T;
  protected readonly _kind: K;

  protected constructor(message: string, element: Element, type: T, kind: K) {
    super(message);
    this._element = element;
    this._type = type;
    this._kind = kind;
  }

  public get element(): Element {
    return this._element;
  }

  public get type(): T {
    return this._type;
  }

  public get kind(): K {
    return this._kind;
  }

  public equals(value: ColorError): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof ColorError &&
      value._message === this._message &&
      value._element.equals(this._element) &&
      value._type === this._type &&
      value._kind === this._kind
    );
  }

  public toJSON(): ColorError.JSON<T, K> {
    return {
      ...super.toJSON(),
      element: this._element.toJSON(),
      type: this._type,
      kind: this._kind,
    };
  }
}

/**
 * @internal
 */
export namespace ColorError {
  export interface JSON<
    T extends keyof ErrorName = keyof ErrorName,
    K extends ErrorName[T] = ErrorName[T]
  > extends Diagnostic.JSON {
    element: Element.JSON;
    type: T;
    kind: K;
  }

  export function isColorError<
    T extends keyof ErrorName = keyof ErrorName,
    K extends ErrorName[T] = ErrorName[T]
  >(value: Diagnostic): value is ColorError<T, K>;

  export function isColorError<
    T extends keyof ErrorName = keyof ErrorName,
    K extends ErrorName[T] = ErrorName[T]
  >(value: unknown): value is ColorError<T, K>;

  export function isColorError<
    T extends keyof ErrorName = keyof ErrorName,
    K extends ErrorName[T] = ErrorName[T]
  >(value: unknown): value is ColorError<T, K> {
    return value instanceof ColorError;
  }

  /**
   * @internal
   * Most color error are just about one CSS property.
   */
  export class WithProperty<
    T extends keyof ErrorName,
    K extends ErrorName[T],
    N extends
      | "background-color"
      | "background-image"
      | "background-size"
      | "color"
      | "position"
      | "text-shadow"
  > extends ColorError<T, K> {
    public static of(message: string): Diagnostic;

    public static of<
      T extends keyof ErrorName,
      K extends ErrorName[T],
      N extends
        | "background-color"
        | "background-image"
        | "background-size"
        | "color"
        | "position"
        | "text-shadow"
    >(
      message: string,
      diagnostic: {
        type: T;
        kind: K;
        element: Element;
        property: N;
        value: Style.Computed<N>;
      }
    ): WithProperty<T, K, N>;

    public static of<
      T extends keyof ErrorName,
      K extends ErrorName[T],
      N extends
        | "background-color"
        | "background-image"
        | "background-size"
        | "color"
        | "position"
        | "text-shadow"
    >(
      message: string,
      diagnostic?: {
        type: T;
        kind: K;
        element: Element;
        property: N;
        value: Style.Computed<N>;
      }
    ): Diagnostic {
      return diagnostic !== undefined
        ? new WithProperty(
            message,
            diagnostic.type,
            diagnostic.kind,
            diagnostic.element,
            diagnostic.property,
            diagnostic.value
          )
        : Diagnostic.of(message);
    }

    private readonly _property: N;
    private readonly _value: Style.Computed<N>;

    protected constructor(
      message: string,
      type: T,
      kind: K,
      element: Element,
      proprety: N,
      value: Style.Computed<N>
    ) {
      super(message, element, type, kind);
      this._property = proprety;
      this._value = value;
    }

    get property(): N {
      return this._property;
    }

    get value(): Style.Computed<N> {
      return this._value;
    }

    public equals(value: WithProperty<T, K, N>): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        super.equals(value) &&
        value instanceof WithProperty &&
        value._property === this._property &&
        Equatable.equals(value._value, this._value)
      );
    }

    public toJSON(): WithProperty.JSON<T, K, N> {
      return {
        ...super.toJSON(),
        property: this._property,
        value: Serializable.toJSON(this._value),
      };
    }
  }

  /**
   * @internal
   */
  export namespace WithProperty {
    export interface JSON<
      T extends keyof ErrorName,
      K extends ErrorName[T],
      N extends
        | "background-color"
        | "background-image"
        | "background-size"
        | "color"
        | "position"
        | "text-shadow"
    > extends ColorError.JSON<T, K> {
      property: N;
      value: Serializable.ToJSON<Style.Computed<N>>;
    }

    export function from<
      T extends keyof ErrorName,
      K extends ErrorName[T],
      N extends
        | "background-color"
        | "background-image"
        | "background-size"
        | "color"
        | "position"
        | "text-shadow"
    >(
      type: T,
      kind: K,
      property: N,
      message: string
    ): (element: Element, value: Style.Computed<N>) => WithProperty<T, K, N> {
      return (element, value) =>
        WithProperty.of(message, { type, kind, element, property, value });
    }

    export function isWithProperty<
      T extends keyof ErrorName,
      K extends ErrorName[T],
      N extends
        | "background-color"
        | "background-image"
        | "background-size"
        | "color"
        | "position"
        | "text-shadow"
    >(value: Diagnostic): value is WithProperty<T, K, N>;

    export function isWithProperty<
      T extends keyof ErrorName,
      K extends ErrorName[T],
      N extends
        | "background-color"
        | "background-image"
        | "background-size"
        | "color"
        | "position"
        | "text-shadow"
    >(value: unknown): value is WithProperty<T, K, N>;

    export function isWithProperty<
      T extends keyof ErrorName,
      K extends ErrorName[T],
      N extends
        | "background-color"
        | "background-image"
        | "background-size"
        | "color"
        | "position"
        | "text-shadow"
    >(value: unknown): value is WithProperty<T, K, N> {
      return value instanceof WithProperty;
    }
  }

  export const { isWithProperty } = WithProperty;

  export const unresolvableBackgroundColor = WithProperty.from(
    "layer",
    "unresolvable-background-color",
    "background-color",
    "Could not resolve background-color"
  );

  export const backgroundSize = WithProperty.from(
    "layer",
    "background-size",
    "background-size",
    "A background-size was encountered"
  );

  export const externalBackgroundImage = WithProperty.from(
    "layer",
    "background-image",
    "background-image",
    "A background-image with a url() was encountered"
  );

  export const nonStaticPosition = WithProperty.from(
    "layer",
    "non-static",
    "position",
    "A non-statically positioned element was encountered"
  );

  export const unresolvableForegroundColor = WithProperty.from(
    "foreground",
    "unresolvable-foreground-color",
    "color",
    "Could not resolve foreground color"
  );

  export const textShadow = WithProperty.from(
    "background",
    "text-shadow",
    "text-shadow",
    "A text-shadow was encountered"
  );

  /**
   * @internal
   * We want both the value of background-image and the unresolvable stop
   */
  export class HasUnresolvableGradientStop extends WithProperty<
    "layer",
    "unresolvable-gradient",
    "background-image"
  > {
    public static create(
      element: Element,
      value: Style.Computed<"background-image">,
      color: Color | Current | System
    ): HasUnresolvableGradientStop {
      return new HasUnresolvableGradientStop(element, value, color);
    }

    private readonly _color: Color | Current | System;

    private constructor(
      element: Element,
      value: Style.Computed<"background-image">,
      color: Color | Current | System
    ) {
      super(
        "Could not resolve gradient color stop",
        "layer",
        "unresolvable-gradient",
        element,
        "background-image",
        value
      );
      this._color = color;
    }

    public get color(): Color | Current | System {
      return this._color;
    }

    public equals(value: HasUnresolvableGradientStop): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        super.equals(value) &&
        value instanceof HasUnresolvableGradientStop &&
        value._color.equals(this._color)
      );
    }

    public toJSON(): HasUnresolvableGradientStop.JSON {
      return {
        ...super.toJSON(),
        color: this._color.toJSON(),
      };
    }
  }

  /**
   * @internal
   */
  export namespace HasUnresolvableGradientStop {
    export interface JSON
      extends WithProperty.JSON<
        "layer",
        "unresolvable-gradient",
        "background-image"
      > {
      color: Serializable.ToJSON<Color | Current | System>;
    }

    export function isUnresolvableGradientStop(
      value: Diagnostic
    ): value is HasUnresolvableGradientStop;

    export function isUnresolvableGradientStop(
      value: unknown
    ): value is HasUnresolvableGradientStop;

    export function isUnresolvableGradientStop(
      value: unknown
    ): value is HasUnresolvableGradientStop {
      return value instanceof HasUnresolvableGradientStop;
    }
  }

  export const {
    create: unresolvableGradientStop,
    isUnresolvableGradientStop,
  } = HasUnresolvableGradientStop;

  /**
   * @internal
   * This one does not depend on a CSS property, but on some other elements
   */
  export class HasInterposedDescendants extends ColorError<
    "layer",
    "interposed-descendant"
  > {
    public static of(message: string): Diagnostic;

    public static of(
      message: string,
      element: Element,
      positionDescendants: Iterable<Element>
    ): HasInterposedDescendants;

    public static of(
      message: string,
      element?: Element,
      positionDescendants?: Iterable<Element>
    ): Diagnostic {
      return element !== undefined && positionDescendants !== undefined
        ? new HasInterposedDescendants(
            message,
            element,
            Sequence.from(positionDescendants)
          )
        : Diagnostic.of(message);
    }

    private readonly _positionedDescendants: Sequence<Element>;

    private constructor(
      message: string,
      element: Element,
      positionedDescendants: Sequence<Element>
    ) {
      super(message, element, "layer", "interposed-descendant");
      this._positionedDescendants = positionedDescendants;
    }

    public get positionedDescendants(): Iterable<Element> {
      return this._positionedDescendants;
    }

    public equals(value: HasInterposedDescendants): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        super.equals(value) &&
        value instanceof HasInterposedDescendants &&
        value._positionedDescendants.equals(this._positionedDescendants)
      );
    }

    public toJSON(): HasInterposedDescendants.JSON {
      return {
        ...super.toJSON(),
        positionedDescendants: this._positionedDescendants.toJSON(),
      };
    }
  }

  /**
   * @internal
   */
  export namespace HasInterposedDescendants {
    export interface JSON
      extends ColorError.JSON<"layer", "interposed-descendant"> {
      positionedDescendants: Sequence.JSON<Element>;
    }

    export function from(
      offsetParent: Element,
      positionedDescendants: Iterable<Element>
    ): HasInterposedDescendants {
      return HasInterposedDescendants.of(
        "An interposed descendant element was encountered",
        offsetParent,
        positionedDescendants
      );
    }

    export function isInterposedDescendants(
      value: Diagnostic
    ): value is HasInterposedDescendants;

    export function isInterposedDescendants(
      value: unknown
    ): value is HasInterposedDescendants;

    export function isInterposedDescendants(
      value: unknown
    ): value is HasInterposedDescendants {
      return value instanceof HasInterposedDescendants;
    }
  }

  export const { from: interposedDescendants, isInterposedDescendants } =
    HasInterposedDescendants;
}
