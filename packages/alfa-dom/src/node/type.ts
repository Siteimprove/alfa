import { None, Option } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";
import { Node as treeNode } from "@siteimprove/alfa-tree";

import { Node } from "../node";

/**
 * @public
 */
export class Type<N extends string = string> extends Node<"type"> {
  public static of<N extends string = string>(
    name: N,
    publicId: Option<string> = None,
    systemId: Option<string> = None,
    nodeId?: treeNode.Id.User
  ): Type<N> {
    return new Type(name, publicId, systemId, nodeId ?? Node.Id.create());
  }

  public static empty(): Type {
    return new Type("html", None, None, Node.Id.create());
  }

  private readonly _name: N;
  private readonly _publicId: Option<string>;
  private readonly _systemId: Option<string>;

  private constructor(
    name: N,
    publicId: Option<string>,
    systemId: Option<string>,
    nodeId: Node.Id | treeNode.Id.User
  ) {
    super([], "type", nodeId);

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

  public toJSON(): Type.JSON<N> {
    const result = {
      ...super.toJSON(),
      name: this._name,
      publicId: this._publicId.getOr(null),
      systemId: this._systemId.getOr(null),
    };
    delete result.children;

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
    json: JSON<N>
  ): Trampoline<Type<N>> {
    return Trampoline.done(
      Type.of(json.name, Option.from(json.publicId), Option.from(json.systemId))
    );
  }
}
