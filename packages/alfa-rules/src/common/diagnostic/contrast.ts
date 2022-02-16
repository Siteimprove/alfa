import { Diagnostic } from "@siteimprove/alfa-act";
import { RGB } from "@siteimprove/alfa-css";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";
import { Hash, Hashable } from "@siteimprove/alfa-hash";

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
  export class Pairing implements Equatable, Serializable, Hashable {
    public static of(color1: Color, color2: Color, contrast: number): Pairing {
      return new Pairing(color1, color2, contrast);
    }

    private readonly _color1: Color;
    private readonly _color2: Color;
    private readonly _contrast: number;

    private constructor(color1: Color, color2: Color, contrast: number) {
      this._color1 = color1;
      this._color2 = color2;
      this._contrast = contrast;
    }

    public hash(hash: Hash): void {
      hash
        .writeObject(this._color1)
        .writeObject(this._color2)
        .writeNumber(this._contrast);
    }

    public get color1(): Color {
      return this._color1;
    }

    public get color2(): Color {
      return this._color2;
    }

    public get contrast(): number {
      return this._contrast;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Pairing &&
        value._color1.equals(this._color1) &&
        value._color2.equals(this._color2) &&
        value._contrast === this._contrast
      );
    }

    public toJSON(): Pairing.JSON {
      return {
        color1: this._color1.toJSON(),
        color2: this._color2.toJSON(),
        contrast: this._contrast,
      };
    }
  }

  export namespace Pairing {
    export interface JSON {
      [key: string]: json.JSON;
      color1: Color.JSON;
      color2: Color.JSON;
      contrast: number;
    }
  }

  type Name = "container" | "link" | "foreground" | "background";
  export class Color implements Equatable, Serializable, Hashable {
    public static of(name: Name, value: RGB): Color {
      return new Color(name, value);
    }

    private readonly _name: Name;
    private readonly _value: RGB;

    private constructor(name: Name, value: RGB) {
      this._name = name;
      this._value = value;
    }

    public hash(hash: Hash): void {
      hash.writeString(this._name).writeHashable(this._value);
    }

    public get name(): Name {
      return this._name;
    }

    public get value(): RGB {
      return this._value;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Color &&
        value._name === this._name &&
        value._value.equals(this._value)
      );
    }

    public toJSON(): Color.JSON {
      return {
        name: this._name,
        value: this._value.toJSON(),
      };
    }
  }
  namespace Color {
    export interface JSON {
      [key: string]: json.JSON;
      name: json.JSON;
      value: RGB.JSON;
    }
  }
}
