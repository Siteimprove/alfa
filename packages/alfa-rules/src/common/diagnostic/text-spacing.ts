import { Diagnostic } from "@siteimprove/alfa-act";
import { Length } from "@siteimprove/alfa-css";
import { Declaration, Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Property, Style } from "@siteimprove/alfa-style";

/**
 * @internal
 */
export class TextSpacing<N extends Property.Name> extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of<N extends Property.Name>(
    message: string,
    property: N,
    value: Length<"px">,
    fontSize: Style.Computed<"font-size">,
    ratio: number,
    threshold: number,
    declaration: Declaration,
    owner: Element
  ): TextSpacing<N>;

  public static of<N extends Property.Name>(
    message: string,
    property?: N,
    value?: Style.Computed<N>,
    fontSize?: Style.Computed<"font-size">,
    ratio?: number,
    threshold?: number,
    declaration?: Declaration,
    owner?: Element
  ): Diagnostic {
    return property === undefined
      ? Diagnostic.of(message)
      : new TextSpacing(
          message,
          property,
          value!,
          fontSize!,
          ratio!,
          threshold!,
          declaration!,
          owner!
        );
  }

  private readonly _property: N;
  private readonly _value: Style.Computed<N>;
  private readonly _fontSize: Style.Computed<"font-size">;
  private readonly _ratio: number;
  private readonly _threshold: number;
  // The bad declaration in the style attribute
  private readonly _declaration: Declaration;
  // The element with the bad style attribute
  private readonly _owner: Element;

  private constructor(
    message: string,
    property: N,
    value: Style.Computed<N>,
    fontSize: Style.Computed<"font-size">,
    ratio: number,
    threshold: number,
    declaration: Declaration,
    owner: Element
  ) {
    super(message);
    this._property = property;
    this._value = value;
    this._fontSize = fontSize;
    this._ratio = ratio;
    this._threshold = threshold;
    this._declaration = declaration;
    this._owner = owner;
  }

  public get property(): N {
    return this._property;
  }

  public get value(): Style.Computed<N> {
    return this._value;
  }

  public get fontSize(): Style.Computed<"font-size"> {
    return this._fontSize;
  }

  public get ratio(): number {
    return this._ratio;
  }

  public get threshold(): number {
    return this._threshold;
  }

  public get declaration(): Declaration {
    return this._declaration;
  }

  public get owner(): Element {
    return this._owner;
  }

  public equals(value: TextSpacing<N>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof TextSpacing &&
      value._message === this._message &&
      value._property === this._property &&
      Equatable.equals(value._value, this._value) &&
      value._fontSize.equals(this._fontSize) &&
      value._ratio === this._ratio &&
      value._declaration.equals(this._declaration) &&
      value._owner.equals(this._owner)
    );
  }

  public toJSON(): TextSpacing.JSON<N> {
    return {
      ...super.toJSON(),
      property: this._property,
      value: Serializable.toJSON(this._value),
      "font-size": this._fontSize.toJSON(),
      ratio: this._ratio,
      threshold: this._threshold,
      declaration: this._declaration.toJSON(),
      owner: this._owner.toJSON(),
    };
  }
}

/**
 * @internal
 */
export namespace TextSpacing {
  export interface JSON<N extends Property.Name> extends Diagnostic.JSON {
    property: N;
    value: Serializable.ToJSON<Style.Computed<N>>;
    "font-size": Serializable.ToJSON<Style.Computed<"font-size">>;
    ratio: number;
    threshold: number;
    declaration: Declaration.JSON;
    owner: Element.JSON;
  }

  export function isTextSpacing(
    value: Diagnostic
  ): value is TextSpacing<Property.Name>;

  export function isTextSpacing(
    value: unknown
  ): value is TextSpacing<Property.Name>;

  export function isTextSpacing(
    value: unknown
  ): value is TextSpacing<Property.Name> {
    return value instanceof TextSpacing;
  }
}
