import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as json from "@siteimprove/alfa-json";

import { Node } from "../node.js";

/**
 * @public
 */
export class Comment extends Node<"comment"> {
  public static of(
    data: string,
    externalId?: string,
    serializationId?: string,
    extraData?: any,
  ): Comment {
    return new Comment(data, externalId, serializationId, extraData);
  }

  public static empty(): Comment {
    return new Comment("");
  }

  private readonly _data: string;

  private constructor(
    data: string,
    externalId?: string,
    serializationId?: string,
    extraData?: any,
  ) {
    super([], "comment", externalId, serializationId, extraData);

    this._data = data;
  }

  public get data(): string {
    return this._data;
  }

  /**
   * @internal
   **/
  protected _internalPath(options?: Node.Traversal): string {
    let path = this.parent(options)
      .map((parent) => parent.path(options))
      .getOr("/");

    path += path === "/" ? "" : "/";
    path += "comment()";

    const index = this.preceding(options).count(Comment.isComment);

    path += `[${index + 1}]`;

    return path;
  }

  public toJSON(
    options: Node.SerializationOptions & {
      verbosity:
        | json.Serializable.Verbosity.Minimal
        | json.Serializable.Verbosity.Low;
    },
  ): Comment.MinimalJSON;
  public toJSON(options?: Node.SerializationOptions): Comment.JSON;
  public toJSON(
    options?: Node.SerializationOptions,
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
  export interface MinimalJSON extends Node.JSON<"comment"> {}

  export interface JSON extends Node.JSON<"comment"> {
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
      Comment.of(json.data, json.externalId, json.serializationId),
    );
  }

  /**
   * @internal
   */
  export function cloneComment(comment: Comment): Trampoline<Comment> {
    return Trampoline.done(
      Comment.of(
        comment.data,
        comment.externalId,
        comment.serializationId,
        comment.extraData,
      ),
    );
  }
}
