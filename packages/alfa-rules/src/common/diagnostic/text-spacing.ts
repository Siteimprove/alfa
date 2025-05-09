import { Diagnostic } from "@siteimprove/alfa-act";
import type { Length } from "@siteimprove/alfa-css";
import type { Declaration, Element, Node } from "@siteimprove/alfa-dom";
import type { Hash } from "@siteimprove/alfa-hash";
import type { Serializable } from "@siteimprove/alfa-json";
import type { Longhands, Style } from "@siteimprove/alfa-style";

/**
 * @public
 */
export class TextSpacing<N extends Longhands.Name> extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of<N extends Longhands.Name>(
    message: string,
    property: N,
    value: Length.Canonical,
    fontSize: Style.Computed<"font-size">,
    ratio: number,
    threshold: number,
    declaration: Declaration,
    owner: Element,
  ): TextSpacing<N>;

  public static of<N extends Longhands.Name>(
    message: string,
    property?: N,
    value?: Length.Canonical,
    fontSize?: Style.Computed<"font-size">,
    ratio?: number,
    threshold?: number,
    declaration?: Declaration,
    owner?: Element,
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
          owner!,
        );
  }

  private readonly _property: N;
  private readonly _value: Length.Canonical;
  private readonly _fontSize: Style.Computed<"font-size">;
  private readonly _ratio: number;
  private readonly _threshold: number;
  // The bad declaration in the style attribute
  private readonly _declaration: Declaration;
  // The element with the bad style attribute
  private readonly _owner: Element;

  protected constructor(
    message: string,
    property: N,
    value: Length.Canonical,
    fontSize: Style.Computed<"font-size">,
    ratio: number,
    threshold: number,
    declaration: Declaration,
    owner: Element,
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

  public get value(): Length.Canonical {
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
      value._value.equals(this._value) &&
      value._fontSize.equals(this._fontSize) &&
      value._ratio === this._ratio &&
      value._declaration.equals(this._declaration) &&
      value._owner.equals(this._owner)
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    this._owner.hash(hash);
    hash.writeString(this._property);
    hash.writeNumber(this._ratio);
    hash.writeNumber(this._threshold);
    hash.writeNumber(this._value.value);
  }

  public toJSON(options?: Node.SerializationOptions): TextSpacing.JSON<N> {
    return {
      ...super.toJSON(options),
      property: this._property,
      value: this._value.toJSON(),
      "font-size": this._fontSize.toJSON(),
      ratio: this._ratio,
      threshold: this._threshold,
      declaration: this._declaration.toJSON(),
      owner: this._owner.toJSON(options),
    };
  }
}

/**
 * @public
 */
export namespace TextSpacing {
  export interface JSON<N extends Longhands.Name> extends Diagnostic.JSON {
    property: N;
    value: Length.Fixed.JSON<"px">;
    "font-size": Serializable.ToJSON<Style.Computed<"font-size">>;
    ratio: number;
    threshold: number;
    declaration: Declaration.JSON;
    owner: Element.JSON;
  }

  export function isTextSpacing(
    value: Diagnostic,
  ): value is TextSpacing<Longhands.Name>;

  export function isTextSpacing(
    value: unknown,
  ): value is TextSpacing<Longhands.Name>;

  export function isTextSpacing(
    value: unknown,
  ): value is TextSpacing<Longhands.Name> {
    return value instanceof TextSpacing;
  }
}
