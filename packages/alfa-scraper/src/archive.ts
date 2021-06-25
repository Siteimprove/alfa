import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

/**
 * @public
 */
export class Archive implements Equatable, Serializable {
  public static of(
    path: string,
    format: Archive.Format = Archive.Format.MHTML
  ): Archive {
    return new Archive(path, format);
  }

  private readonly _path: string;
  private readonly _format: Archive.Format;

  private constructor(path: string, format: Archive.Format) {
    this._path = path;
    this._format = format;
  }

  public get path(): string {
    return this._path;
  }

  public get format(): Archive.Format {
    return this._format;
  }

  public equals(value: Archive): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Archive &&
      value._path === this._path &&
      value._format === this._format
    );
  }

  public toJSON(): Archive.JSON {
    return {
      path: this._path,
      format: this._format,
    };
  }
}

/**
 * @public
 */
export namespace Archive {
  export interface JSON {
    [key: string]: json.JSON;
    path: string;
    format: `${Format}`;
  }

  export enum Format {
    MHTML = "mhtml",
  }
}
