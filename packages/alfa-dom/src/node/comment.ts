import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Node } from "../node";

/**
 * @public
 */
export class Comment extends Node<"comment"> {
  public static of(data: string): Comment {
    return new Comment(data);
  }

  public static empty(): Comment {
    return new Comment("");
  }

  private readonly _data: string;

  private constructor(data: string) {
    super([], "comment");

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

  public toJSON(): Comment.JSON {
    return {
      ...super.toJSON(),
      data: this._data,
    };
  }

  public toString(): string {
    return `<!--${this._data}-->`;
  }
}

/**
 * @public
 */
export namespace Comment {
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
    return Trampoline.done(Comment.of(json.data));
  }
}
