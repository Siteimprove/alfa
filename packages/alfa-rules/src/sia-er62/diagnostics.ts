import { Diagnostic } from "@siteimprove/alfa-act";
import { Array } from "@siteimprove/alfa-array";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Property, Style } from "@siteimprove/alfa-style";

import * as json from "@siteimprove/alfa-json";

import { Contrast } from "../../src/common/diagnostic/contrast";

import { Serialise } from "./serialise";

export type Name = Property.Name | Property.Shorthand.Name;

export class ElementDistinguishable
  implements Equatable, Hashable, Serializable
{
  public static of(
    style: Iterable<readonly [Name, string]> = [],
    pairings: Iterable<Contrast.Pairing> = []
  ): ElementDistinguishable {
    return new ElementDistinguishable(Map.from(style), Array.from(pairings));
  }

  private readonly _style: Map<Name, string>;
  private readonly _pairings: ReadonlyArray<Contrast.Pairing>;

  private constructor(
    style: Map<Name, string>,
    pairings: ReadonlyArray<Contrast.Pairing>
  ) {
    this._style = style;
    this._pairings = pairings;
  }

  public get style(): Map<Name, string> {
    return this._style;
  }

  public get pairings(): ReadonlyArray<Contrast.Pairing> {
    return this._pairings;
  }

  public withStyle(
    ...styles: ReadonlyArray<readonly [Name, string]>
  ): ElementDistinguishable {
    return ElementDistinguishable.of(
      [...this._style, ...styles],
      this._pairings
    );
  }

  public withPairings(
    pairings: ReadonlyArray<Contrast.Pairing>
  ): ElementDistinguishable {
    return ElementDistinguishable.of(this._style, pairings);
  }

  public equals(value: ElementDistinguishable): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof ElementDistinguishable &&
      value._style.equals(this._style) &&
      Array.equals(value._pairings, this._pairings)
    );
  }

  public hash(hash: Hash): void {
    this._style.hash(hash);
    Array.hash(this._pairings, hash);
  }

  public toJSON(): ElementDistinguishable.JSON {
    return {
      style: this._style.toJSON(),
      pairings: Array.toJSON(this._pairings),
    };
  }
}

export namespace ElementDistinguishable {
  export interface JSON {
    [key: string]: json.JSON;
    style: Map.JSON<Name, string>;
    pairings: Array<Contrast.Pairing.JSON>;
  }

  export function from(
    element: Element,
    device: Device,
    target: Element,
    context: Context = Context.empty(),
    pairings: Iterable<Contrast.Pairing>
  ): ElementDistinguishable {
    const style = Style.from(element, device, context);

    const border = (["color", "style", "width"] as const).map((property) =>
      Serialise.borderShorthand(style, property)
    );

    const cursor = context.isHovered(target)
      ? [["cursor", Serialise.getLonghand(style, "cursor")] as const]
      : [];

    return ElementDistinguishable.of(
      [
        ...border,
        ...cursor,
        ["color", Serialise.getLonghand(style, "color")] as const,
        ["font", Serialise.font(style)] as const,
        [
          "vertical-align",
          Serialise.getLonghand(style, "vertical-align"),
        ] as const,
        ["background", Serialise.background(style)] as const,
        ["outline", Serialise.outline(style)] as const,
        ["text-decoration", Serialise.textDecoration(style)] as const,
        ["box-shadow", Serialise.boxShadow(style)] as const,
      ].filter(([_, value]) => value !== ""),
      pairings
    );
  }
}

export class DistinguishingStyles extends Diagnostic {
  public static of(
    message: string,
    distinguishingStyles: Iterable<
      Result<ElementDistinguishable>
    > = Sequence.empty(),
    defaultStyles: Iterable<Result<ElementDistinguishable>> = Sequence.empty(),
    hoverStyles: Iterable<Result<ElementDistinguishable>> = Sequence.empty(),
    focusStyles: Iterable<Result<ElementDistinguishable>> = Sequence.empty()
  ): DistinguishingStyles {
    return new DistinguishingStyles(
      message,
      Sequence.from(distinguishingStyles),
      Sequence.from(defaultStyles),
      Sequence.from(hoverStyles),
      Sequence.from(focusStyles)
    );
  }

  private readonly _distinguishingStyles: Sequence<
    Result<ElementDistinguishable>
  >;
  private readonly _defaultStyles: Sequence<Result<ElementDistinguishable>>;
  private readonly _hoverStyles: Sequence<Result<ElementDistinguishable>>;
  private readonly _focusStyles: Sequence<Result<ElementDistinguishable>>;

  private constructor(
    message: string,
    distinguishingStyles: Sequence<Result<ElementDistinguishable>>,
    defaultStyles: Sequence<Result<ElementDistinguishable>>,
    hoverStyles: Sequence<Result<ElementDistinguishable>>,
    focusStyles: Sequence<Result<ElementDistinguishable>>
  ) {
    super(message);
    this._distinguishingStyles = distinguishingStyles;
    this._defaultStyles = defaultStyles;
    this._hoverStyles = hoverStyles;
    this._focusStyles = focusStyles;
  }

  public get distinguishingStyles(): Iterable<Result<ElementDistinguishable>> {
    return this._distinguishingStyles;
  }

  public get defaultStyles(): Iterable<Result<ElementDistinguishable>> {
    return this._defaultStyles;
  }

  public get hoverStyles(): Iterable<Result<ElementDistinguishable>> {
    return this._hoverStyles;
  }

  public get focusStyles(): Iterable<Result<ElementDistinguishable>> {
    return this._focusStyles;
  }

  public equals(value: DistinguishingStyles): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof DistinguishingStyles &&
      value._distinguishingStyles.equals(this._distinguishingStyles) &&
      value._defaultStyles.equals(this._defaultStyles) &&
      value._hoverStyles.equals(this._hoverStyles) &&
      value._focusStyles.equals(this._focusStyles)
    );
  }

  public toJSON(): DistinguishingStyles.JSON {
    return {
      ...super.toJSON(),
      distinguishingStyles: this._distinguishingStyles.toJSON(),
      defaultStyle: this._defaultStyles.toJSON(),
      hoverStyle: this._hoverStyles.toJSON(),
      focusStyle: this._focusStyles.toJSON(),
    };
  }
}

export namespace DistinguishingStyles {
  export interface JSON extends Diagnostic.JSON {
    distinguishingStyles: Sequence.JSON<Result<ElementDistinguishable>>;
    defaultStyle: Sequence.JSON<Result<ElementDistinguishable>>;
    hoverStyle: Sequence.JSON<Result<ElementDistinguishable>>;
    focusStyle: Sequence.JSON<Result<ElementDistinguishable>>;
  }

  export function isDistinguishingStyles(
    value: unknown
  ): value is DistinguishingStyles {
    return value instanceof DistinguishingStyles;
  }
}
