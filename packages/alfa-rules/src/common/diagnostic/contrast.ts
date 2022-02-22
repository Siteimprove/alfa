import { Diagnostic } from "@siteimprove/alfa-act";
import { RGB } from "@siteimprove/alfa-css";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Comparable, Comparison } from "@siteimprove/alfa-comparable";

type Name = ["container", "link"] | ["foreground", "background"];
type FirstColor<N extends Name> = N[0];
type SecondColor<N extends Name> = N[1];

export class Contrast<N extends Name> extends Diagnostic {
  public static of<N extends Name>(
    message: string,
    threshold: number = 4.5,
    pairings: Iterable<Contrast.Pairing<N>> = []
  ): Contrast<N> {
    return new Contrast(message, threshold, Array.from(pairings));
  }

  private readonly _threshold: number;
  private readonly _pairings: Array<Contrast.Pairing<N>>;

  private constructor(
    message: string,
    threshold: number,
    pairings: Array<Contrast.Pairing<N>>
  ) {
    super(message);

    this._threshold = threshold;
    this._pairings = pairings;
  }

  public get threshold(): number {
    return this._threshold;
  }

  public get pairings(): Iterable<Contrast.Pairing<N>> {
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

  export function isContrast(value: unknown): value is Contrast<Name> {
    return value instanceof Contrast;
  }
  export class Pairing<N extends Name>
    implements Equatable, Serializable, Hashable, Comparable<Pairing<N>>
  {
    public static of<N extends Name>(
      color1: [N[0], RGB],
      color2: [N[1], RGB],
      contrast: number
    ): Pairing<N> {
      return new Pairing(Color.of(...color1), Color.of(...color2), contrast);
    }

    private readonly _color1: Color<FirstColor<N>>;
    private readonly _color2: Color<SecondColor<N>>;
    private readonly _contrast: number;

    private constructor(
      color1: Color<FirstColor<N>>,
      color2: Color<SecondColor<N>>,
      contrast: number
    ) {
      this._color1 = color1;
      this._color2 = color2;
      this._contrast = contrast;
    }

    public hash(hash: Hash): void {
      hash
        .writeHashable(this._color1)
        .writeHashable(this._color2)
        .writeNumber(this._contrast);
    }

    public get color1(): Color<FirstColor<N>> {
      return this._color1;
    }

    public get color2(): Color<SecondColor<N>> {
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

    public compare(value: Pairing<N>): Comparison {
      if (this._contrast < value.contrast) {
        return Comparison.Greater;
      }

      if (this._contrast > value.contrast) {
        return Comparison.Less;
      }

      return Comparison.Equal;
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
  class Color<N extends FirstColor<Name> | SecondColor<Name>>
    implements Equatable, Serializable, Hashable
  {
    public static of<N extends FirstColor<Name> | SecondColor<Name>>(
      name: N,
      value: RGB
    ): Color<N> {
      return new Color(name, value);
    }

    private readonly _name: N;
    private readonly _value: RGB;

    private constructor(name: N, value: RGB) {
      this._name = name;
      this._value = value;
    }

    public hash(hash: Hash): void {
      hash.writeString(this._name).writeHashable(this._value);
    }

    public get name(): N {
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
