import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as json from "@siteimprove/alfa-json";

import { BaseNode } from "./node.js";

/**
 * @public
 */
export class Comment extends BaseNode<"comment"> {
  public static of(
    data: string,
    externalId?: string,
    internalId?: string,
    extraData?: any,
  ): Comment {
    return new Comment(data, externalId, internalId, extraData);
  }

  public static empty(): Comment {
    return new Comment("");
  }

  private readonly _data: string;

  protected constructor(
    data: string,
    externalId?: string,
    internalId?: string,
    extraData?: any,
  ) {
    super([], "comment", externalId, internalId, extraData);

    this._data = data;
  }

  public get data(): string {
    return this._data;
  }

  /**
   * @internal
   **/
  protected _internalPath(options?: BaseNode.Traversal): string {
    let path = this.parent(options)
      .map((parent) => parent.path(options))
      .getOr("/");

    path += path === "/" ? "" : "/";
    path += "comment()";

    const index = this.index(options, Comment.isComment);

    path += `[${index + 1}]`;

    return path;
  }

  public toJSON(
    options: BaseNode.SerializationOptions & {
      verbosity:
        | json.Serializable.Verbosity.Minimal
        | json.Serializable.Verbosity.Low;
    },
  ): Comment.MinimalJSON;
  public toJSON(options?: BaseNode.SerializationOptions): Comment.JSON;
  public toJSON(
    options?: BaseNode.SerializationOptions,
  ): Comment.MinimalJSON | Comment.JSON {
    const result = {
      ...super.toJSON(options),
    };
    delete result.children;

    const verbosity = options?.verbosity ?? json.Serializable.Verbosity.Medium;

    if (verbosity < json.Serializable.Verbosity.Medium) {
      return result;
    }

    result.data = this._data;
    return result;
  }

  public toString(): string {
    return `<!--${this._data}-->`;
  }
}

/**
 * @public
 */
export namespace Comment {
  export interface MinimalJSON extends BaseNode.JSON<"comment"> {}

  export interface JSON extends BaseNode.JSON<"comment"> {
    data: string;
  }

  export function isComment(value: unknown): value is Comment {
    return value instanceof Comment;
  }

  /**
   * @internal
   */
  export function fromComment(json: JSON): Trampoline<Comment> {
    return Trampoline.done(
      Comment.of(json.data, json.externalId, json.internalId),
    );
  }
}
