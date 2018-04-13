import { Grammar, Production, parse as $parse } from "@alfa/lang";
import {
  CssToken,
  Whitespace,
  Comment,
  Delim,
  Ident,
  Comma,
  Paren,
  Bracket,
  String,
  Number,
  Percentage,
  Dimension,
  FunctionName,
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

export type PreservedToken = String | Number | Percentage | Dimension;

export type Function = {
  type: "function";
  name: string;
  value: Array<ComponentValue>;
};

export type SimpleBlock = {
  type: "simple-block";
  value: Array<ComponentValue>;
};

export type ComponentValue = PreservedToken | Function | SimpleBlock;

export type ComponentValueList = {
  type: "component-value-list";
  values: Array<ComponentValue>;
};

export type CssTree =
  | Selector
  | SelectorList
  | ComponentValue
  | ComponentValueList;

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

export function isPreservedToken(node: CssTree): node is PreservedToken {
  switch (node.type) {
    case "string":
    case "number":
    case "percentage":
    case "dimension":
      return true;
    default:
      return false;
  }
}

export function isFunction(node: CssTree): node is Function {
  return node.type === "function";
}

export function isSimpleBlock(node: CssTree): node is SimpleBlock {
  return node.type === "simple-block";
}

export function isComponentValue(node: CssTree): node is ComponentValue {
  return isPreservedToken(node) || isFunction(node) || isSimpleBlock(node);
}

export function isComponentValueList(
  node: CssTree
): node is ComponentValueList {
  return node.type === "component-value-list";
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

const comma: CssProduction<Comma, SelectorList | ComponentValueList> = {
  token: ",",

  infix(token, stream, expression, left) {
    const right = expression();

    if (isSimpleSelector(left)) {
      const selectors: Array<Selector> = [left];

      if (right === null) {
        throw new Error("Expected selector");
      }

      if (isSelector(right)) {
        selectors.push(right);
      } else if (isSelectorList(right)) {
        selectors.push(...right.selectors);
      } else {
        throw new Error("Expected selector");
      }

      return { type: "selector-list", selectors };
    }

    if (isComponentValue(left)) {
      const values: Array<ComponentValue> = [left];

      if (right === null) {
        throw new Error("Expected component value");
      }

      if (isComponentValue(right)) {
        values.push(right);
      } else if (isComponentValueList(right)) {
        values.push(...right.values);
      } else {
        throw new Error("Expected component value");
      }

      return { type: "component-value-list", values };
    }

    throw new Error("Unexpected comma");
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

const functionName: CssProduction<FunctionName, Function> = {
  token: "function-name",

  prefix(token, { peek, advance }, expression) {
    const func: Function = { type: "function", name: token.value, value: [] };

    let next: CssToken | null = peek();

    while (next !== null) {
      const right = expression();

      if (right !== null) {
        if (isComponentValue(right)) {
          func.value.push(right);
        } else if (isComponentValueList(right)) {
          func.value.push(...right.values);
        } else {
          throw new Error("Expected component value");
        }
      }

      next = peek();

      if (next === null || next.type === ")") {
        break;
      }
    }

    if (next === null || next.type !== ")") {
      throw new Error("Expected end of function");
    }

    advance();

    return func;
  }
};

const string: CssProduction<String, String> = {
  token: "string",

  prefix(token, stream, expression) {
    return { type: "string", value: token.value };
  }
};

const number: CssProduction<Number, Number> = {
  token: "number",

  prefix(token, stream, expression) {
    return { type: "number", value: token.value };
  }
};

const percentage: CssProduction<Percentage, Percentage> = {
  token: "percentage",

  prefix(token, stream, expression) {
    return { type: "percentage", value: token.value };
  }
};

const dimension: CssProduction<Dimension, Dimension> = {
  token: "dimension",

  prefix(token, stream, expression) {
    return { type: "dimension", value: token.value, unit: token.unit };
  }
};

export const CssGrammar: Grammar<CssToken, CssTree> = new Grammar([
  whitespace,
  comment,
  delim,
  ident,
  comma,
  bracket,
  functionName,
  string,
  number,
  percentage,
  dimension
]);

export function parse(input: string): CssTree | null {
  return $parse(lex(input), CssGrammar);
}
