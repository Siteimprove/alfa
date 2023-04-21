import { Array } from "@siteimprove/alfa-array";
import { Component, Keyword, Lexer } from "@siteimprove/alfa-css";
import { Token } from "@siteimprove/alfa-css";
import type { Declaration } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Set } from "@siteimprove/alfa-set";
import { Slice } from "@siteimprove/alfa-slice";

import { Value } from "./value";

const { delimited, left, map, option, pair, right, takeUntil } = Parser;

/**
 * Utilities for manipulating CSS variable declarations (--foo: bar)
 *
 * @internal
 */
export namespace Variable {
  /**
   * mapping each variable name to its declared value.
   */
  type DefinitionMap = Map<string, Value<Slice<Token>>>;

  /**
   * Gather variables that are declared on the declarations.
   * The same variable may be declared several times, so we rely on
   * declarations being pre-ordered by decreasing specificity and only take
   * the first declaration.
   *
   * This builds a map from variable names to their lexed value
   * i.e. "--foo: lorem ipsum" becomes "foo => [lorem, ipsum]"
   **/
  export function gather(
    declarations: Array<Declaration>,
    shouldOverride: <T>(
      previous: Option<Value<T>>,
      next: Declaration
    ) => boolean
  ): DefinitionMap {
    let currentVariables: DefinitionMap = Map.empty();

    for (const declaration of declarations.filter((declaration) =>
      declaration.name.startsWith("--")
    )) {
      const { name, value } = declaration;
      const previous = currentVariables.get(name);

      if (shouldOverride(previous, declaration)) {
        currentVariables = currentVariables.set(
          name,
          Value.of(Lexer.lex(value), Option.of(declaration))
        );
      }
    }

    return currentVariables;
  }

  /**
   * "Flatten" a variable definition map by pre-substituting variables that are
   * defined in the map.
   * That is, take a "name => slice" map, search for all the "var(--foo)" in
   * the slice, and replace them by their value in the map. Recursively.
   */
  export function flatten(variables: DefinitionMap) {
    for (const [name, variable] of variables) {
      const substitution = substitute(variable.value, variables);

      // If the replaced value is valid, use the replaced value as the new value of the variable.
      if (substitution.isSome()) {
        const [tokens] = substitution.get();

        variables = variables.set(name, Value.of(tokens, variable.source));
      } else {
        // Otherwise, remove the variable entirely.
        variables = variables.delete(name);
      }
    }

    return variables;
  }

  const parseInitial = Keyword.parse("initial");

  /**
   * Resolve a cascading variable with an optional fallback. The value of the
   * variable, if defined, will have `var()` functions fully substituted.
   *
   * @remarks
   * This method uses a set of visited names to detect cyclic dependencies
   * between cascading variables. The set is local to each `Style` instance as
   * cyclic references can only occur between cascading variables defined on the
   * same element.
   *
   * @remarks
   * The fallback isn't pre-resolved/substituted until needed.
   * This is not only a performance optimisation but also ensure that we don't
   * need to handle invalid fallback that wouldn't be needed if the variable
   * resolves successfully.
   */
  function resolve(
    name: string,
    variables: DefinitionMap,
    fallback: Option<Slice<Token>> = None,
    visited = Set.empty<string>()
  ): Option<Slice<Token>> {
    return (
      // If the variable is defined on the current definition map, get its value
      variables
        .get(name)
        .map((value) => value.value)

        // The initial value of a custom property is the "guaranteed-invalid"
        // value. We therefore reject the value of the variable if it's the
        // keyword `initial`.
        // https://drafts.csswg.org/css-variables/#guaranteed-invalid
        .reject((tokens) => parseInitial(tokens).isOk())

        // If the value of the variable is invalid, as indicated by it being
        // `None`, we instead use the fallback value, if available.
        // https://drafts.csswg.org/css-variables/#invalid-variables
        .orElse(() =>
          fallback
            // Substitute any additional cascading variables within the fallback
            // value. This substitution happens in the current style's context.
            .flatMap((tokens) =>
              substitute(tokens, variables, visited.add(name)).map(
                ([tokens]) => tokens
              )
            )
        )
    );
  }

  /**
   * The maximum allowed number of tokens that declaration values with `var()`
   * functions may expand to.
   *
   * {@link https://drafts.csswg.org/css-variables/#long-variables}
   */
  const substitutionLimit = 1024;

  /**
   * Substitute all `var()` functions in a slice of tokens. If any syntactically
   * invalid `var()` functions are encountered, `None` is returned.
   *
   * {@link https://drafts.csswg.org/css-variables/#substitute-a-var}
   *
   * @remarks
   * This method uses a set of visited names to detect cyclic dependencies
   * between cascading variables. The set is local to each `Style` instance as
   * cyclic references can only occur between cascading variables defined on the
   * same element.
   */
  export function substitute(
    tokens: Slice<Token>,
    variables: DefinitionMap,
    visited = Set.empty<string>()
  ): Option<[tokens: Slice<Token>, substituted: boolean]> {
    const replaced: Array<Token> = [];

    let substituted = false;

    while (tokens.length > 0) {
      // `tokens` is not empty due to the previous test.
      const next = tokens.first().getUnsafe();

      if (next.type === "function" && next.value === "var") {
        // If the token is a "var(", process it.
        const result = parseVar(tokens);

        if (!result.isOk()) {
          return None;
        }

        const [remaining, [name, fallback]] = result.get();
        tokens = remaining;

        // If we've already seen this variable, bail out (circular reference).
        if (visited.has(name)) {
          return None;
        }

        // Resolve the variable's name within the current context.
        const value = resolve(name, variables, fallback, visited);

        if (!value.isSome()) {
          return None;
        }

        // Push the resulting value, replacing the initial token
        replaced.push(...value.get());
        substituted = true;
      } else {
        // If the token is not a "var(", push it to the result, and move on.
        replaced.push(next);
        tokens = tokens.rest();
      }
    }

    // If substitution occurred and the number of replaced tokens has exceeded
    // the substitution limit, bail out.
    if (substituted && replaced.length > substitutionLimit) {
      return None;
    }

    return Option.of<[tokens: Slice<Token>, substituted: boolean]>([
      Slice.of(replaced),
      substituted,
    ]);
  }

  /**
   * Parses a `var()` function
   *
   * {@link https://drafts.csswg.org/css-variables/#funcdef-var}
   */
  const parseVar = right(
    Token.parseFunction("var"),
    pair(
      map(
        delimited(
          option(Token.parseWhitespace),
          Token.parseIdent((ident) => ident.value.startsWith("--"))
        ),
        (ident) => ident.value
      ),
      left(
        option(
          right(
            pair(Token.parseComma, option(Token.parseWhitespace)),
            map(
              takeUntil(Component.consume, Token.parseCloseParenthesis),
              (components) => Slice.of([...Iterable.flatten(components)])
            )
          )
        ),
        Token.parseCloseParenthesis
      )
    )
  );
}
