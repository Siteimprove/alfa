import { Tag } from "@siteimprove/alfa-act";

/**
 * @public
 */
export class Version<N extends number = number> extends Tag<"version"> {
  public static of<N extends number>(version: N): Version<N> {
    return new Version(version);
  }

  private readonly _version: N;

  private constructor(version: N) {
    super();
    this._version = version;
  }

  public get type(): "version" {
    return "version";
  }

  public get version(): N {
    return this._version;
  }

  public equals(value: Version): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Version && value._version === this._version;
  }

  public toJSON(): Version.JSON<N> {
    return {
      ...super.toJSON(),
      version: this._version,
    };
  }
}

/**
 * @public
 */
export namespace Version {
  export interface JSON<N extends number = number> extends Tag.JSON<"version"> {
    version: N;
  }

  export function isVersion<T extends string>(
    value: unknown
  ): value is Version {
    return value instanceof Version;
  }
}
