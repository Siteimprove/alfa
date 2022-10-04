import { Diagnostic } from "@siteimprove/alfa-act";
import { Array } from "@siteimprove/alfa-array";
import { Current, Percentage, RGB, System } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

type Color = RGB<Percentage, Percentage>;

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
export class ColorErrors<
  T extends keyof ErrorName = keyof ErrorName
> extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of<T extends keyof ErrorName = keyof ErrorName>(
    errors: ReadonlyArray<ColorError<T>>
  ): ColorErrors<T>;

  public static of<T extends keyof ErrorName = keyof ErrorName>(
    messageOrErrors: string | ReadonlyArray<ColorError<T>>
  ): Diagnostic {
    return typeof messageOrErrors === "string"
      ? Diagnostic.of(messageOrErrors)
      : new ColorErrors(
          "Could not fully resolve colors",
          Array.copy(messageOrErrors)
        );
  }

  private readonly _errors: ReadonlyArray<ColorError<T>>;

  private constructor(message: string, errors: ReadonlyArray<ColorError<T>>) {
    super(message);
    this._errors = errors;
  }

  public get errors(): ReadonlyArray<ColorError<T>> {
    return this._errors;
  }

  public equals(value: ColorErrors): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof ColorErrors &&
      value._message === this._message &&
      Array.equals(value._errors, this._errors)
    );
  }

  public toJSON(): ColorErrors.JSON<T> {
    return { ...super.toJSON(), errors: Array.toJSON(this._errors) };
  }
}

/**
 * @internal
 */
export namespace ColorErrors {
  export interface JSON<T extends keyof ErrorName = keyof ErrorName>
    extends Diagnostic.JSON {
    errors: Array<ColorError.JSON<T>>;
  }

  export function isColorErrors<T extends keyof ErrorName = keyof ErrorName>(
    value: Diagnostic
  ): value is ColorErrors<T>;

  export function isColorErrors<T extends keyof ErrorName = keyof ErrorName>(
    value: unknown
  ): value is ColorErrors<T>;

  export function isColorErrors<T extends keyof ErrorName = keyof ErrorName>(
    value: unknown
  ): value is ColorErrors<T> {
    return value instanceof ColorErrors;
  }

  export function prepend<
    T extends keyof ErrorName = keyof ErrorName,
    T1 extends T = T,
    T2 extends T = T
  >(
    old: Result<unknown, ColorErrors<T1>>,
    cur: Iterable<ColorError<T2>>
  ): ColorErrors<T> {
    return ColorErrors.of<T>([
      ...cur,
      ...old
        .err()
        .map((old) => old.errors)
        .getOr([]),
    ]);
  }
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
