import { None, Option } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as json from "@siteimprove/alfa-json";

import { Node } from "../node.js";

/**
 * @public
 */
export class Type<N extends string = string> extends Node<"type"> {
  public static of<N extends string = string>(
    name: N,
    publicId: Option<string> = None,
    systemId: Option<string> = None,
    externalId?: string,
    serializationId?: string,
    extraData?: any,
  ): Type<N> {
    return new Type(
      name,
      publicId,
      systemId,
      externalId,
      serializationId,
      extraData,
    );
  }

  public static empty(): Type {
    return new Type("html", None, None);
  }

  private readonly _name: N;
  private readonly _publicId: Option<string>;
  private readonly _systemId: Option<string>;

  private constructor(
    name: N,
    publicId: Option<string>,
    systemId: Option<string>,
    externalId?: string,
    serializationId?: string,
    extraData?: any,
  ) {
    super([], "type", externalId, serializationId, extraData);

    this._name = name;
    this._publicId = publicId;
    this._systemId = systemId;
  }

  public get name(): N {
    return this._name;
  }

  public get publicId(): Option<string> {
    return this._publicId;
  }

  public get systemId(): Option<string> {
    return this._systemId;
  }

  public toJSON(
    options: Node.SerializationOptions & {
      verbosity:
        | json.Serializable.Verbosity.Minimal
        | json.Serializable.Verbosity.Low;
    },
  ): Type.MinimalJSON;
  public toJSON(options?: Node.SerializationOptions): Type.JSON<N>;
  public toJSON(
    options?: Node.SerializationOptions,
  ): Type.MinimalJSON | Type.JSON<N> {
    const result = {
      ...super.toJSON(options),
    };
    delete result.children;

    const verbosity = options?.verbosity ?? json.Serializable.Verbosity.Medium;

    if (verbosity < json.Serializable.Verbosity.Medium) {
      return result;
    }

    result.name = this.name;
    result.publicId = this._publicId.getOr(null);
    result.systemId = this._systemId.getOr(null);

    return result;
  }

  public toString(): string {
    return `<!doctype ${this._name}>`;
  }
}

/**
 * @public
 */
export namespace Type {
  export interface MinimalJSON extends Node.JSON<"type"> {}

  export interface JSON<N extends string = string> extends Node.JSON<"type"> {
    name: N;
    publicId: string | null;
    systemId: string | null;
  }

  export function isType(value: unknown): value is Type {
    return value instanceof Type;
  }

  /**
   * @internal
   */
  export function fromType<N extends string = string>(
    json: JSON<N>,
  ): Trampoline<Type<N>> {
    return Trampoline.done(
      Type.of(
        json.name,
        Option.from(json.publicId),
        Option.from(json.systemId),
        json.externalId,
        json.serializationId,
      ),
    );
  }

  /**
   * @internal
   */
  export function cloneType<N extends string = string>(
    type: Type<N>,
  ): Trampoline<Type<N>> {
    return Trampoline.done(
      Type.of(
        type.name,
        type.publicId,
        type.systemId,
        type.externalId,
        type.serializationId,
      ),
    );
  }
}
