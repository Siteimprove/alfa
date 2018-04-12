import { Grammar, Production, parse as $parse } from "@alfa/lang";
import {
  CssToken,
  Whitespace,
  Comment,
  Delim,
  Ident,
  Comma,
  Bracket,
  isIdent,
  isString,
  isDelim,
  lex
} from "./lexer";

export type IdSelector = { type: "id-selector"; name: string };

export type ClassSelector = { type: "class-selector"; name: string };

export type AttributeSelector = {
  type: "attribute-selector";
  name: string;
  value: string | null;
  matcher: "~" | "|" | "^" | "$" | "*" | null;
};

export type TypeSelector = { type: "type-selector"; name: string };

export type SubclassSelector = IdSelector | ClassSelector | AttributeSelector;

export type SimpleSelector = TypeSelector | SubclassSelector;

export type CompoundSelector = {
  type: "compound-selector";
  selectors: Array<SimpleSelector>;
};

export type RelativeSelector = {
  type: "relative-selector";
  combinator: " " | ">" | "+" | "~";
  selector: SimpleSelector | CompoundSelector;
  relative: Selector;
};

export type Selector = SimpleSelector | CompoundSelector | RelativeSelector;

export type SelectorList = {
  type: "selector-list";
  selectors: Array<Selector>;
};

export type CssTree = Selector | SelectorList;

export type CssProduction<T extends CssToken, U extends CssTree> = Production<
  CssToken,
  CssTree,
  T,
  U
>;

export function isSimpleSelector(node: CssTree): node is SimpleSelector {
  switch (node.type) {
    case "id-selector":
    case "class-selector":
    case "attribute-selector":
    case "type-selector":
      return true;
    default:
      return false;
  }
}

export function isCompoundSelector(node: CssTree): node is CompoundSelector {
  return node.type === "compound-selector";
}

export function isRelativeSelector(node: CssTree): node is RelativeSelector {
  return node.type === "relative-selector";
}

export function isSelector(node: CssTree): node is Selector {
  return (
    isSimpleSelector(node) ||
    isCompoundSelector(node) ||
    isRelativeSelector(node)
  );
}

export function isSelectorList(node: CssTree): node is SelectorList {
  return node.type === "selector-list";
}

const whitespace: CssProduction<Whitespace, CssTree> = {
  token: "whitespace",

  prefix(token, stream, expression) {
    return expression();
  },

  infix(token, stream, expression, left) {
    if (isSelector(left) && delim.infix !== undefined) {
      const token = stream.peek();

      if (token !== null) {
        const isImplicitDescendant =
          isIdent(token) ||
          (isDelim(token) && (token.value === "." || token.value === "#"));

        if (isImplicitDescendant) {
          return delim.infix(
            { type: "delim", value: " " },
            stream,
            expression,
            left
          );
        }
      }
    }

    return left;
  }
};

const comment: CssProduction<Comment, CssTree> = {
  token: "comment",

  prefix(token, stream, expression) {
    return expression();
  },

  infix(token, stream, expression, left) {
    return left;
  }
};

const delim: CssProduction<Delim, Selector> = {
  token: "delim",

  prefix(token, { accept }) {
    switch (token.value) {
      case ".":
      case "#":
        const ident = accept(isIdent);

        if (ident === false) {
          throw new Error("Expected ident");
        }

        const name = ident.value;
        return token.value === "."
          ? { type: "class-selector", name }
          : { type: "id-selector", name };
    }

    return null;
  },

  infix(token, stream, expression, left) {
    if (isSelector(left)) {
      switch (token.value) {
        case ".":
        case "#": {
          stream.backup();

          const right = expression();

          if (
            right === null ||
            !isSimpleSelector(right) ||
            !isSimpleSelector(left)
          ) {
            throw new Error("Expected simple selector");
          }

          return {
            type: "compound-selector",
            selectors: isCompoundSelector(left)
              ? [...left.selectors, right]
              : [left, right]
          };
        }

        case " ":
        case ">":
        case "+":
        case "~":
          const right = expression();

          if (
            right !== null &&
            (isSimpleSelector(right) || isCompoundSelector(right))
          ) {
            return {
              type: "relative-selector",
              combinator: token.value,
              selector: right,
              relative: left
            };
          }
      }
    }

    return null;
  }
};

const ident: CssProduction<Ident, TypeSelector> = {
  token: "ident",

  prefix(token) {
    return { type: "type-selector", name: token.value.toLowerCase() };
  }
};

const comma: CssProduction<Comma, SelectorList> = {
  token: ",",

  infix(token, stream, expression, left) {
    const selectors: Array<Selector> = [];

    if (isSimpleSelector(left)) {
      selectors.push(left);
    }

    const right = expression();

    if (right === null) {
      throw new Error("Expected selector");
    }

    if (isSelector(right)) {
      selectors.push(right);
    }

    if (isSelectorList(right)) {
      selectors.push(...right.selectors);
    }

    return { type: "selector-list", selectors };
  }
};

const bracket: CssProduction<Bracket, AttributeSelector | CompoundSelector> = {
  token: "[",

  prefix(token, { accept, next }, expression) {
    const attribute = accept(isIdent);

    if (attribute === false) {
      throw new Error("Expected ident");
    }

    if (accept(token => token.type === "]")) {
      return {
        type: "attribute-selector",
        name: attribute.value,
        value: null,
        matcher: null
      };
    }

    if (accept(token => isDelim(token) && token.value === "=") === false) {
      throw new Error("Expected attribute matcher");
    }

    const value = next();

    if (value === null || !(isIdent(value) || isString(value))) {
      throw new Error("Expected ident or string");
    }

    if (accept(token => token.type === "]") === false) {
      throw new Error("Expected end of attribute selector");
    }

    return {
      type: "attribute-selector",
      name: attribute.value,
      value: value.value,
      matcher: null
    };
  },

  infix(token, { backup }, expression, left) {
    backup();

    const right = expression();

    if (right === null || !isSimpleSelector(right) || !isSimpleSelector(left)) {
      throw new Error("Expected simple selector");
    }

    return {
      type: "compound-selector",
      selectors: isCompoundSelector(left)
        ? [...left.selectors, right]
        : [left, right]
    };
  }
};

export const CssGrammar: Grammar<CssToken, CssTree> = new Grammar([
  whitespace,
  comment,
  delim,
  ident,
  comma,
  bracket
]);

export function parse(input: string): CssTree | null {
  return $parse(lex(input), CssGrammar);
}
