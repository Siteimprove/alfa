import { last } from "@siteimprove/alfa-util";
import * as Lang from "@siteimprove/alfa-lang";
import {
  Grammar,
  Expression,
  Stream,
  Command,
  Char
} from "@siteimprove/alfa-lang";
import { PseudoClass, PseudoElement } from "../types";
import {
  Token,
  Whitespace,
  Delim,
  Ident,
  Comma,
  Colon,
  Bracket
} from "../alphabet";

const { isArray } = Array;
const { fromCharCode } = String;

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
  if (token.type === "ident" || token.type === "[" || token.type === ":") {
    return true;
  }

  if (token.type === "delim") {
    const { value } = token;
    return (
      value === Char.FullStop ||
      value === Char.NumberSign ||
      value === Char.Asterisk
    );
  }

  return false;
}

function idSelector(stream: Stream<Token>): IdSelector | null {
  const next = stream.next();

  if (next === null || next.type !== "ident") {
    return null;
  }

  return { type: "id-selector", name: next.value };
}

function classSelector(stream: Stream<Token>): ClassSelector | null {
  const next = stream.next();

  if (next === null || next.type !== "ident") {
    return null;
  }

  return { type: "class-selector", name: next.value };
}

function typeSelector(
  token: Delim | Ident,
  stream: Stream<Token>
): TypeSelector | null {
  let name: string | null = null;
  let namespace: string | null = null;

  if (token.type === "delim" && token.value === Char.VerticalLine) {
    namespace = "";
  } else {
    const value =
      token.type === "delim" ? fromCharCode(token.value) : token.value;

    const next = stream.peek();

    if (
      next !== null &&
      next.type === "delim" &&
      token.value === Char.VerticalLine
    ) {
      stream.advance();
      namespace = value.toLowerCase();
    } else {
      name = value.toLowerCase();
    }
  }

  if (name === null) {
    const next = stream.next();

    if (next === null) {
      return null;
    }

    if (next.type === "delim" && next.value === Char.Asterisk) {
      name = "*";
    } else if (next.type === "ident") {
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
  let next = stream.next();

  if (next === null || next.type !== "ident") {
    return null;
  }

  const name = next.value;

  next = stream.peek();

  if (next !== null && next.type === "]") {
    stream.advance();

    return {
      type: "attribute-selector",
      name,
      value: null,
      matcher: null,
      modifier: null
    };
  }

  let matcher: "~" | "|" | "^" | "$" | "*" | null = null;

  next = stream.peek();

  if (next !== null && next.type === "delim") {
    switch (next.value) {
      case Char.Tilde:
        matcher = "~";
        break;
      case Char.VerticalLine:
        matcher = "|";
        break;
      case Char.CircumflexAccent:
        matcher = "^";
        break;
      case Char.DollarSign:
        matcher = "$";
        break;
      case Char.Asterisk:
        matcher = "*";
    }

    if (matcher !== null) {
      stream.advance();
    }
  }

  next = stream.next();

  if (next === null || next.type !== "delim" || next.value !== Char.EqualSign) {
    return null;
  }

  next = stream.next();

  if (next === null || (next.type !== "string" && next.type !== "ident")) {
    return null;
  }

  const value = next.value;

  stream.accept(token => token.type === "whitespace");

  let modifier: "i" | null = null;

  next = stream.peek();

  if (next !== null && next.type === "ident") {
    switch (next.value) {
      case "i":
        modifier = "i";
    }

    if (modifier !== null) {
      stream.advance();
    }
  }

  next = stream.next();

  if (next === null || next.type !== "]") {
    return null;
  }

  return {
    type: "attribute-selector",
    name,
    value: modifier === "i" ? value.toLowerCase() : value,
    matcher,
    modifier
  };
}

function pseudoSelector(
  stream: Stream<Token>,
  expression: Expression<Selector | Array<Selector>>
): PseudoElementSelector | PseudoClassSelector | null {
  let selector: PseudoElementSelector | PseudoClassSelector;

  let next = stream.next();

  if (next === null) {
    return null;
  }

  if (next.type === ":") {
    next = stream.next();

    if (next === null || next.type !== "ident") {
      return null;
    }

    let name: PseudoElement;

    switch (next.value) {
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
        name = next.value;
        break;
      default:
        return null;
    }

    selector = { type: "pseudo-element-selector", name };
  } else {
    if (next.type !== "ident" && next.type !== "function-name") {
      return null;
    }

    let name: PseudoClass;

    switch (next.value) {
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
        name = next.value;
        break;
      default:
        return null;
    }

    if (next.type === "ident") {
      selector = { type: "pseudo-class-selector", name, value: null };
    } else {
      const value = expression();

      next = stream.next();

      if (next === null || next.type !== ")") {
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
      case Char.NumberSign:
        return idSelector(stream);
      case Char.FullStop:
        return classSelector(stream);
      case Char.Asterisk:
      case Char.VerticalLine:
        return typeSelector(token, stream);
    }

    return null;
  },

  infix(token, stream, expression, left) {
    switch (token.value) {
      case Char.NumberSign:
        return combineSelectors(left, idSelector(stream));
      case Char.FullStop:
        return combineSelectors(left, classSelector(stream));
      case Char.Asterisk:
      case Char.VerticalLine:
        return combineSelectors(left, typeSelector(token, stream));

      case Char.GreaterThanSign:
        return combineSelectors(left, expression(), ">");
      case Char.PlusSign:
        return combineSelectors(left, expression(), "+");
      case Char.Tilde:
        return combineSelectors(left, expression(), "~");
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
