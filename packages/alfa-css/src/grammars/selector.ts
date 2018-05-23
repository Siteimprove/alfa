import { last } from "@siteimprove/alfa-util";
import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, Expression, Stream, Command } from "@siteimprove/alfa-lang";
import {
  Token,
  Whitespace,
  Delim,
  Ident,
  Comma,
  Colon,
  Paren,
  Bracket,
  String,
  Number,
  Percentage,
  Dimension,
  FunctionName,
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
  name: string;
  value: Selector | Array<Selector> | null;
};

export type PseudoElementSelector = {
  type: "pseudo-element-selector";
  name: string;
};

export type SubclassSelector =
  | IdSelector
  | ClassSelector
  | AttributeSelector
  | PseudoClassSelector
  | PseudoElementSelector;

export type SimpleSelector = TypeSelector | SubclassSelector;

export type CompoundSelector = {
  type: "compound-selector";
  selectors: Array<SimpleSelector>;
};

export type ComplexSelector = SimpleSelector | CompoundSelector;

export type RelativeSelector = {
  type: "relative-selector";
  combinator: " " | ">" | "+" | "~";
  relative: Selector;
  selector: ComplexSelector;
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

function idSelector(stream: Stream<Token>): IdSelector {
  const ident = stream.accept(isIdent, 1);

  if (ident === false) {
    throw new Error("Expected ident");
  }

  return { type: "id-selector", name: ident.value };
}

function classSelector(stream: Stream<Token>): ClassSelector {
  const ident = stream.accept(isIdent, 1);

  if (ident === false) {
    throw new Error("Expected ident");
  }

  return { type: "class-selector", name: ident.value };
}

function typeSelector(
  token: Delim | Ident,
  stream: Stream<Token>
): TypeSelector {
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
      throw new Error("Expected ident or delim");
    }
  }

  return {
    type: "type-selector",
    name,
    namespace
  };
}

function attributeSelector(stream: Stream<Token>): AttributeSelector {
  const attribute = stream.accept(isIdent, 1);

  if (attribute === false) {
    throw new Error("Expected ident");
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
    throw new Error("Expected equals sign");
  }

  const value = stream.next();

  if (value === null || !(isIdent(value) || isString(value))) {
    throw new Error("Expected ident or string");
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
    throw new Error("Expected end of attribute selector");
  }

  return {
    type: "attribute-selector",
    name: attribute.value,
    value: value.value,
    matcher,
    modifier
  };
}

function pseudoSelector(
  stream: Stream<Token>,
  expression: Expression<Selector | Array<Selector>>
): PseudoElementSelector | PseudoClassSelector {
  let selector: PseudoElementSelector | PseudoClassSelector;

  if (stream.accept(next => next.type === ":", 1) !== false) {
    const ident = stream.accept(isIdent, 1);

    if (ident === false) {
      throw new Error("Excepted ident");
    }

    selector = {
      type: "pseudo-element-selector",
      name: ident.value
    };
  } else {
    const name = stream.next();

    if (name === null || (!isIdent(name) && !isFunctionName(name))) {
      throw new Error("Excepted ident or function name");
    }

    if (isIdent(name)) {
      selector = {
        type: "pseudo-class-selector",
        name: name.value,
        value: null
      };
    } else {
      selector = {
        type: "pseudo-class-selector",
        name: name.value,
        value: expression()
      };

      if (stream.accept(token => token.type === ")", 1) === false) {
        throw new Error("Expected end of arguments");
      }
    }
  }

  return selector;
}

function relativeSelector(
  left: Selector,
  right: ComplexSelector,
  combinator: RelativeSelector["combinator"]
): RelativeSelector {
  if (isPseudoElementSelector(left)) {
    throw new Error("Unexpected pseudo-element selector");
  }

  return {
    type: "relative-selector",
    combinator,
    relative: left,
    selector: right
  };
}

function compoundSelector(
  left: SimpleSelector | Array<SimpleSelector>,
  right: SimpleSelector
): CompoundSelector {
  const selectors = isArray(left) ? left : [left];

  if (isPseudoElementSelector(last(selectors)!)) {
    throw new Error("Unexpected pseudo-element selector");
  }

  selectors.push(right);

  return { type: "compound-selector", selectors };
}

function selectorList(
  left: Selector | Array<Selector>,
  right: Selector | Array<Selector>
): Array<Selector> {
  const selectors = isArray(left) ? left : [left];

  if (isPseudoElementSelector(last(selectors)!)) {
    throw new Error("Unexpected pseudo-element selector");
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
  right: Selector | Array<Selector>,
  combinator?: RelativeSelector["combinator"]
): Selector | Array<Selector> {
  if (isArray(left) || isArray(right)) {
    return selectorList(left, right);
  }

  if (combinator !== undefined) {
    if (!isComplexSelector(right)) {
      throw new Error("Exepected complex selector");
    }

    return relativeSelector(left, right, combinator);
  }

  if (isSimpleSelector(left)) {
    if (!isSimpleSelector(right)) {
      throw new Error("Expected simple selector");
    }

    return compoundSelector(left, right);
  }

  if (isComplexSelector(left)) {
    if (!isSimpleSelector(right)) {
      throw new Error("Expected simple selector");
    }

    return compoundSelector(left.selectors, right);
  }

  if (!isSimpleSelector(right)) {
    throw new Error("Expected simple selector");
  }

  const { relative, selector } = left;

  combinator = left.combinator;

  return relativeSelector(
    relative,
    compoundSelector(
      isCompoundSelector(selector) ? selector.selectors : selector,
      right
    ),
    combinator
  );
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
      const right = expression();

      if (right !== null) {
        return combineSelectors(left, right, " ");
      }
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

    throw new Error("Expected ID or class name");
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
        const right = expression();

        if (right === null) {
          throw new Error("Expected selector");
        }

        return combineSelectors(left, right, token.value);
    }

    throw new Error("Expected ID or class name or combinator");
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
    const right = expression();

    if (right === null) {
      throw new Error("Expected selector");
    }

    return selectorList(left, right);
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
> = new Grammar([[delim, ident, colon, bracket, whitespace], comma]);
