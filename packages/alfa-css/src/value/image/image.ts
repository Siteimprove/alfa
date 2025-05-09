import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import type { Parser as CSSParser } from "../../syntax/index.js";
import type { PartiallyResolvable, Resolvable } from "../resolvable.js";

import { Value } from "../value.js";

import { URL } from "../textual/url.js";
import { Gradient } from "./gradient/index.js";

const { map, either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#images}
 *
 * @public
 */
export class Image<I extends URL | Gradient = URL | Gradient>
  extends Value<"image", Value.HasCalculation<[I]>>
  implements
    Resolvable<Image.Canonical, Image.Resolver>,
    PartiallyResolvable<Image.PartiallyResolved, Image.PartialResolver>
{
  public static of<I extends URL | Gradient>(image: I): Image<I> {
    return new Image(image);
  }

  private readonly _image: I;

  protected constructor(image: I) {
    super("image", Value.hasCalculation(image));
    this._image = image;
  }

  public get image(): I {
    return this._image;
  }

  public resolve(resolver: Image.Resolver): Image.Canonical {
    return new Image(this._image.resolve(resolver));
  }

  public partiallyResolve(
    resolver: Image.PartialResolver,
  ): Image.PartiallyResolved {
    return Image.of(
      Selective.of(this._image)
        .if(URL.isURL, (url) => url.resolve())
        .else((gradient) => gradient.partiallyResolve(resolver))
        .get(),
    );
  }

  public equals(value: unknown): value is this {
    return value instanceof Image && value._image.equals(this._image);
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._image);
  }

  public toJSON(): Image.JSON {
    return {
      ...super.toJSON(),
      image: this._image.toJSON(),
    };
  }

  public toString(): string {
    return `${this._image}`;
  }
}

/**
 * @public
 */
export namespace Image {
  export type Canonical = Image<URL.Canonical | Gradient.Canonical>;

  export type Resolver = URL.Resolver & Gradient.Resolver;

  export interface JSON extends Value.JSON<"image"> {
    image: URL.JSON | Gradient.JSON;
  }

  export type PartiallyResolved = Image<
    URL.Canonical | Gradient.PartiallyResolved
  >;

  export type PartialResolver = URL.Resolver & Gradient.PartialResolver;

  export function isImage<I extends URL | Gradient>(
    value: unknown,
  ): value is Image<I> {
    return value instanceof Image;
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-image}
   */
  export const parse: CSSParser<Image> = map(
    either(URL.parse, Gradient.parse),
    Image.of,
  );
}
