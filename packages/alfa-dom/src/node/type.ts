import { None, Option } from "@siteimprove/alfa-option";

import { Node } from "../node";

export class Type extends Node {
  public static of(
    name: string,
    publicId: Option<string> = None,
    systemId: Option<string> = None,
    parent: Option<Node> = None
  ): Type {
    return new Type(name, publicId, systemId, parent);
  }

  private readonly _name: string;
  private readonly _publicId: Option<string>;
  private readonly _systemId: Option<string>;

  private constructor(
    name: string,
    publicId: Option<string>,
    systemId: Option<string>,
    parent: Option<Node>
  ) {
    super(self => [], parent);

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
      systemId: this._systemId.getOr(null)
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

  export function fromType(type: JSON, parent: Option<Node> = None): Type {
    return Type.of(
      type.name,
      Option.from(type.publicId),
      Option.from(type.systemId),
      parent
    );
  }
}
