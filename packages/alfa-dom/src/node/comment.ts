import { Option, None } from "@siteimprove/alfa-option";

import { Node } from "../node";

export class Comment extends Node {
  public static of(data: string, parent: Option<Node>): Comment {
    return new Comment(data, parent);
  }

  private readonly _data: string;

  private constructor(data: string, parent: Option<Node>) {
    super(self => [], parent);

    this._data = data;
  }

  public get data(): string {
    return this._data;
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
  export function isComment(value: unknown): value is Comment {
    return value instanceof Comment;
  }

  export interface JSON {
    type: "comment";
    data: string;
  }

  export function fromComment(
    comment: JSON,
    parent: Option<Node> = None
  ): Comment {
    return Comment.of(comment.data, parent);
  }
}
