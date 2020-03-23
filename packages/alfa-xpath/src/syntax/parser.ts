import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Slice } from "@siteimprove/alfa-slice";

import * as parser from "@siteimprove/alfa-parser";

import { Expression } from "../expression";
import { Token } from "./token";
import { Lexer } from "./lexer";

const { fromCharCode } = String;
const {
  map,
  either,
  delimited,
  option,
  pair,
  left,
  right,
  take,
  zeroOrMore,
} = parser.Parser;
const { equals, property } = Predicate;

export namespace Parser {
  export function parse(input: string): Option<Expression> {
    return parseExpression(Slice.of(Lexer.lex(input)))
      .map(([, expression]) => expression)
      .ok();
  }
}

// Hoist the expression parser to break the recursive initialisation between its
// different subparsers.
let parseExpression: parser.Parser<Slice<Token>, Expression, string>;

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-IntegerLiteral
 */
const parseIntegerLiteral = map(Token.parseInteger, (integer) =>
  Expression.Integer.of(integer.value)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-DecimalLiteral
 */
const parseDecimalLiteral = map(Token.parseDecimal, (decimal) =>
  Expression.Decimal.of(decimal.value)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#prod-xpath31-DoubleLiteral
 */
const parseDoubleLiteral = map(Token.parseDouble, (double) =>
  Expression.Double.of(double.value)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-StringLiteral
 */
const parseStringLiteral = map(Token.parseString, (string) =>
  Expression.String.of(string.value)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-NumericLiteral
 */
const parseNumericLiteral = either(
  parseIntegerLiteral,
  either(parseDecimalLiteral, parseDoubleLiteral)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-Literal
 */
const parseLiteral = either(parseNumericLiteral, parseStringLiteral);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-ParenthesizedExpr
 */
const parseParenthesizedExpression = delimited(
  Token.parseCharacter("("),
  (input) => parseExpression(input),
  Token.parseCharacter(")")
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-ContextItemExpr
 */
const parseContextItemExpression = map(Token.parseCharacter("."), () =>
  Expression.ContextItem.of()
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-PrimaryExpr
 */
const parsePrimaryExpression = either(
  parseLiteral,
  either(parseParenthesizedExpression, parseContextItemExpression)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-ElementName
 */
const parseElementName = map(Token.parseName(), (name) => name.value);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-ElementNameOrWildcard
 */
const parseElementNameOrWildcard = either(
  parseElementName,
  map(Token.parseCharacter("*"), (character) => fromCharCode(character.value))
);

/**
 * @see https://www.w3.org/TR/xpath-31/#prod-xpath31-AttributeName
 */
const parseAttributeName = map(Token.parseName(), (name) => name.value);

/**
 * @see https://www.w3.org/TR/xpath-31/#prod-xpath31-AttribNameOrWildcard
 */
const parseAttributeNameOrWildcard = either(
  parseAttributeName,
  map(Token.parseCharacter("*"), (character) => fromCharCode(character.value))
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-TypeName
 */
const parseTypeName = map(Token.parseName(), (name) => name.value);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-DocumentTest
 */
const parseDocumentTest = map(
  pair(
    Token.parseName("document-node"),
    pair(Token.parseCharacter("("), Token.parseCharacter(")"))
  ),
  () => Expression.Test.Document.of()
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-ElementTest
 */
const parseElementTest = map(
  right(
    Token.parseName("element"),
    right(
      Token.parseCharacter("("),
      left(option(parseElementNameOrWildcard), Token.parseCharacter(")"))
    )
  ),
  (name) => Expression.Test.Element.of(name)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#prod-xpath31-AttributeTest
 */
const parseAttributeTest = map(
  right(
    Token.parseName("attribute"),
    right(
      Token.parseCharacter("("),
      left(option(parseAttributeNameOrWildcard), Token.parseCharacter(")"))
    )
  ),
  (name) => Expression.Test.Attribute.of(name)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#prod-xpath31-CommentTest
 */
const parseCommentTest = map(
  pair(
    Token.parseName("comment"),
    pair(Token.parseCharacter("("), Token.parseCharacter(")"))
  ),
  () => Expression.Test.Comment.of()
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-TextTest
 */
const parseTextTest = map(
  pair(
    Token.parseName("text"),
    pair(Token.parseCharacter("("), Token.parseCharacter(")"))
  ),
  () => Expression.Test.Text.of()
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-AnyKindTest
 */
const parseAnyKindTest = map(
  pair(
    Token.parseName("node"),
    pair(Token.parseCharacter("("), Token.parseCharacter(")"))
  ),
  () => Expression.Test.Node.of()
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-KindTest
 */
const parseKindTest = map(
  either(
    parseElementTest,
    either(
      parseAttributeTest,
      either(
        parseDocumentTest,
        either(parseCommentTest, either(parseTextTest, parseAnyKindTest))
      )
    )
  ),
  (test) => Option.of(test)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-NameTest
 */
const parseNameTest = either(
  map(Token.parseName(), (name) =>
    Option.of(Expression.Test.Name.of(name.prefix, name.value))
  ),
  map(Token.parseCharacter("*"), () => None as Option<Expression.Test.Name>)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-NodeTest
 */
const parseNodeTest = map(either(parseKindTest, parseNameTest), (test) =>
  test.isSome() ? Option.of(test.get()) : None
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-ReverseAxis
 */
const parseReverseAxis = left(
  map(
    Token.parseName(
      property(
        "value",
        equals(
          "parent",
          "ancestor",
          "preceding-sibling",
          "preceding",
          "ancestor-or-self"
        )
      )
    ),
    (name) => name.value as Expression.Axis.Type
  ),
  take(Token.parseCharacter(":"), 2)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-AbbrevReverseStep
 */
const parseAbbreviatedReverseStep = map(
  take(Token.parseCharacter("."), 2),
  () => Expression.Axis.of("parent", Option.of(Expression.Test.Node.of()))
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-ReverseStep
 */
const parseReverseStep = either(
  map(pair(parseReverseAxis, parseNodeTest), (result) => {
    const [axis, test] = result;
    return Expression.Axis.of(axis, test);
  }),
  parseAbbreviatedReverseStep
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-ForwardAxis
 */
const parseForwardAxis = left(
  map(
    Token.parseName(
      property(
        "value",
        equals(
          "child",
          "descendant",
          "attribute",
          "self",
          "descendant-or-self",
          "following-sibling",
          "following",
          "namespace"
        )
      )
    ),
    (name) => name.value as Expression.Axis.Type
  ),
  take(Token.parseCharacter(":"), 2)
);

/**
 * @see https://www.w3.org/TR/xpath-31/#prod-xpath31-AbbrevForwardStep
 */
const parseAbbreviatedForwardStep = map(
  pair(option(Token.parseCharacter("@")), parseNodeTest),
  (result) => {
    const [attribute, test] = result;

    if (attribute.isSome()) {
      return Expression.Axis.of("attribute", test);
    }

    if (
      test.some((test) => test.type === "kind" && test.kind === "attribute")
    ) {
      return Expression.Axis.of("attribute", test);
    }

    return Expression.Axis.of("child", test);
  }
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-ForwardStep
 */
const parseForwardStep = either(
  map(pair(parseForwardAxis, parseNodeTest), (result) => {
    const [axis, test] = result;
    return Expression.Axis.of(axis, test);
  }),
  parseAbbreviatedForwardStep
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-Predicate
 */
const parsePredicate = delimited(
  Token.parseCharacter("["),
  (input) => parseExpression(input),
  Token.parseCharacter("]")
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-PredicateList
 */
const parsePredicateList = zeroOrMore(parsePredicate);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-AxisStep
 */
const parseAxisStep = map(
  pair(either(parseReverseStep, parseForwardStep), parsePredicateList),
  (result) => {
    const [axis, predicates] = result;
    return Expression.Axis.of(axis.axis, axis.test, Array.from(predicates));
  }
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-PostfixExpr
 */
const parsePostfixExpression = map(
  pair(parsePrimaryExpression, zeroOrMore(parsePredicate)),
  (result) => {
    const [base, [...predicates]] = result;

    if (predicates.length === 0) {
      return base;
    }

    return Expression.Filter.of(base, predicates);
  }
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-StepExpr
 */
const parseStepExpression = either(parseAxisStep, parsePostfixExpression);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-RelativePathExpr
 */
const parseRelativePathExpression = map(
  pair(
    parseStepExpression,
    zeroOrMore(
      pair(
        either(
          map(take(Token.parseCharacter("//"), 2), () => true),
          map(Token.parseCharacter("/"), () => false)
        ),
        parseStepExpression
      )
    )
  ),
  (result) => {
    const [left, right] = result;
    return [...right].reduce((left, [expand, right]) => {
      if (expand) {
        right = Expression.Path.of(
          Expression.Axis.of(
            "descendant-or-self",
            Option.of(Expression.Test.Node.of())
          ),
          right
        );
      }

      return Expression.Path.of(left, right);
    }, left);
  }
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-PathExpr
 */
const parsePathExpression = either(
  either(
    map(
      right(take(Token.parseCharacter("/"), 2), parseRelativePathExpression),
      (right) =>
        Expression.Path.of(
          Expression.FunctionCall.of(Option.of("fn"), "root", 1, [
            Expression.Axis.of("self", Option.of(Expression.Test.Node.of())),
          ]),
          Expression.Path.of(
            Expression.Axis.of(
              "descendant-or-self",
              Option.of(Expression.Test.Node.of())
            ),
            right
          )
        )
    ),
    map(
      right(Token.parseCharacter("/"), option(parseRelativePathExpression)),
      (right) => {
        const left = Expression.FunctionCall.of(Option.of("fn"), "root", 1, [
          Expression.Axis.of("self", Option.of(Expression.Test.Node.of())),
        ]);

        if (right.isSome()) {
          return Expression.Path.of(left, right.get());
        }

        return left;
      }
    )
  ),
  parseRelativePathExpression
);

/**
 * @see https://www.w3.org/TR/xpath-31/#doc-xpath31-Expr
 */
parseExpression = parsePathExpression;
