import {
  Grammar,
  Expression,
  Production,
  TokenStream,
  parse as $parse
} from "@alfa/lang";
import {
  CssToken,
  Whitespace,
  Comment,
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

export type PseudoClassSelector = {
  type: "pseudo-class-selector";
  name: string;
  value: any;
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

export type Declaration = {
  type: "declaration";
  property: string;
  value: Array<ComponentValue>;
  important: boolean;
};

export type DeclarationList = {
  type: "declaration-list";
  declarations: Array<Declaration>;
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
    case "pseudo-class-selector":
    case "pseudo-element-selector":
      return true;
    default:
      return false;
  }
}

export function isCompoundSelector(node: CssTree): node is CompoundSelector {
  return node.type === "compound-selector";
}

export function isComplexSelector(node: CssTree): node is ComplexSelector {
  return isSimpleSelector(node) || isCompoundSelector(node);
}

export function isRelativeSelector(node: CssTree): node is RelativeSelector {
  return node.type === "relative-selector";
}

export function isSelector(node: CssTree): node is Selector {
  return isComplexSelector(node) || isRelativeSelector(node);
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

function isImplicitDescendant(token: CssToken): boolean {
  switch (token.type) {
    case "ident":
    case "[":
    case ":":
      return true;
    case "delim":
      return token.value === "." || token.value === "#";
  }

  return false;
}

function idSelector(stream: TokenStream<CssToken>): IdSelector {
  const ident = stream.accept(isIdent);

  if (ident === false) {
    throw new Error("Expected ident");
  }

  return { type: "id-selector", name: ident.value };
}

function classSelector(stream: TokenStream<CssToken>): ClassSelector {
  const ident = stream.accept(isIdent);

  if (ident === false) {
    throw new Error("Expected ident");
  }

  return { type: "class-selector", name: ident.value };
}

function attributeSelector(stream: TokenStream<CssToken>): AttributeSelector {
  const attribute = stream.accept(isIdent);

  if (attribute === false) {
    throw new Error("Expected ident");
  }

  if (stream.accept(token => token.type === "]")) {
    return {
      type: "attribute-selector",
      name: attribute.value,
      value: null,
      matcher: null
    };
  }

  if (stream.accept(token => isDelim(token) && token.value === "=") === false) {
    throw new Error("Expected attribute matcher");
  }

  const value = stream.next();

  if (value === null || !(isIdent(value) || isString(value))) {
    throw new Error("Expected ident or string");
  }

  if (stream.accept(token => token.type === "]") === false) {
    throw new Error("Expected end of attribute selector");
  }

  return {
    type: "attribute-selector",
    name: attribute.value,
    value: value.value,
    matcher: null
  };
}

function pseudoSelector(
  stream: TokenStream<CssToken>,
  expression: Expression<CssTree>
): PseudoElementSelector | PseudoClassSelector {
  let selector: PseudoElementSelector | PseudoClassSelector;

  if (stream.accept(next => next.type === ":")) {
    const next = stream.next();

    if (next === null || !isIdent(next)) {
      throw new Error("Excepted ident");
    }

    selector = {
      type: "pseudo-element-selector",
      name: next.value
    };
  } else {
    const next = stream.next();

    if (next === null || (!isIdent(next) && !isFunctionName(next))) {
      throw new Error("Excepted ident or function name");
    }

    if (isIdent(next)) {
      selector = {
        type: "pseudo-class-selector",
        name: next.value,
        value: null
      };
    } else {
      selector = {
        type: "pseudo-class-selector",
        name: next.value,
        value: functionValue(stream, expression)
      };
    }
  }

  return selector;
}

function compoundSelector(
  left: Selector,
  right: SimpleSelector
): CompoundSelector | RelativeSelector {
  if (isRelativeSelector(left)) {
    if (!isSimpleSelector(left.selector)) {
      throw new Error("Expected simple selector");
    }

    return {
      type: "relative-selector",
      combinator: left.combinator,
      relative: left.relative,
      selector: {
        type: "compound-selector",
        selectors: [left.selector, right]
      }
    };
  }

  return {
    type: "compound-selector",
    selectors: isCompoundSelector(left)
      ? [...left.selectors, right]
      : [left, right]
  };
}

function functionValue(
  stream: TokenStream<CssToken>,
  expression: Expression<CssTree>
): Array<ComponentValue> {
  const value: Array<ComponentValue> = [];

  let next: CssToken | null = stream.peek();

  while (next !== null) {
    const right = expression();

    if (right !== null) {
      if (isComponentValue(right)) {
        value.push(right);
      } else if (isComponentValueList(right)) {
        value.push(...right.values);
      } else {
        throw new Error("Expected component value");
      }
    }

    next = stream.peek();

    if (next === null || next.type === ")") {
      break;
    }
  }

  if (next === null || next.type !== ")") {
    throw new Error("Expected end of function");
  }

  stream.advance();

  return value;
}

const whitespace: CssProduction<Whitespace, CssTree> = {
  token: "whitespace",

  prefix(token, stream, expression) {
    return null;
  },

  infix(token, { peek }, expression, left) {
    if (isSelector(left)) {
      const token = peek();

      if (token !== null) {
        if (isImplicitDescendant(token)) {
          const right = expression();

          if (right === null || !isComplexSelector(right)) {
            throw new Error("Expected complex selector");
          }

          return {
            type: "relative-selector",
            combinator: " ",
            relative: left,
            selector: right
          };
        }
      }
    }

    return null;
  }
};

const comment: CssProduction<Comment, CssTree> = {
  token: "comment",

  prefix() {
    return null;
  },

  infix() {
    return null;
  }
};

const delim: CssProduction<Delim, Selector> = {
  token: "delim",

  prefix(token, stream) {
    switch (token.value) {
      case "#":
        return idSelector(stream);
      case ".":
        return classSelector(stream);
    }

    throw new Error("Expected ID or class name");
  },

  infix(token, stream, expression, left) {
    if (!isSelector(left)) {
      throw new Error("Exepected selector");
    }

    switch (token.value) {
      case "#":
        return compoundSelector(left, idSelector(stream));
      case ".":
        return compoundSelector(left, classSelector(stream));

      case ">":
      case "+":
      case "~":
        const right = expression();

        if (right === null || !isComplexSelector(right)) {
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

    if (isSelector(left) || isSelectorList(left)) {
      const selectors: Array<Selector> = isSelector(left)
        ? [left]
        : left.selectors;

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

    if (isComponentValue(left) || isComponentValueList(left)) {
      const values: Array<ComponentValue> = isComponentValue(left)
        ? [left]
        : left.values;

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

const bracket: CssProduction<Bracket, Selector> = {
  token: "[",

  prefix(token, stream) {
    return attributeSelector(stream);
  },

  infix(token, stream, expression, left) {
    if (!isComplexSelector(left)) {
      throw new Error("Unexpected bracket");
    }

    return compoundSelector(left, attributeSelector(stream));
  }
};

const colon: CssProduction<Colon, Selector> = {
  token: ":",

  prefix(token, stream, expression) {
    return pseudoSelector(stream, expression);
  },

  infix(token, stream, expression, left) {
    if (!isComplexSelector(left)) {
      throw new Error("Unexpected colon");
    }

    return compoundSelector(left, pseudoSelector(stream, expression));
  }
};

const functionName: CssProduction<FunctionName, Function> = {
  token: "function-name",

  prefix(token, stream, expression) {
    return {
      type: "function",
      name: token.value,
      value: functionValue(stream, expression)
    };
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
  colon,
  bracket,
  functionName,
  comma,
  string,
  number,
  percentage,
  dimension
]);

export function parse(input: string): CssTree | null {
  return $parse(lex(input), CssGrammar);
}
