import { Diagnostic } from "@siteimprove/alfa-act";
import { RGB } from "@siteimprove/alfa-css";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

export class Contrast extends Diagnostic {
  public static of(
    message: string,
    threshold: number = 4.5,
    pairings: Iterable<Contrast.Pairing> = []
  ): Contrast {
    return new Contrast(message, threshold, Array.from(pairings));
  }

  private readonly _threshold: number;
  private readonly _pairings: Array<Contrast.Pairing>;

  private constructor(
    message: string,
    threshold: number,
    pairings: Array<Contrast.Pairing>
  ) {
    super(message);

    this._threshold = threshold;
    this._pairings = pairings;
  }

  public get threshold(): number {
    return this._threshold;
  }

  public get pairings(): Iterable<Contrast.Pairing> {
    return this._pairings;
  }

  public equals(value: unknown): value is this {
    return (
      super.equals(value) &&
      value instanceof Contrast &&
      value._threshold === this._threshold &&
      value._pairings.length === this._pairings.length &&
      value._pairings.every((pairing, i) => pairing.equals(this._pairings[i]))
    );
  }

  public toJSON(): Contrast.JSON {
    return {
      ...super.toJSON(),
      threshold: this._threshold,
      pairings: this._pairings.map((pairing) => pairing.toJSON()),
    };
  }
}

export namespace Contrast {
  export interface JSON extends Diagnostic.JSON {
    threshold: number;
    pairings: Array<Pairing.JSON>;
  }

  export function isContrast(value: unknown): value is Contrast {
    return value instanceof Contrast;
  }

  export class Pairing implements Equatable, Serializable {
    public static of(
      foreground: RGB,
      background: RGB,
      contrast: number
    ): Pairing {
      return new Pairing(foreground, background, contrast);
    }

    private readonly _foreground: RGB;
    private readonly _background: RGB;
    private readonly _contrast: number;

    private constructor(foreground: RGB, background: RGB, contrast: number) {
      this._foreground = foreground;
      this._background = background;
      this._contrast = contrast;
    }

    public get foreground(): RGB {
      return this._foreground;
    }

    public get background(): RGB {
      return this._background;
    }

    public get contrast(): number {
      return this._contrast;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Pairing &&
        value._foreground.equals(this._foreground) &&
        value._background.equals(this._background) &&
        value._contrast === this._contrast
      );
    }

    public toJSON(): Pairing.JSON {
      return {
        foreground: this._foreground.toJSON(),
        background: this._background.toJSON(),
        contrast: this._contrast,
      };
    }
  }

  export namespace Pairing {
    export interface JSON {
      [key: string]: json.JSON;
      foreground: RGB.JSON;
      background: RGB.JSON;
      contrast: number;
    }
  }
}
