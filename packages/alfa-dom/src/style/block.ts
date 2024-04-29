import { Declaration as CSSDeclaration, Lexer } from "@siteimprove/alfa-css";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Declaration } from "./declaration";

/**
 * @public
 */
export class Block implements Iterable<Declaration>, Equatable, Serializable {
  public static of(declarations: Iterable<Declaration>): Block {
    return new Block(Array.from(declarations));
  }

  private _declarations: Array<Declaration>;

  private constructor(declarations: Array<Declaration>) {
    this._declarations = declarations;
  }

  public get declarations(): Iterable<Declaration> {
    return this._declarations;
  }

  public get size(): number {
    return this._declarations.length;
  }

  public isEmpty(): boolean {
    return this._declarations.length === 0;
  }

  public declaration(
    predicate: string | Predicate<Declaration>,
  ): Option<Declaration> {
    return Option.from(
      this._declarations.find(
        typeof predicate === "string"
          ? (declaration) => declaration.name === predicate
          : predicate,
      ),
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Block &&
      value._declarations.length === this._declarations.length &&
      value._declarations.every((declaration, i) =>
        declaration.equals(this._declarations[i]),
      )
    );
  }

  public *[Symbol.iterator](): Iterator<Declaration> {
    yield* this._declarations;
  }

  public toJSON(): Block.JSON {
    return this._declarations.map((declaration) => declaration.toJSON());
  }

  public toString(): string {
    return this._declarations.join(";\n");
  }
}

/**
 * @public
 */
export namespace Block {
  export type JSON = Array<Declaration.JSON>;

  export function from(jsonOrText: JSON | string): Block {
    if (typeof jsonOrText === "string") {
      return Block.of(
        Iterable.map(
          CSSDeclaration.parseList(Lexer.lex(jsonOrText)).getUnsafe(
            `Could not parse CSS declarations "${jsonOrText}"`,
          )[1],
          (declaration) =>
            Declaration.from({
              name: declaration.name,
              value: declaration.value.join(""),
              important: declaration.important,
            }),
        ),
      );
    } else {
      return Block.of(jsonOrText.map(Declaration.from));
    }
  }
}
