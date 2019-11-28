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

  private readonly declarations: Array<Declaration>;

  private constructor(declarations: Iterable<Declaration>) {
    this.declarations = Array.from(declarations);
  }

  public declaration(
    predicate: string | Predicate<Declaration>
  ): Option<Declaration> {
    return find(
      this.declarations,
      typeof predicate === "string"
        ? declaration => declaration.name === predicate
        : predicate
    );
  }

  public *[Symbol.iterator](): Iterator<Declaration> {
    yield* this.declarations;
  }

  public toJSON(): Block.JSON {
    return this.declarations.map(declaration => declaration.toJSON());
  }

  public toString(): string {
    return join(
      map(this.declarations, declaration => declaration.toString()),
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
