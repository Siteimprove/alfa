import { None, Option } from "@siteimprove/alfa-option";

import { Node } from "../node";
import { Trampoline } from "@siteimprove/alfa-trampoline";

export class Type extends Node {
  public static of(
    name: string,
    publicId: Option<string> = None,
    systemId: Option<string> = None
  ): Type {
    return new Type(name, publicId, systemId);
  }

  public static empty(): Type {
    return new Type("html", None, None);
  }

  private readonly _name: string;
  private readonly _publicId: Option<string>;
  private readonly _systemId: Option<string>;

  protected _structurallyEquals(value: unknown): value is this {
    return (
      value instanceof Type &&
      super._structurallyEquals(value) &&
      this.name === value.name &&
      this.publicId.equals(value.publicId) &&
      this.systemId.equals(value.systemId)
    );
  }

  private constructor(
    name: string,
    publicId: Option<string>,
    systemId: Option<string>
  ) {
    super([]);

    this._name = name;
    this._publicId = publicId;
    this._systemId = systemId;
  }

  public get name(): string {
    return this._name;
  }

  public get publicId(): Option<string> {
    return this._publicId;
  }

  public get systemId(): Option<string> {
    return this._systemId;
  }

  public toJSON(): Type.JSON {
    return {
      type: "type",
      name: this._name,
      publicId: this._publicId.getOr(null),
      systemId: this._systemId.getOr(null),
    };
  }

  public toString(): string {
    return `<!doctype ${this._name}>`;
  }
}

export namespace Type {
  export interface JSON extends Node.JSON {
    type: "type";
    name: string;
    publicId: string | null;
    systemId: string | null;
  }

  export function isType(value: unknown): value is Type {
    return value instanceof Type;
  }

  /**
   * @internal
   */
  export function fromType(json: JSON): Trampoline<Type> {
    return Trampoline.done(
      Type.of(json.name, Option.from(json.publicId), Option.from(json.systemId))
    );
  }
}
