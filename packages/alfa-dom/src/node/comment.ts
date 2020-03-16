import { Option, None } from "@siteimprove/alfa-option";

import { Node } from "../node";

export class Comment extends Node {
  public static of(data: string, parent: Option<Node> = None): Comment {
    return new Comment(data, parent);
  }

  public static empty(parent: Option<Node> = None): Comment {
    return new Comment("", parent);
  }

  private readonly _data: string;

  private constructor(data: string, parent: Option<Node>) {
    super(() => [], parent);

    this._data = data;
  }

  public get data(): string {
    return this._data;
  }

  public path(): string {
    let path = this._parent.map(parent => parent.path()).getOr("/");

    path += path === "/" ? "" : "/";
    path += "comment()";

    const index = this.preceding().count(Comment.isComment);

    path += `[${index + 1}]`;

    return path;
  }

  public toJSON(): Comment.JSON {
    return {
      type: "comment",
      data: this._data
    };
  }

  public toString(): string {
    return `<!--${this._data}-->`;
  }
}

export namespace Comment {
  export interface JSON extends Node.JSON {
    type: "comment";
    data: string;
  }

  export function isComment(value: unknown): value is Comment {
    return value instanceof Comment;
  }

  export function fromComment(
    comment: JSON,
    parent: Option<Node> = None
  ): Comment {
    return Comment.of(comment.data, parent);
  }
}
