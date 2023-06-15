import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";
import { Value } from "../value";

import { URL } from "./url";
import { Gradient } from "./gradient";

const { map, either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#images}
 *
 * @public
 */
export class Image<I extends URL | Gradient = URL | Gradient> extends Value<
  "image",
  false
> {
  public static of<I extends URL | Gradient>(image: I): Image<I> {
    return new Image(image);
  }

  private readonly _image: I;

  private constructor(image: I) {
    super("image", false);
    this._image = image;
  }

  public get image(): I {
    return this._image;
  }

  public resolve(): Image<I> {
    return this;
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
  export interface JSON extends Value.JSON<"image"> {
    image: URL.JSON | Gradient.JSON;
  }

  export function isImage<I extends URL | Gradient>(
    value: unknown
  ): value is Image<I> {
    return value instanceof Image;
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-image}
   */
  export const parse: Parser<Slice<Token>, Image, string> = map(
    either(URL.parse, Gradient.parse),
    (image) => Image.of(image)
  );
}
