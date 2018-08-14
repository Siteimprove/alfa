import * as Lang from "@siteimprove/alfa-lang";
import {
  Char,
  Command,
  Expression,
  Grammar,
  Stream
} from "@siteimprove/alfa-lang";
import {
  Colon,
  Comma,
  Delim,
  Hash,
  Ident,
  SquareBracket,
  Token,
  TokenType,
  Whitespace
} from "../alphabet";
import { PseudoClass, PseudoElement } from "../types";

const { isArray } = Array;
const { fromCharCode } = String;

export const enum SelectorType {
  IdSelector = 1,
  ClassSelector = 2,
  AttributeSelector = 4,
  TypeSelector = 8,
  PseudoClassSelector = 16,
  PseudoElementSelector = 32,
  CompoundSelector = 64,
  RelativeSelector = 128
}

export interface IdSelector {
  readonly type: SelectorType.IdSelector;
  readonly name: string;
}

export interface ClassSelector {
  readonly type: SelectorType.ClassSelector;
  readonly name: string;
}

export const enum AttributeMatcher {
  /**
   * @example [foo=bar]
   */
  Equal,

  /**
   * @example [foo~=bar]
   */
  Includes,

  /**
   * @example [foo|=bar]
   */
  DashMatch,

  /**
   * @example [foo^=bar]
   */
  Prefix,

  /**
   * @example [foo$=bar]
   */
  Suffix,

  /**
   * @example [foo*=bar]
   */
  Substring
}

export const enum AttributeModifier {
  /**
   * @example [foo=bar i]
   */
  CaseInsensitive = 1
}

export interface AttributeSelector {
  readonly type: SelectorType.AttributeSelector;
  readonly name: string;
  readonly value: string | null;
  readonly matcher: AttributeMatcher | null;
  readonly modifier: number;
}

export interface TypeSelector {
  readonly type: SelectorType.TypeSelector;
  readonly name: string;
  readonly namespace: string | null;
}

export interface PseudoClassSelector {
  readonly type: SelectorType.PseudoClassSelector;
  readonly name: PseudoClass;
  readonly value: Selector | Array<Selector> | null;
}

export interface PseudoElementSelector {
  readonly type: SelectorType.PseudoElementSelector;
  readonly name: PseudoElement;
}

export type SimpleSelector =
  | IdSelector
  | ClassSelector
  | TypeSelector
  | AttributeSelector
  | PseudoClassSelector
  | PseudoElementSelector;

export interface CompoundSelector {
  readonly type: SelectorType.CompoundSelector;
  readonly left: SimpleSelector;
  readonly right: SimpleSelector | CompoundSelector;
}

export type ComplexSelector = SimpleSelector | CompoundSelector;

export const enum SelectorCombinator {
  /**
   * @example div span
   */
  Descendant,

  /**
   * @example div > span
   */
  DirectDescendant,

  /**
   * @example div ~ span
   */
  Sibling,

  /**
   * @example div + span
   */
  DirectSibling
}

export interface RelativeSelector {
  readonly type: SelectorType.RelativeSelector;
  readonly combinator: SelectorCombinator;
  readonly left: ComplexSelector | RelativeSelector;
  readonly right: ComplexSelector;
}

export type Selector = ComplexSelector | RelativeSelector;

const simpleSelector =
  SelectorType.IdSelector |
  SelectorType.ClassSelector |
  SelectorType.TypeSelector |
  SelectorType.AttributeSelector |
  SelectorType.PseudoClassSelector |
  SelectorType.PseudoElementSelector;

export function isSimpleSelector(
  selector: Selector
): selector is SimpleSelector {
  return (selector.type & simpleSelector) > 0;
}

export function isCompoundSelector(
  selector: Selector
): selector is CompoundSelector {
  return selector.type === SelectorType.CompoundSelector;
}

const complexSelector = simpleSelector | SelectorType.CompoundSelector;

export function isComplexSelector(
  selector: Selector
): selector is ComplexSelector {
  return (selector.type & complexSelector) > 0;
}

export function isRelativeSelector(
  selector: Selector
): selector is RelativeSelector {
  return selector.type === SelectorType.RelativeSelector;
}

export function isPseudoClassSelector(
  selector: Selector
): selector is PseudoClassSelector {
  return selector.type === SelectorType.PseudoClassSelector;
}

export function isPseudoElementSelector(
  selector: Selector
): selector is PseudoElementSelector {
  return selector.type === SelectorType.PseudoElementSelector;
}

export function isSelector(selector: Selector): selector is Selector {
  return isComplexSelector(selector) || isRelativeSelector(selector);
}

function isImplicitDescendant(token: Token): boolean {
  switch (token.type) {
    case TokenType.Ident:
    case TokenType.LeftSquareBracket:
    case TokenType.Colon:
      return true;

    case TokenType.Delim:
      const { value } = token;
      return value === Char.FullStop || value === Char.Asterisk;
    case TokenType.Hash:
      return !token.unrestricted;
  }

  return false;
}

function idSelector(token: Token): IdSelector | null {
  if (token.type !== TokenType.Hash) {
    return null;
  }

  return { type: SelectorType.IdSelector, name: token.value };
}

function classSelector(stream: Stream<Token>): ClassSelector | null {
  const next = stream.next();

  if (next === null || next.type !== TokenType.Ident) {
    return null;
  }

  return { type: SelectorType.ClassSelector, name: next.value };
}

function typeSelector(
  token: Delim | Ident | Hash,
  stream: Stream<Token>
): TypeSelector | null {
  let name: string | null = null;
  let namespace: string | null = null;

  if (token.type === TokenType.Delim && token.value === Char.VerticalLine) {
    namespace = "";
  } else {
    const value =
      token.type === TokenType.Delim ? fromCharCode(token.value) : token.value;

    const next = stream.peek(0);

    if (
      next !== null &&
      next.type === TokenType.Delim &&
      next.value === Char.VerticalLine
    ) {
      stream.advance(1);
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

    if (next.type === TokenType.Delim && next.value === Char.Asterisk) {
      name = "*";
    } else if (next.type === TokenType.Ident) {
      name = next.value.toLowerCase();
    } else {
      return null;
    }
  }

  return {
    type: SelectorType.TypeSelector,
    name,
    namespace
  };
}

function attributeSelector(stream: Stream<Token>): AttributeSelector | null {
  let next = stream.next();

  if (next === null || next.type !== TokenType.Ident) {
    return null;
  }

  const name = next.value;

  next = stream.peek(0);

  if (next !== null && next.type === TokenType.RightSquareBracket) {
    stream.advance(1);

    return {
      type: SelectorType.AttributeSelector,
      name,
      value: null,
      matcher: null,
      modifier: 0
    };
  }

  let matcher: AttributeMatcher | null = null;

  next = stream.peek(0);

  if (next !== null && next.type === TokenType.Delim) {
    switch (next.value) {
      case Char.Tilde:
        matcher = AttributeMatcher.Includes;
        break;
      case Char.VerticalLine:
        matcher = AttributeMatcher.DashMatch;
        break;
      case Char.CircumflexAccent:
        matcher = AttributeMatcher.Prefix;
        break;
      case Char.DollarSign:
        matcher = AttributeMatcher.Suffix;
        break;
      case Char.Asterisk:
        matcher = AttributeMatcher.Substring;
    }

    if (matcher !== null) {
      stream.advance(1);
      next = stream.peek(0);
    }
  }

  if (
    next === null ||
    next.type !== TokenType.Delim ||
    next.value !== Char.EqualSign
  ) {
    return null;
  }

  stream.advance(1);
  next = stream.peek(0);

  if (
    next === null ||
    (next.type !== TokenType.String && next.type !== TokenType.Ident)
  ) {
    return null;
  }

  stream.advance(1);

  let value = next.value;

  stream.accept(token => token.type === TokenType.Whitespace);

  let modifier = 0;

  next = stream.peek(0);

  if (next !== null && next.type === TokenType.Ident) {
    switch (next.value) {
      case "i":
        modifier |= AttributeModifier.CaseInsensitive;
        value = value.toLowerCase();
    }

    if (modifier !== 0) {
      stream.advance(1);
      next = stream.peek(0);
    }
  }

  if (next === null || next.type !== TokenType.RightSquareBracket) {
    return null;
  }

  stream.advance(1);

  return {
    type: SelectorType.AttributeSelector,
    name,
    value,
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

  if (next.type === TokenType.Colon) {
    next = stream.next();

    if (next === null || next.type !== TokenType.Ident) {
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

    selector = { type: SelectorType.PseudoElementSelector, name };
  } else {
    if (next.type !== TokenType.Ident && next.type !== TokenType.FunctionName) {
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

    if (next.type === TokenType.Ident) {
      selector = { type: SelectorType.PseudoClassSelector, name, value: null };
    } else {
      const value = expression();

      next = stream.next();

      if (next === null || next.type !== TokenType.RightParenthesis) {
        return null;
      }

      selector = { type: SelectorType.PseudoClassSelector, name, value };
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
    type: SelectorType.CompoundSelector,
    left,
    right
  };
}

function relativeSelector(
  left: Selector,
  right: Selector | null,
  combinator: SelectorCombinator
): RelativeSelector | null {
  if (
    right === null ||
    isRelativeSelector(right) ||
    isPseudoElementSelector(left)
  ) {
    return null;
  }

  return {
    type: SelectorType.RelativeSelector,
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

  if (isPseudoElementSelector(selectors[selectors.length - 1])) {
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
  combinator?: SelectorCombinator
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
  token: TokenType.Whitespace,

  prefix(token, stream, expression) {
    return Command.Continue;
  },

  infix(token, stream, expression, left) {
    const next = stream.peek(0);

    if (next !== null && isImplicitDescendant(next)) {
      return combineSelectors(
        left,
        expression(),
        SelectorCombinator.Descendant
      );
    }

    return Command.Continue;
  }
};

const hash: Production<Hash> = {
  token: TokenType.Hash,
  prefix(token, stream) {
    if (!token.unrestricted) {
      return idSelector(token);
    }

    return null;
  },

  infix(token, stream, expression, left) {
    if (!token.unrestricted) {
      return combineSelectors(left, idSelector(token));
    }

    return null;
  }
};

const delim: Production<Delim> = {
  token: TokenType.Delim,

  prefix(token, stream) {
    switch (token.value) {
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
      case Char.FullStop:
        return combineSelectors(left, classSelector(stream));
      case Char.Asterisk:
      case Char.VerticalLine:
        return combineSelectors(left, typeSelector(token, stream));

      case Char.GreaterThanSign:
        return combineSelectors(
          left,
          expression(),
          SelectorCombinator.DirectDescendant
        );
      case Char.PlusSign:
        return combineSelectors(
          left,
          expression(),
          SelectorCombinator.DirectSibling
        );
      case Char.Tilde:
        return combineSelectors(left, expression(), SelectorCombinator.Sibling);
    }

    return null;
  }
};

const ident: Production<Ident> = {
  token: TokenType.Ident,

  prefix(token, stream) {
    return typeSelector(token, stream);
  }
};

const comma: Production<Comma> = {
  token: TokenType.Comma,

  infix(token, stream, expression, left) {
    return selectorList(left, expression());
  }
};

const squareBracket: Production<SquareBracket> = {
  token: TokenType.LeftSquareBracket,

  prefix(token, stream) {
    return attributeSelector(stream);
  },

  infix(token, stream, expression, left) {
    return combineSelectors(left, attributeSelector(stream));
  }
};

const colon: Production<Colon> = {
  token: TokenType.Colon,

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
> = new Grammar(
  [[hash, delim, ident, colon, squareBracket], whitespace, comma],
  () => null
);
