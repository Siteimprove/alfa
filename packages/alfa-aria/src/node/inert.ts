import * as dom from "@siteimprove/alfa-dom";

import { Node } from "../node";

/**
 * @public
 */
export class Inert extends Node<"inert"> {
  public static of(owner: dom.Node): Inert {
    return new Inert(owner);
  }

  private constructor(owner: dom.Node) {
    super(owner, [], "inert");
  }

  public clone(): Inert {
    return new Inert(this._node);
  }

  public isIgnored(): boolean {
    return true;
  }

  public toString(): string {
    return "ignored";
  }

  public toJSON(): Node.JSON<"inert"> {
    const result = super.toJSON();
    delete result.children;

    return result;
  }
}
