# @siteimprove/alfa-lang

This package provides functionality for implementing efficient lexers and parsers for formal languages. The goal is to provide framework developers and rule implementors with a set of tools for building very flexible and granular lexers and parsers that can be used a variety of situations; CSS selector parsing, HTML validation, static JavaScript analysis, and more.

## Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

```console
$ yarn add @siteimprove/alfa-lang
```

## Usage

In defining languages, we rely on four central concepts: _Patterns_ for forming _alphabets_, and _productions_ for forming _grammars_. The former is based on [finite-state machine](https://en.wikipedia.org/wiki/Finite-state_machine) lexing while the latter is based on [top down operator precedence](https://en.wikipedia.org/wiki/Pratt_parser) parsing. In the following sections, we provide examples of how to define an alphabet and a grammar for a simple mathematical expression language also found as part of the test suite of this package: [test/helpers/expression.ts](test/helpers/expression.ts).

```ts
export interface Constant {
  readonly type: "constant";
  readonly value: number;
}

export interface Operator {
  readonly type: "operator";
  readonly value: "+" | "-" | "*" | "/" | "^";
  readonly left: Expression;
  readonly right: Expression;
}

export type Expression = Constant | Operator;
```

Using these interfaces, we can model _constants_, such as `1`, and _operators_, such as `_ + _`. Together, these form simple mathematical expressions such as `1 + 2 + 3`. What is interesting about mathematical expressions from the perspective of formal languages is that both _precedence_ and _associativity_ plays a role. For example, given a string such as `1 + 2 * 3` we want to ensure that it is interpreted as `1 + (2 * 3)`, and not `(1 + 2) * 3`, as the `*` operator takes precedence over the `+` operator. We also want to ensure that a string such as `1 ^ 2 ^ 3` is interpreted as `1 ^ (2 ^ 3)` as the `^` operator is right associative. Conversely, a string such as `1 - 2 + 3` should be interpreted as `(1 - 2) + 3` as both the `+` and `-` operators are left associative.

### Patterns

A pattern is a function that acts as a _state_ in a finite-state machine. The purpose of a pattern is to recognise certain combinations of input characters in a stream and optionally emit tokens when these occur. When a pattern has finished processing the stream of input characters, and either found a matching combination of characters or not, it may then return another pattern to further process the stream. This corresponds to a _transition_ between states in a finite-state machine.

For lexing our simple mathematical expressions, we will define three patterns: `initial`, `constant`, and `operator`. Be sure to check out the actual source code of these patterns as things have been left out for brevity: [test/helpers/expression/alphabet.ts](test/helpers/expression/alphabet.ts)

The `initial` pattern skips whitespace characters and determines if there are input characters left in the stream. If so, it hands off the stream to either the `constant` or `operator` pattern:

```ts
const initial: Pattern = (stream, emit, state, { exit }) => {
  stream.accept(isWhitespace);

  const char = stream.peek(0);

  if (char === null) {
    return exit;
  }

  return isNumeric(char) ? constant : operator;
};
```

The `constant` pattern consumes consecutive occurences of numeric input characters and reduces these to a single integer value:

```ts
const constant: Pattern = (stream, emit) => {
  const result: Array<number> = [];

  stream.accept(isNumeric, result);

  emit({
    type: TokenType.Number,
    value: result.reduce((value, char) => 10 * value + char - Char.DigitZero, 0)
  });

  return initial;
};
```

The `operator` pattern looks for a valid operator (`+`, `-`, `*`, `/`, and `^`) and throws an exception if an unknown operator is encountered:

```ts
const operator: Pattern = (stream, emit) => {
  const char = stream.next()!;

  switch (char) {
    case Char.PlusSign:
      emit({ type: TokenType.Add });
      break;
    case Char.HyphenMinus:
      emit({ type: TokenType.Subtract });
      break;
    case Char.Asterisk:
      emit({ type: TokenType.Multiply });
      break;
    case Char.Solidus:
      emit({ type: TokenType.Divide });
      break;
    case Char.CircumflexAccent:
      emit({ type: TokenType.Exponentiate });
      break;
    default:
      throw new Error(`Unknown operator: ${fromCharCode(char)}`);
  }

  return initial;
};
```

Note that both the `constant` and `operator` patterns return the `initial` pattern upon completion, allowing the process to start over whenever a token has been emitted.

With all patterns defined, we can construct our alphabet:

```ts
export const Alphabet: Lang.Alphabet<Token> = new Lang.Alphabet(
  initial,
  () => null
);
```

### Productions

A production is an object that associates _semantics_ with a given token as part of top down operator precedence parsing. Productions distinguish between tokens in two different positions: Prefix and infix. A token in prefix position occurs _before_ any other tokens in a language construct while a token in infix position occurs _between_ other tokens in a language construct. In the literature, the terms "null denotation" and "left denotation" are often used instead of "prefix position" and "infix position", respectively; however, the terms mean the same thing.

For parsing our simple mathematical expressions, we define one production for each type of token lexed: `Number`, `Add`, `Subtract`, `Multiple`, `Divide`, and `Exponentiate`. Do note that it will typically not be necessary to define productions for all tokens in a given language. If, for example, we were to add parentheses to our mathematical expression language, two additional tokens would be needed, `LeftParen` (`(`) and `RightParen` (`)`), but only one additional production; as parentheses must always exist in pairs, the production for `LeftParen` would also need to consume an associated `RightParen`.

The first production we define consumes a `Number` token and produces a `Constant`:

```ts
const number: Production<Tokens.Number, Constant> = {
  token: TokenType.Number,

  prefix(token) {
    return { type: "constant", value: token.value };
  }
};
```

As `Number` tokens can only appear in prefix position, we only need to define the `prefix()` method for the production.

Next, we define productions for consuming `Add` and `Subtract` tokens and producing either an `Operator` or a `Constant`; the two productions are almost identical, so only one is included here:

```ts
const addition: Production<Tokens.Add, Constant | Operator> = {
  token: TokenType.Add,

  prefix(token, stream) {
    const next = stream.next();

    if (next === null || !isNumber(next)) {
      throw new Error("Expected number");
    }

    return {
      type: "constant",
      value: next.value
    };
  },

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "+", left, right };
  }
};
```

As `Add` and `Subtract` tokens can appear in both prefix and infix positions, we define both the `prefix()` and `infix()` method for the production. When used in prefix position, `Add` and `Subtract` tokens indicate the sign of an associated `Number` token, such as `-1` or `+3`, and therefore produce a `Constant`. When used in infix position, `Add` and `Subtract` tokens instead denote the binary addition and subtraction operations, such as `1 - 3`, and therefore produce an `Operator`.

Productions for `Multiply` and `Divide` tokens are close to identical to the productions for `Add` and `Subtract` tokens with the exception that they cannot be used in prefix position and therefore do not define the `prefix()` method.As such, we will move on to define a production for the `Exponentiate` token:

```ts
const exponentiation: Production<Tokens.Exponentiate, Operator> = {
  token: TokenType.Exponentiate,
  associate: "right",

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "^", left, right };
  }
};
```

While this production is also close to identical to the productions for the `Multiply` and `Divide` tokens, it does define an additional property that we have not yet seen: `associate`. This property defines the associativity of the production, and since exponentiation is right associative, we assign the property a value of `"right"`.

With all productions defined, we can construct our grammar:

```ts
export const Grammar: Lang.Grammar<Token, Expression> = new Lang.Grammar(
  [number, exponentiation, [multiplication, division], [addition, subtraction]],
  () => null
);
```

In defining our grammar, we also define the precendence of each production: Productions higher in the list of productions take precendence over productions lower in the list. Productions with equal precendence can further be grouped in lists of their own. As such, exponentiation has higher precendence than multiplication, which has the same precendence as division and higher precedence than addition and subtraction.
