import {Rule, Diagnostic} from "@siteimprove/alfa-act";
import {Node} from "@siteimprove/alfa-aria";
import {Document, Element, Namespace} from "@siteimprove/alfa-dom";
import {Equatable} from "@siteimprove/alfa-equatable";
import {Serializable} from "@siteimprove/alfa-json";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

import * as json from "@siteimprove/alfa-json";

import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { isElement, hasNamespace } = Element;
const { and, not } = Predicate;

export default Rule.Inventory.of<Page, Document>({
  uri: "https://alfa.siteimprove.com/rules/sia-inv2",
  evaluate({ device, document }) {
    return {
      applicability() {
        return [document]

      },

      expectations(target) {
        const images = Array.from(target
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasRole(device, "img"),
              not(isIgnored(device))
            )
          ));

        return ImagesNames.of("", images.map(image => ImageName.of(image, Node.from(image, device).name.map(name => name.value).getOr(""))))
      },
    };
  },
});

class ImageName implements Equatable, Serializable {
  public static of(image: Element, name: string): ImageName {
    return new ImageName(image, name)
  }

  private readonly _image: Element;
  private readonly _name: string;

  private constructor(image: Element, name: string) {
    this._image = image;
    this._name = name
  }

  public equals(value: ImageName): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof ImageName &&
      value._name === this._name &&
      value._image.equals(this._image)
  }

  public toJSON(): ImageName.JSON {
    return {
      image: this._image.toJSON(),
      name: this._name
    }
  }
}

namespace ImageName {
  export interface JSON {
    [key: string]: json.JSON;
    image: Element.JSON;
    name: string;
  }
}

class ImagesNames extends Diagnostic {
  public static of(
    message: string,
    images: ReadonlyArray<ImageName> = []
  ): ImagesNames {
    return new ImagesNames(message, images);
  }

  private readonly _images: ReadonlyArray<ImageName>;

  private constructor(message: string, images: ReadonlyArray<ImageName>) {
    super(message);
    this._images = images;
  }

  public get images(): ReadonlyArray<ImageName> {
    return this._images;
  }

  public equals(value: ImagesNames): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof ImagesNames &&
      value._images.every((image, idx) => image.equals(this._images[idx])
    ));
  }

  public toJSON(): ImagesNames.JSON {
    return {
      ...super.toJSON(),
      images: this._images.map(image => image.toJSON())
    };
  }
}

namespace ImagesNames {
  export interface JSON extends Diagnostic.JSON {
    images: Array<ImageName.JSON>
  }
}
