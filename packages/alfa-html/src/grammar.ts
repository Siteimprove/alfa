import {
  Attribute,
  Comment,
  Document,
  DocumentType,
  Element,
  Node,
  NodeType
} from "@siteimprove/alfa-dom";
import * as Lang from "@siteimprove/alfa-lang";
import { Char } from "@siteimprove/alfa-lang";
import { Mutable } from "@siteimprove/alfa-util";
import { Token, TokenType } from "./alphabet";

type InsertionMode = (token: Token, document: Document, state: State) => void;

interface State {
  /**
   * @see https://www.w3.org/TR/html/syntax.html#insertion-mode
   */
  insertionMode: InsertionMode;

  /**
   * @see https://www.w3.org/TR/html/syntax.html#original-insertion-mode
   */
  originalInsertionMode: InsertionMode | null;

  /**
   * @see https://www.w3.org/TR/html/syntax.html#stack-of-open-elements
   */
  openElements: Array<object>;
}

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-initial-insertion-mode
 */
const initial: InsertionMode = (token, document, state) => {
  switch (token.type) {
    case TokenType.Character:
      switch (token.data) {
        case Char.CharacterTabulation:
        case Char.LineFeed:
        case Char.FormFeed:
        case Char.CarriageReturn:
        case Char.Space:
          return;
      }
      break;

    case TokenType.Comment:
      appendChild(document, createComment(token.data));
      return;

    case TokenType.Doctype:
      appendChild(
        document,
        createDocumentType(token.name === null ? "" : token.name)
      );

      if (token.forceQuirks || token.name !== "html") {
        enableQuirksMode(document);
      }

      state.insertionMode = beforeHtml;
      return;
  }

  enableQuirksMode(document);

  state.insertionMode = beforeHtml;

  return constructTree(token, document, state);
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-before-html-insertion-mode
 */
const beforeHtml: InsertionMode = (token, document, state) => {
  switch (token.type) {
    case TokenType.Doctype:
      return;

    case TokenType.Comment:
      appendChild(document, createComment(token.data));
      return;

    case TokenType.Character:
      switch (token.data) {
        case Char.CharacterTabulation:
        case Char.LineFeed:
        case Char.FormFeed:
        case Char.CarriageReturn:
        case Char.Space:
          return;
      }
      break;

    case TokenType.StartTag:
      if (token.name === "html") {
        const element = createElement(token.name);

        for (const { name, value } of token.attributes) {
          appendAttribute(element, createAttribute(name, value));
        }

        state.openElements.push(element);

        appendChild(document, element);

        state.insertionMode = beforeHead;

        return;
      }
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-before-head-insertion-mode
 */
const beforeHead: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-head-insertion-mode
 */
// const inHead: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-head-noscript-insertion-mode
 */
// const inHeadNoscript: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-after-head-insertion-mode
 */
// const afterHead: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-body-insertion-mode
 */
// const inBody: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#sec-the-text-insertion-mode
 */
// const text: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-table-insertion-mode
 */
// const inTable: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-table-text-insertion-mode
 */
// const inTableText: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-caption-insertion-mode
 */
// const inCaption: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-column-group-insertion-mode
 */
// const inColumnGroup: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-table-body-insertion-mode
 */
// const inTableBody: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-row-insertion-mode
 */
// const inRow: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-cell-insertion-mode
 */
// const inCell: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-select-insertion-mode
 */
// const inSelect: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-select-in-table-insertion-mode
 */
// const inSelectInTable: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-template-insertion-mode
 */
// const inTemplate: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-after-body-insertion-mode
 */
// const afterBody: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-frameset-insertion-mode
 */
// const inFrameset: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-after-frameset-insertion-mode
 */
// const afterFrameset: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-after-after-body-insertion-mode
 */
// const afterAfterBody: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-after-after-frameset-insertion-mode
 */
// const afterAfterFrameset: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tree-construction
 */
function constructTree(
  token: Token,
  document: Document,
  state: State
): Document {
  state.insertionMode(token, document, state);
  return document;
}

function enableQuirksMode(document: Mutable<Document>) {
  document.compatMode = "BackCompat";
}

function appendChild(parentNode: Node, childNode: Node) {
  (parentNode.childNodes as Array<Node>).push(childNode);
}

function appendAttribute(element: Element, attribute: Attribute) {
  (element.attributes as Array<Attribute>).push(attribute);
}

function createElement(name: string): Element {
  return {
    nodeType: NodeType.Element,
    prefix: null,
    localName: name,
    attributes: [],
    shadowRoot: null,
    childNodes: []
  };
}

function createAttribute(name: string, value: string): Attribute {
  return {
    prefix: null,
    localName: name,
    value
  };
}

function createComment(data: string): Comment {
  return {
    nodeType: NodeType.Comment,
    data,
    childNodes: []
  };
}

function createDocument(): Document {
  return {
    nodeType: NodeType.Document,
    compatMode: "CSS1Compat",
    childNodes: [],
    styleSheets: []
  };
}

function createDocumentType(name: string): DocumentType {
  return {
    nodeType: NodeType.DocumentType,
    name,
    childNodes: []
  };
}

type Production = Lang.Production<Token, Document, Token, Document, State>;

const doctype: Production = {
  token: TokenType.Doctype,

  prefix(token, stream, expression, state) {
    return constructTree(token, createDocument(), state);
  },

  infix(token, stream, expression, left, state) {
    return constructTree(token, left, state);
  }
};

const comment: Production = {
  token: TokenType.Comment,

  prefix(token, stream, expression, state) {
    return constructTree(token, createDocument(), state);
  },

  infix(token, stream, expression, left, state) {
    return constructTree(token, left, state);
  }
};

export const Grammar: Lang.Grammar<Token, Document, State> = new Lang.Grammar(
  [doctype, comment],
  () => ({
    insertionMode: initial,
    originalInsertionMode: null,
    openElements: []
  })
);
