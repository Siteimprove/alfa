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

  public readonly name: string;
  public readonly publicId: Option<string>;
  public readonly systemId: Option<string>;

  private constructor(
    name: string,
    publicId: Option<string>,
    systemId: Option<string>,
    parent: Option<Node>
  ) {
    super(self => [], parent);

    this.name = name;
    this.publicId = publicId;
    this.systemId = systemId;
  }

  public toJSON(): Type.JSON {
    return {
      type: "type",
      name: this.name,
      publicId: this.publicId.getOr(null),
      systemId: this.systemId.getOr(null)
    };
  }

  public toString(): string {
    return `<!doctype ${this.name}>`;
  }
}

export namespace Type {
  export interface JSON {
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
