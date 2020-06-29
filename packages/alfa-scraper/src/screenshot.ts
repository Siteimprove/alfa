import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

export class Screenshot implements Equatable, Serializable {
  public static of(
    path: string,
    type: Screenshot.Type = Screenshot.Type.PNG.of(true)
  ): Screenshot {
    return new Screenshot(path, type);
  }

  private readonly _path: string;
  private readonly _type: Screenshot.Type;

  private constructor(path: string, type: Screenshot.Type) {
    this._path = path;
    this._type = type;
  }

  public get path(): string {
    return this._path;
  }

  public get type(): Screenshot.Type {
    return this._type;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Screenshot &&
      value._path === this._path &&
      value._type.equals(this._type)
    );
  }

  public toJSON(): Screenshot.JSON {
    return {
      path: this._path,
      type: this._type.toJSON(),
    };
  }
}

export namespace Screenshot {
  export interface JSON {
    [key: string]: json.JSON;
    path: string;
    type: Type.JSON;
  }

  export type Type = Type.PNG | Type.JPEG;

  export namespace Type {
    export type JSON = PNG.JSON | JPEG.JSON;

    export class PNG implements Equatable, Serializable {
      public static of(background: boolean): PNG {
        return new PNG(background);
      }

      private readonly _background: boolean;

      private constructor(background: boolean) {
        this._background = background;
      }

      public get type(): "png" {
        return "png";
      }

      public get background(): boolean {
        return this._background;
      }

      public equals(value: unknown): value is this {
        return value instanceof PNG && value._background === this._background;
      }

      public toJSON(): PNG.JSON {
        return {
          type: "png",
          background: this._background,
        };
      }
    }

    export namespace PNG {
      export interface JSON {
        [key: string]: json.JSON;
        type: "png";
        background: boolean;
      }
    }

    export class JPEG implements Equatable, Serializable {
      public static of(quality: number): JPEG {
        return new JPEG(quality);
      }

      private readonly _quality: number;

      private constructor(quality: number) {
        this._quality = quality;
      }

      public get type(): "jpeg" {
        return "jpeg";
      }

      public get quality(): number {
        return this._quality;
      }

      public equals(value: unknown): value is this {
        return value instanceof JPEG && value._quality === this._quality;
      }

      public toJSON(): JPEG.JSON {
        return {
          type: "jpeg",
          quality: this._quality,
        };
      }
    }

    export namespace JPEG {
      export interface JSON {
        [key: string]: json.JSON;
        type: "jpeg";
        quality: number;
      }
    }
  }
}
