import { Length, Lexer, Percentage, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

const { some, isEmpty } = Iterable;
const {
  map,
  either,
  option,
  pair,
  left,
  right,
  delimited,
  zeroOrMore
} = Parser;

export namespace Media {
  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query-modifier
   */
  export enum Modifier {
    Only = "only",
    Not = "not"
  }

  const parseModifier = either(
    map(Token.parseIdent("only"), () => Modifier.Only),
    map(Token.parseIdent("not"), () => Modifier.Not)
  );

  export enum Combinator {
    And = "and",
    Or = "or"
  }

  export enum Comparator {
    GreaterThan = ">",
    GreaterThanEqual = ">=",
    LessThan = "<",
    LessThanEqual = "<="
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

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-type
   */
  const parseType = map(Token.parseIdent(), ident => Type.of(ident.value));

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-feature
   */
  export class Feature {
    public static of(
      name: string,
      value: Option<Feature.Value> = None,
      comparator: Option<Comparator> = None
    ): Feature {
      return new Feature(name, value, comparator);
    }
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
  }

  export const isFeature: Predicate<unknown, Feature> = value =>
    value instanceof Feature;

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-name
   */
  const parseFeatureName = map(Token.parseIdent(), ident => ident.value);

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-value
   */
  const parseFeatureValue = map(
    either(Token.parseNumber(), Token.parseString()),
    number => number.value
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-plain
   */
  const parseFeaturePlain = map(
    pair(
      parseFeatureName,
      right(
        delimited(option(Token.parseWhitespace), Token.parseColon),
        parseFeatureValue
      )
    ),
    result => {
      const [name, value] = result;

      return Feature.of(name, Option.of(value));
    }
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-boolean
   */
  const parseFeatureBoolean = map(parseFeatureName, name => Feature.of(name));

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-feature
   */
  const parseFeature = delimited(
    Token.parseOpenParenthesis,
    delimited(
      option(Token.parseWhitespace),
      either(parseFeaturePlain, parseFeatureBoolean)
    ),
    Token.parseCloseParenthesis
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-condition
   */
  export class Condition {
    public static of(
      combinator: Combinator,
      left: Feature | Condition | Negation,
      right: Feature | Condition | Negation
    ): Condition {
      return new Condition(combinator, left, right);
    }

    public readonly combinator: Combinator;
    public readonly left: Feature | Condition | Negation;
    public readonly right: Feature | Condition | Negation;

    private constructor(
      operator: Combinator,
      left: Feature | Condition | Negation,
      right: Feature | Condition | Negation
    ) {
      this.combinator = operator;
      this.left = left;
      this.right = right;
    }

    public matches(device: Device): boolean {
      return false;
    }
  }

  export const isCondition: Predicate<unknown, Condition> = value =>
    value instanceof Condition;

  export class Negation {
    public static of(condition: Feature | Condition | Negation): Negation {
      return new Negation(condition);
    }

    public readonly condition: Feature | Condition | Negation;

    private constructor(condition: Feature | Condition | Negation) {
      this.condition = condition;
    }
  }

  export const isNegation: Predicate<unknown, Negation> = value =>
    value instanceof Negation;

  // Hoist the condition parser to break the recursive initialisation between
  // its different subparsers.
  let parseCondition: Parser<
    Slice<Token>,
    Feature | Condition | Negation,
    string
  >;

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-in-parens
   */
  const parseInParens = either(
    delimited(
      Token.parseOpenParenthesis,
      delimited(option(Token.parseWhitespace), input => parseCondition(input)),
      Token.parseCloseParenthesis
    ),
    parseFeature
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-not
   */
  const parseNot = map(
    right(left(Token.parseIdent("not"), Token.parseWhitespace), parseInParens),
    condition => Negation.of(condition)
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-and
   */
  const parseAnd = right(
    left(Token.parseIdent("and"), Token.parseWhitespace),
    parseInParens
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-or
   */
  const parseOr = right(Token.parseIdent("or"), parseInParens);

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-condition
   */
  parseCondition = either(
    parseNot,
    either(
      parseInParens,
      either(
        map(pair(parseInParens, zeroOrMore(parseAnd)), result => {
          const [left, right] = result;
          return [left, ...right].reduce((left, right) =>
            Condition.of(Combinator.And, left, right)
          );
        }),
        map(pair(parseInParens, zeroOrMore(parseOr)), result => {
          const [left, right] = result;
          return [left, ...right].reduce((left, right) =>
            Condition.of(Combinator.Or, left, right)
          );
        })
      )
    )
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-condition-without-or
   */
  const parseConditionWithoutOr = either(
    parseNot,
    map(pair(parseInParens, zeroOrMore(parseAnd)), result => {
      const [left, right] = result;
      return [left, ...right].reduce((left, right) =>
        Condition.of(Combinator.And, left, right)
      );
    })
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query
   */
  export class Query {
    public static of(
      modifier: Option<Modifier>,
      type: Option<Type>,
      condition: Option<Feature | Condition | Negation>
    ): Query {
      return new Query(modifier, type, condition);
    }

    public readonly modifier: Option<Modifier>;
    public readonly type: Option<Type>;
    public readonly condition: Option<Feature | Condition | Negation>;

    private constructor(
      modifier: Option<Modifier>,
      type: Option<Type>,
      condition: Option<Feature | Condition | Negation>
    ) {
      this.modifier = modifier;
      this.type = type;
      this.condition = condition;
    }

    public matches(device: Device): boolean {
      return false;
    }
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-query
   */
  const parseQuery = either(
    map(parseCondition, condition =>
      Query.of(None, None, Option.of(condition))
    ),
    map(
      pair(
        pair(option(parseModifier), parseType),
        option(
          right(
            delimited(Token.parseWhitespace, Token.parseIdent("and")),
            parseConditionWithoutOr
          )
        )
      ),
      result => {
        const [[modifier, type], condition] = result;
        return Query.of(modifier, Option.of(type), condition);
      }
    )
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query-list
   */
  export class List implements Iterable<Query> {
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

    public *[Symbol.iterator](): Iterator<Query> {
      yield* this.queries;
    }
  }

  export const parseList = map(zeroOrMore(parseQuery), queries =>
    List.of(queries)
  );

  export function parse(input: string): Option<List> {
    return parseList(Slice.of([...Lexer.lex(input)]))
      .flatMap<List>(([tokens, selector]) =>
        tokens.length === 0 ? Ok.of(selector) : Err.of("Unexpected token")
      )
      .ok();
  }
}
