import { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Length } from "./value/length";
import { Percentage } from "./value/percentage";
import { lex } from "./syntax/lex";
import { Token } from "./syntax/token";

const { some, isEmpty } = Iterable;
const { map, either, option, pair, zeroOrMore } = Parser;

export namespace Media {
  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query-modifier
   */
  export enum Modifier {
    Only = "only",
    Not = "not"
  }

  export namespace Modifier {
    export const parse: Parser<Slice<Token>, Modifier, string> = either(
      map(Token.Ident.parse("only"), () => Modifier.Only),
      map(Token.Ident.parse("not"), () => Modifier.Not)
    );
  }

  export enum Operator {
    Not = "not",
    And = "and",
    Or = "or"
  }

  export namespace Operator {
    export const parse: Parser<Slice<Token>, Operator, string> = either(
      map(Token.Ident.parse("not"), () => Operator.Not),
      either(
        map(Token.Ident.parse("and"), () => Operator.And),
        map(Token.Ident.parse("or"), () => Operator.Or)
      )
    );
  }

  export enum Comparator {
    GreaterThan = ">",
    GreaterThanEqual = ">=",
    LessThan = "<",
    LessThanEqual = "<="
  }

  export namespace Comparator {
    export const parse: Parser<Slice<Token>, Comparator, string> = map(
      pair(
        either(
          map(Token.Delim.parse(">"), () => Comparator.GreaterThan),
          map(Token.Delim.parse("<"), () => Comparator.LessThan)
        ),
        option(Token.Delim.parse("="))
      ),
      result => {
        const [comparator, equal] = result;

        if (equal.isNone()) {
          return comparator;
        }

        if (comparator === Comparator.GreaterThan) {
          return Comparator.GreaterThanEqual;
        } else {
          return Comparator.LessThanEqual;
        }
      }
    );
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-type
   */
  export class Type {
    public static of(name: string): Type {
      return new Type(name);
    }

    public readonly name: string;

    private constructor(name: string) {
      this.name = name;
    }

    public matches(device: Device): boolean {
      return false;
    }

    public toString(): string {
      return this.name;
    }
  }

  export namespace Type {
    /**
     * @see https://drafts.csswg.org/mediaqueries/#typedef-media-type
     */
    export const parse: Parser<Slice<Token>, Type, string> = map(
      Token.Ident.parse(),
      ident => Type.of(ident.value)
    );
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query
   */
  export class Query {
    public readonly modifier: Option<Modifier>;
    public readonly type: Option<Type>;
    public readonly condition: Option<Condition>;

    private constructor(
      modifier: Option<Modifier>,
      type: Option<Type>,
      condition: Option<Condition>
    ) {
      this.modifier = modifier;
      this.type = type;
      this.condition = condition;
    }

    public matches(device: Device): boolean {
      return false;
    }
  }

  export namespace Query {
    export const parse: Parser<Slice<Token>, Query, string> = input => {
      return Err.of("Not yet implemented");
    };
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-condition
   */
  export class Condition {
    public readonly operator: Option<Operator>;
    public readonly features: Iterable<Feature | Condition>;

    private constructor(
      operator: Option<Operator>,
      features: Iterable<Feature | Condition>
    ) {
      this.operator = operator;
      this.features = Array.from(features);
    }

    public matches(device: Device): boolean {
      return false;
    }
  }

  export namespace Condition {
    // export const parse: Parser<Slice<Token>, Query, string> =
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-feature
   */
  export class Feature {
    public readonly name: string;
    public readonly value: Option<Feature.Value>;
    public readonly comparator: Option<Comparator>;

    private constructor(
      name: string,
      value: Option<Feature.Value>,
      comparator: Option<Comparator>
    ) {
      this.name = name;
      this.value = value;
      this.comparator = comparator;
    }

    public matches(device: Device): boolean {
      return false;
    }
  }

  export namespace Feature {
    export type Value = number | string | Percentage | Length;

    // export const parse: Parser<Slice<Token>, Feature, string> =
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query-list
   */
  export class List {
    public static of(queries: Iterable<Query>): List {
      return new List(queries);
    }

    public readonly queries: Iterable<Query>;

    private constructor(queries: Iterable<Query>) {
      this.queries = Array.from(queries);
    }

    public matches(device: Device): boolean {
      return (
        isEmpty(this.queries) ||
        some(this.queries, query => query.matches(device))
      );
    }
  }

  export namespace List {
    export const parse: Parser<Slice<Token>, List, string> = map(
      zeroOrMore(Query.parse),
      queries => List.of(queries)
    );
  }

  export function parse(input: string): Option<List> {
    return List.parse(Slice.of([...lex(input)]))
      .flatMap<List>(([tokens, selector]) =>
        tokens.length === 0 ? Ok.of(selector) : Err.of("Unexpected token")
      )
      .ok();
  }
}
