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

function compoundSelector(
  left: ComplexSelector,
  right: SimpleSelector
): CompoundSelector {
  return {
    type: "compound-selector",
    selectors: isCompoundSelector(left)
      ? [...left.selectors, right]
      : [left, right]
  };
}

function relativeSelector(
  left: RelativeSelector,
  right: SimpleSelector
): RelativeSelector {
  return {
    type: "relative-selector",
    combinator: left.combinator,
    relative: left.relative,
    selector: compoundSelector(left.selector, right)
  };
}

function selector(left: Selector, right: SimpleSelector): Selector {
  return isRelativeSelector(left)
    ? relativeSelector(left, right)
    : compoundSelector(left, right);
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
    if (isArray(left)) {
      return null;
    }

    const next = stream.peek();

    if (next !== null && isImplicitDescendant(next)) {
      const right = expression();

      if (right === null || isArray(right) || !isComplexSelector(right)) {
        throw new Error("Expected complex selector");
      }

      return {
        type: "relative-selector",
        combinator: " ",
        relative: left,
        selector: right
      };
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
    if (isArray(left)) {
      throw new Error("Exepected selector");
    }

    switch (token.value) {
      case "#":
        return selector(left, idSelector(stream));
      case ".":
        return selector(left, classSelector(stream));
      case "*":
      case "|":
        return selector(left, typeSelector(token, stream));

      case ">":
      case "+":
      case "~":
        const right = expression();

        if (right === null || isArray(right) || !isComplexSelector(right)) {
          throw new Error("Expected selector");
        }

        return {
          type: "relative-selector",
          combinator: token.value,
          relative: left,
          selector: right
        };
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

    const selectors: Array<Selector> = isArray(left) ? left : [left];

    if (right === null) {
      throw new Error("Expected selector");
    }

    if (isArray(right)) {
      selectors.push(...right);
    } else {
      selectors.push(right);
    }

    return selectors;
  }
};

const bracket: Production<Bracket> = {
  token: "[",

  prefix(token, stream) {
    return attributeSelector(stream);
  },

  infix(token, stream, expression, left) {
    if (isArray(left)) {
      throw new Error("Expected selector");
    }

    return selector(left, attributeSelector(stream));
  }
};

const colon: Production<Colon> = {
  token: ":",

  prefix(token, stream, expression) {
    return pseudoSelector(stream, expression);
  },

  infix(token, stream, expression, left) {
    if (isArray(left)) {
      throw new Error("Expected selector");
    }

    return selector(left, pseudoSelector(stream, expression));
  }
};

export const SelectorGrammar: Grammar<
  Token,
  Selector | Array<Selector>
> = new Grammar([[delim, ident, colon, bracket, whitespace], comma]);
