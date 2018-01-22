import { Grammar, Production, parse as $parse } from "@alfa/lang";
import {
  CssToken,
  Whitespace,
  Comment,
  Delim,
  Ident,
  Comma,
  isIdent,
  isDelim,
  lex
} from "./lexer";

export type TypeSelector = { type: "type-selector"; name: string };
export type ClassSelector = { type: "class-selector"; name: string };
export type IdSelector = { type: "id-selector"; name: string };

export type SimpleSelector = TypeSelector | ClassSelector | IdSelector;
export type CompoundSelector = {
  type: "compound-selector";
  selectors: Array<SimpleSelector>;
};

export type RelativeSelector = {
  type: "relative-selector";
  combinator: ">>" | ">" | "+" | "~";
  selector: SimpleSelector | CompoundSelector;
  relative: Selector;
};

export type Selector = SimpleSelector | CompoundSelector | RelativeSelector;
export type SelectorList = {
  type: "selector-list";
  selectors: Array<Selector>;
};

export type CssTree = Selector | SelectorList;

type CssProduction<T extends CssToken, U extends CssTree> = Production<
  CssToken,
  T,
  CssTree,
  U
>;

function isSimpleSelector(node: CssTree): node is SimpleSelector {
  switch (node.type) {
    case "type-selector":
    case "class-selector":
    case "id-selector":
      return true;
    default:
      return false;
  }
}

function isCompoundSelector(node: CssTree): node is CompoundSelector {
  return node.type === "compound-selector";
}

function isRelativeSelector(node: CssTree): node is RelativeSelector {
  return node.type === "relative-selector";
}

function isSelector(node: CssTree): node is Selector {
  return (
    isSimpleSelector(node) ||
    isCompoundSelector(node) ||
    isRelativeSelector(node)
  );
}

function isSelectorList(node: CssTree): node is SelectorList {
  return node.type === "selector-list";
}

const whitespace: CssProduction<Whitespace, CssTree> = {
  token: "whitespace",

  prefix(token, stream, expression) {
    return expression();
  },

  infix(token, stream, expression, left) {
    if (isSelector(left)) {
      let token = stream.next();

      if (delim.infix === undefined) {
        return null;
      }

      const isImplicitDescendant =
        isIdent(token) ||
        (isDelim(token) && (token.value === "." || token.value === "#"));

      if (isImplicitDescendant) {
        token = { type: "delim", value: ">>" };
        stream.backup();
      }

      if (isDelim(token)) {
        return delim.infix(token, stream, expression, left);
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

        case ">":
        case ">>":
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
    return { type: "type-selector", name: token.value };
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

export const CssGrammar: Grammar<CssToken, CssTree> = [
  whitespace,
  comment,
  delim,
  ident,
  comma
];

export function parse(input: string): CssTree | null {
  return $parse(lex(input), CssGrammar);
}
