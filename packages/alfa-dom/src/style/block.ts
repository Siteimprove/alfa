import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Declaration } from "./declaration";
import { Rule } from "./rule";

const { map, find, join } = Iterable;

export class Block implements Iterable<Declaration> {
  public static of(declarations: Iterable<Declaration>): Block {
    return new Block(declarations);
  }

  private readonly _declarations: Array<Declaration>;

  private constructor(declarations: Iterable<Declaration>) {
    this._declarations = Array.from(declarations);
  }

  public get declarations(): Iterable<Declaration> {
    return this._declarations;
  }

  public declaration(
    predicate: string | Predicate<Declaration>
  ): Option<Declaration> {
    return find(
      this._declarations,
      typeof predicate === "string"
        ? declaration => declaration.name === predicate
        : predicate
    );
  }

  public *[Symbol.iterator](): Iterator<Declaration> {
    yield* this._declarations;
  }

  public toJSON(): Block.JSON {
    return this._declarations.map(declaration => declaration.toJSON());
  }

  public toString(): string {
    return join(
      map(this._declarations, declaration => declaration.toString()),
      ";\n"
    );
  }
}

export namespace Block {
  export type JSON = Array<Declaration.JSON>;

  export function fromBlock(block: JSON, parent: Option<Rule> = None): Block {
    return Block.of(
      [...block].map(json => Declaration.fromDeclaration(json, parent))
    );
  }
}
