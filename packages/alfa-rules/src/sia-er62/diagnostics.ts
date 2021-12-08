import { Diagnostic } from "@siteimprove/alfa-act";
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

export type ExtendedDiagnostics = {
  computedStyles: ComputedStyles;
  contrastPairings: Contrast.Pairing[];
};

type Name = Property.Name | Property.Shorthand.Name;

export class ComputedStyles implements Equatable, Hashable, Serializable {
  public static of(
    style: Iterable<readonly [Name, string]> = []
  ): ComputedStyles {
    return new ComputedStyles(Map.from(style));
  }

  private readonly _style: Map<Name, string>;

  private constructor(style: Map<Name, string>) {
    this._style = style;
  }

  public get style(): Map<Name, string> {
    return this._style;
  }

  public with(
    ...styles: ReadonlyArray<readonly [Name, string]>
  ): ComputedStyles {
    return ComputedStyles.of([...this._style, ...styles]);
  }

  public equals(value: ComputedStyles): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof ComputedStyles && value._style.equals(this._style);
  }

  public hash(hash: Hash): void {
    this._style.hash(hash);
  }

  public toJSON(): ComputedStyles.JSON {
    return {
      style: this._style.toJSON(),
    };
  }
}

export namespace ComputedStyles {
  export interface JSON {
    [key: string]: json.JSON;
    style: Map.JSON<Name, string>;
  }

  export function isComputedStyles(value: unknown): value is ComputedStyles {
    return value instanceof ComputedStyles;
  }

  export function from(
    element: Element,
    device: Device,
    target: Element,
    context: Context = Context.empty()
  ): ComputedStyles {
    const style = Style.from(element, device, context);

    const border = (["color", "style", "width"] as const).map((property) =>
      Serialise.borderShorthand(style, property)
    );

    const cursor = context.isHovered(target)
      ? [["cursor", Serialise.getLonghand(style, "cursor")] as const]
      : [];

    return ComputedStyles.of(
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
        // ["cursor", Serialise.getLonghand(style, "cursor")] as const,
      ].filter(([_, value]) => value !== "")
    );
  }
}

export class DistinguishingStyles extends Diagnostic {
  public static of(
    message: string,
    defaultStyles: Iterable<Result<ExtendedDiagnostics>> = Sequence.empty(),
    hoverStyles: Iterable<Result<ExtendedDiagnostics>> = Sequence.empty(),
    focusStyles: Iterable<Result<ExtendedDiagnostics>> = Sequence.empty()
  ): DistinguishingStyles {
    return new DistinguishingStyles(
      message,
      Sequence.from(defaultStyles),
      Sequence.from(hoverStyles),
      Sequence.from(focusStyles)
    );
  }

  private readonly _defaultStyles: Sequence<Result<ExtendedDiagnostics>>;
  private readonly _hoverStyles: Sequence<Result<ExtendedDiagnostics>>;
  private readonly _focusStyles: Sequence<Result<ExtendedDiagnostics>>;

  private constructor(
    message: string,
    defaultStyles: Sequence<Result<ExtendedDiagnostics>>,
    hoverStyles: Sequence<Result<ExtendedDiagnostics>>,
    focusStyles: Sequence<Result<ExtendedDiagnostics>>
  ) {
    super(message);
    this._defaultStyles = defaultStyles;
    this._hoverStyles = hoverStyles;
    this._focusStyles = focusStyles;
  }

  public get defaultStyles(): Iterable<Result<ExtendedDiagnostics>> {
    return this._defaultStyles;
  }

  public get hoverStyles(): Iterable<Result<ExtendedDiagnostics>> {
    return this._hoverStyles;
  }

  public get focusStyles(): Iterable<Result<ExtendedDiagnostics>> {
    return this._focusStyles;
  }

  public equals(value: DistinguishingStyles): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof DistinguishingStyles &&
      value._defaultStyles.equals(this._defaultStyles) &&
      value._hoverStyles.equals(this._hoverStyles) &&
      value._focusStyles.equals(this._focusStyles)
    );
  }

  public toJSON(): DistinguishingStyles.JSON {
    return {
      ...super.toJSON(),
      defaultStyle: this._defaultStyles.toJSON(),
      hoverStyle: this._hoverStyles.toJSON(),
      focusStyle: this._focusStyles.toJSON(),
    };
  }
}

export namespace DistinguishingStyles {
  export interface JSON extends Diagnostic.JSON {
    defaultStyle: Sequence.JSON<Result<ExtendedDiagnostics>>;
    hoverStyle: Sequence.JSON<Result<ExtendedDiagnostics>>;
    focusStyle: Sequence.JSON<Result<ExtendedDiagnostics>>;
  }

  export function isDistinguishingStyles(
    value: unknown
  ): value is DistinguishingStyles {
    return value instanceof DistinguishingStyles;
  }
}
