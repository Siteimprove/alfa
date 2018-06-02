import { last } from "@siteimprove/alfa-util";
import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, Expression, Stream, Command } from "@siteimprove/alfa-lang";
import { PseudoClass, PseudoElement } from "../types";
import {
  Token,
  Whitespace,
  Delim,
  Ident,
  Comma,
  Colon,
  Bracket,
  isIdent,
  isFunctionName,
  isString,
  isDelim
} from "../alphabet";

const { isArray } = Array;

export type IdSelector = { type: "id-selector"; name: string };

export type ClassSelector = { type: "class-selector"; name: string };

export type AttributeSelector = {
  type: "attribute-selector";
  name: string;
  value: string | null;
  matcher: "~" | "|" | "^" | "$" | "*" | null;
  modifier: "i" | null;
};

export type TypeSelector = {
  type: "type-selector";
  name: string;
  namespace: string | null;
};

export type PseudoClassSelector = {
  type: "pseudo-class-selector";
  name: PseudoClass;
  value: Selector | Array<Selector> | null;
};

export type PseudoElementSelector = {
  type: "pseudo-element-selector";
  name: PseudoElement;
};

export type SimpleSelector =
  | IdSelector
  | ClassSelector
  | TypeSelector
  | AttributeSelector
  | PseudoClassSelector
  | PseudoElementSelector;

export type CompoundSelector = {
  type: "compound-selector";
  left: SimpleSelector;
  right: SimpleSelector | CompoundSelector;
};

export type ComplexSelector = SimpleSelector | CompoundSelector;

export type RelativeSelector = {
  type: "relative-selector";
  combinator: " " | ">" | "+" | "~";
  left: ComplexSelector;
  right: ComplexSelector | RelativeSelector;
};

export type Selector = ComplexSelector | RelativeSelector;

export function isSimpleSelector(
  selector: Selector
): selector is SimpleSelector {
  switch (selector.type) {
    case "id-selector":
    case "class-selector":
    case "attribute-selector":
    case "type-selector":
    case "pseudo-class-selector":
    case "pseudo-element-selector":
      return true;
    default:
      return false;
  }
}

export function isCompoundSelector(
  selector: Selector
): selector is CompoundSelector {
  return selector.type === "compound-selector";
}

export function isComplexSelector(
  selector: Selector
): selector is ComplexSelector {
  return isSimpleSelector(selector) || isCompoundSelector(selector);
}

export function isRelativeSelector(
  selector: Selector
): selector is RelativeSelector {
  return selector.type === "relative-selector";
}

export function isPseudoClassSelector(
  selector: Selector
): selector is PseudoClassSelector {
  return selector.type === "pseudo-class-selector";
}

export function isPseudoElementSelector(
  selector: Selector
): selector is PseudoElementSelector {
  return selector.type === "pseudo-element-selector";
}

export function isSelector(selector: Selector): selector is Selector {
  return isComplexSelector(selector) || isRelativeSelector(selector);
}

function isImplicitDescendant(token: Token): boolean {
  switch (token.type) {
    case "ident":
    case "[":
    case ":":
      return true;
    case "delim":
      return token.value === "." || token.value === "#" || token.value === "*";
  }

  return false;
}

function idSelector(stream: Stream<Token>): IdSelector | null {
  const ident = stream.accept(isIdent, 1);

  if (ident === false) {
    return null;
  }

  return { type: "id-selector", name: ident.value };
}

function classSelector(stream: Stream<Token>): ClassSelector | null {
  const ident = stream.accept(isIdent, 1);

  if (ident === false) {
    return null;
  }

  return { type: "class-selector", name: ident.value };
}

function typeSelector(
  token: Delim | Ident,
  stream: Stream<Token>
): TypeSelector | null {
  let name: string | null = null;
  let namespace: string | null = null;

  if (isDelim(token) && token.value === "|") {
    namespace = "";
  } else if (stream.accept(token => isDelim(token) && token.value === "|", 1)) {
    namespace = token.value.toLowerCase();
  } else {
    name = token.value.toLowerCase();
  }

  if (name === null) {
    const next = stream.next();

    if (
      next !== null &&
      (isIdent(next) || (isDelim(next) && next.value === "*"))
    ) {
      name = next.value.toLowerCase();
    } else {
      return null;
    }
  }

  return {
    type: "type-selector",
    name,
    namespace
  };
}

function attributeSelector(stream: Stream<Token>): AttributeSelector | null {
  const attribute = stream.accept(isIdent, 1);

  if (attribute === false) {
    return null;
  }

  if (stream.accept(token => token.type === "]", 1) !== false) {
    return {
      type: "attribute-selector",
      name: attribute.value,
      value: null,
      matcher: null,
      modifier: null
    };
  }

  let matcher: AttributeSelector["matcher"] = null;

  stream.accept(token => {
    if (isDelim(token)) {
      switch (token.value) {
        case "~":
        case "|":
        case "^":
        case "$":
        case "*":
          matcher = token.value;
          return true;
      }
    }

    return false;
  }, 1);

  if (
    stream.accept(token => isDelim(token) && token.value === "=", 1) === false
  ) {
    return null;
  }

  const value = stream.next();

  if (value === null || !(isIdent(value) || isString(value))) {
    return null;
  }

  stream.accept(token => token.type === "whitespace");

  let modifier: AttributeSelector["modifier"] = null;

  stream.accept(token => {
    if (isIdent(token)) {
      switch (token.value) {
        case "i":
          modifier = token.value;
          return true;
      }
    }

    return false;
  }, 1);

  if (stream.accept(token => token.type === "]", 1) === false) {
    return null;
  }

  return {
    type: "attribute-selector",
    name: attribute.value,
    value: modifier === "i" ? value.value.toLowerCase() : value.value,
    matcher,
    modifier
  };
}

function pseudoSelector(
  stream: Stream<Token>,
  expression: Expression<Selector | Array<Selector>>
): PseudoElementSelector | PseudoClassSelector | null {
  let selector: PseudoElementSelector | PseudoClassSelector;

  if (stream.accept(next => next.type === ":", 1) !== false) {
    const ident = stream.accept(isIdent, 1);

    if (ident === false) {
      return null;
    }

    let name: PseudoElement;

    switch (ident.value) {
      case "first-line":
      case "first-letter":
      case "selection":
      case "inactive-selection":
      case "spelling-error":
      case "grammar-error":
      case "before":
      case "after":
      case "marker":
      case "placeholder":
        name = ident.value;
        break;
      default:
        return null;
    }

    selector = { type: "pseudo-element-selector", name };
  } else {
    const ident = stream.next();

    if (ident === null || (!isIdent(ident) && !isFunctionName(ident))) {
      return null;
    }

    let name: PseudoClass;

    switch (ident.value) {
      case "matches":
      case "not":
      case "something":
      case "has":
      case "dir":
      case "lang":
      case "any-link":
      case "link":
      case "visited":
      case "local-link":
      case "target":
      case "target-within":
      case "scope":
      case "hover":
      case "active":
      case "focus":
      case "focus-visible":
      case "focus-within":
      case "drop":
      case "current":
      case "past":
      case "future":
      case "playing":
      case "paused":
      case "enabled":
      case "disabled":
      case "read-only":
      case "read-write":
      case "placeholder-shown":
      case "default":
      case "checked":
      case "indetermine":
      case "valid":
      case "invalid":
      case "in-range":
      case "out-of-range":
      case "required":
      case "user-invalid":
      case "root":
      case "empty":
      case "blank":
      case "nth-child":
      case "nth-last-child":
      case "first-child":
      case "last-child":
      case "only-child":
      case "nth-of-type":
      case "nth-last-of-type":
      case "first-of-type":
      case "last-of-type":
      case "only-of-type":
      case "nth-col":
      case "nth-last-col":
        name = ident.value;
        break;
      default:
        return null;
    }

    if (isIdent(ident)) {
      selector = { type: "pseudo-class-selector", name, value: null };
    } else {
      const value = expression();

      if (stream.accept(token => token.type === ")", 1) === false) {
        return null;
      }

      selector = { type: "pseudo-class-selector", name, value };
    }
  }

  return selector;
}

function compoundSelector(
  left: ComplexSelector,
  right: ComplexSelector | null
): CompoundSelector | null {
  if (isPseudoElementSelector(left)) {
    return null;
  }

  if (isCompoundSelector(left)) {
    right = compoundSelector(left.right, right);
    left = left.left;
  }

  if (right === null) {
    return null;
  }

  return {
    type: "compound-selector",
    left,
    right
  };
}

function relativeSelector(
  left: Selector,
  right: Selector | null,
  combinator: RelativeSelector["combinator"]
): RelativeSelector | null {
  if (isPseudoElementSelector(left)) {
    return null;
  }

  if (isRelativeSelector(left)) {
    right = relativeSelector(left.right, right, combinator);
    combinator = left.combinator;
    left = left.left;
  }

  if (right === null) {
    return null;
  }

  return {
    type: "relative-selector",
    combinator,
    left,
    right
  };
}

function selector(
  left: Selector,
  right: ComplexSelector | null
): Selector | null {
  if (isComplexSelector(left)) {
    return compoundSelector(left, right);
  }

  if (isComplexSelector(left.right)) {
    return relativeSelector(
      left.left,
      compoundSelector(left.right, right),
      left.combinator
    );
  }

  return relativeSelector(
    left.left,
    selector(left.right, right),
    left.combinator
  );
}

function selectorList(
  left: Selector | Array<Selector>,
  right: Selector | Array<Selector> | null
): Array<Selector> | null {
  if (right === null) {
    return null;
  }

  const selectors = isArray(left) ? left : [left];

  if (isPseudoElementSelector(last(selectors)!)) {
    return null;
  }

  if (isArray(right)) {
    selectors.push(...right);
  } else {
    selectors.push(right);
  }

  return selectors;
}

function combineSelectors(
  left: Selector | Array<Selector>,
  right: Selector | Array<Selector> | null,
  combinator?: RelativeSelector["combinator"]
): Selector | Array<Selector> | null {
  if (right === null) {
    return null;
  }

  if (isArray(left) || isArray(right)) {
    return selectorList(left, right);
  }

  if (combinator !== undefined) {
    return relativeSelector(left, right, combinator);
  }

  if (isComplexSelector(right)) {
    return selector(left, right);
  }

  return null;
}

type Production<T extends Token> = Lang.Production<
  Token,
  Selector | Array<Selector>,
  T
>;

const whitespace: Production<Whitespace> = {
  token: "whitespace",

  prefix(token, stream, expression) {
    return Command.Continue;
  },

  infix(token, stream, expression, left) {
    const next = stream.peek();

    if (next !== null && isImplicitDescendant(next)) {
      return combineSelectors(left, expression(), " ");
    }

    return Command.Continue;
  }
};

const delim: Production<Delim> = {
  token: "delim",

  prefix(token, stream) {
    switch (token.value) {
      case "#":
        return idSelector(stream);
      case ".":
        return classSelector(stream);
      case "*":
      case "|":
        return typeSelector(token, stream);
    }

    return null;
  },

  infix(token, stream, expression, left) {
    switch (token.value) {
      case "#":
        return combineSelectors(left, idSelector(stream));
      case ".":
        return combineSelectors(left, classSelector(stream));
      case "*":
      case "|":
        return combineSelectors(left, typeSelector(token, stream));

      case ">":
      case "+":
      case "~":
        return combineSelectors(left, expression(), token.value);
    }

    return null;
  }
};

const ident: Production<Ident> = {
  token: "ident",

  prefix(token, stream) {
    return typeSelector(token, stream);
  }
};

const comma: Production<Comma> = {
  token: ",",

  infix(token, stream, expression, left) {
    return selectorList(left, expression());
  }
};

const bracket: Production<Bracket> = {
  token: "[",

  prefix(token, stream) {
    return attributeSelector(stream);
  },

  infix(token, stream, expression, left) {
    return combineSelectors(left, attributeSelector(stream));
  }
};

const colon: Production<Colon> = {
  token: ":",

  prefix(token, stream, expression) {
    return pseudoSelector(stream, expression);
  },

  infix(token, stream, expression, left) {
    return combineSelectors(left, pseudoSelector(stream, expression));
  }
};

export const SelectorGrammar: Grammar<
  Token,
  Selector | Array<Selector>
> = new Grammar([[delim, ident, colon, bracket], whitespace, comma]);
