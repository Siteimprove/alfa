import {
  Attribute,
  Comment,
  Document,
  DocumentType,
  Element,
  isElement,
  isText,
  Node,
  NodeType,
  Text
} from "@siteimprove/alfa-dom";
import * as Lang from "@siteimprove/alfa-lang";
import { Char } from "@siteimprove/alfa-lang";
import { Mutable } from "@siteimprove/alfa-util";
import { Token, Tokens, TokenType } from "./alphabet";

const { fromCharCode } = String;

type InsertionMode = (token: Token, document: Document, state: State) => void;

type InsertionLocation = [Array<Node>, number];

/**
 * @see https://www.w3.org/TR/html/syntax.html#markers
 */
const Marker = Symbol("marker");
type Marker = typeof Marker;

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
  openElements: Array<Mutable<Element>>;

  /**
   * @see https://www.w3.org/TR/html/syntax.html#list-of-active-formatting-elements
   */
  activeFormattingElements: Array<Element | Marker>;

  /**
   * @see https://www.w3.org/TR/html/syntax.html#frameset-ok-flag
   */
  framesetOk: boolean;

  /**
   * @see https://www.w3.org/TR/html/syntax.html#stack-of-template-insertion-modes
   */
  templateInsertionModes: Array<InsertionMode>;

  /**
   * @see https://www.w3.org/TR/html/syntax.html#head-element-pointer
   */
  headElementPointer: Element | null;
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
const beforeHead: InsertionMode = (token, document, state) => {
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
      insertNode(createComment(token.data), state);
      return;

    case TokenType.Doctype:
      return; // parse error

    case TokenType.StartTag:
      switch (token.name) {
        case "html":
          inBody(token, document, state);
          break;
        case "head":
          insertNode(createElement(token.name), state);
          state.insertionMode = inHead;
      }
      break;

    default:
      if (token.type === TokenType.EndTag) {
        switch (token.name) {
          case "head":
          case "body":
          case "html":
          case "br":
            break;
          default:
            return; // parse error
        }
      }

      insertNode(createElement("head"), state);
      state.insertionMode = inHead;
      inHead(token, document, state);
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-head-insertion-mode
 */
const inHead: InsertionMode = (token, document, state) => {
  switch (token.type) {
    case TokenType.Character:
      switch (token.data) {
        case Char.CharacterTabulation:
        case Char.LineFeed:
        case Char.FormFeed:
        case Char.CarriageReturn:
        case Char.Space:
          insertCharacter(token, state);
      }
      break;
    case TokenType.Comment:
      insertNode(createComment(token.data), state);
      break;
    case TokenType.Doctype:
      return; // parse error
    case TokenType.StartTag:
      switch (token.name) {
        case "html":
          inBody(token, document, state);
          break;
        case "base":
        case "basefont":
        case "bgsound":
        case "link":
        case "meta":
          insertNode(createElement(token.name), state);
          state.openElements.pop();
          break;
        case "title":
        case "noframes":
        case "style":
          insertNode(createElement(token.name), state);
          state.originalInsertionMode = state.insertionMode;
          state.insertionMode = text;
          break;
        case "noscript":
          insertNode(createElement(token.name), state);
          state.insertionMode = inHeadNoscript;
          break;
        case "script":
          const element = createElement(token.name);
          const location = appropriateInsertionLocation(state);

          if (location === null) {
            return;
          }

          const [children, position] = location;
          const node = children[position - 1];

          appendChild(node, element);
          insertNode(element, state);

          state.originalInsertionMode = state.insertionMode;
          state.insertionMode = text;
          break;
        case "template":
          insertNode(createElement(token.name), state);
          insertMarker(state);
          state.framesetOk = false;
          state.insertionMode = inTemplate;
          state.templateInsertionModes.push(inTemplate);
          break;
        case "head":
          return; // parse error
      }
      break;
    case TokenType.EndTag:
      switch (token.name) {
        case "template":
          const hasTemplate =
            state.openElements.find(tag => {
              return tag.localName === "template";
            }) !== undefined;

          if (!hasTemplate) {
            return; // ignore
          }

          generateImpliedTags(state);

          const node = currentNode(state);
          if (
            node === null ||
            !isElement(node) ||
            node.localName !== "template"
          ) {
            return; // parse error
          }

          while (true) {
            const node = currentNode(state);

            if (node === null || !isElement(node)) {
              continue;
            }

            if (node.localName !== "template") {
              state.openElements.pop();
              continue;
            }

            break;
          }

          clearUntilLastMarker(state);

          state.templateInsertionModes.pop();

          resetInsertionMode(state);

          break;
        default:
          return; // parse error
      }
      break;

    default:
      state.openElements.pop();
      state.insertionMode = afterHead;
      inHead(token, document, state);
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-head-noscript-insertion-mode
 */
const inHeadNoscript: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-after-head-insertion-mode
 */
const afterHead: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-body-insertion-mode
 */
const inBody: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#sec-the-text-insertion-mode
 */
const text: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-table-insertion-mode
 */
const inTable: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-table-text-insertion-mode
 */
// const inTableText: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-caption-insertion-mode
 */
const inCaption: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-column-group-insertion-mode
 */
const inColumnGroup: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-table-body-insertion-mode
 */
const inTableBody: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-row-insertion-mode
 */
const inRow: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-cell-insertion-mode
 */
const inCell: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-select-insertion-mode
 */
const inSelect: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-select-in-table-insertion-mode
 */
const inSelectInTable: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-template-insertion-mode
 */
const inTemplate: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-after-body-insertion-mode
 */
// const afterBody: InsertionMode = () => {};

/**
 * @see https://www.w3.org/TR/html/syntax.html#the-in-frameset-insertion-mode
 */
const inFrameset: InsertionMode = () => {};

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

function enableQuirksMode(document: Mutable<Document>): void {
  document.compatMode = "BackCompat";
}

function appendChild(parentNode: Node, childNode: Node): void {
  (parentNode.childNodes as Array<Node>).push(childNode);
}

function appendAttribute(element: Element, attribute: Attribute): void {
  (element.attributes as Array<Attribute>).push(attribute);
}

function insertNode(
  node: Node,
  state: State,
  position: InsertionLocation | null = appropriateInsertionLocation(state)
) {
  if (position !== null) {
    position[0].splice(position[1], 0, node);
  }
}

function insertCharacter(token: Tokens.Character, state: State) {
  const location = appropriateInsertionLocation(state);

  if (location === null) {
    return;
  }

  const [children, position] = location;
  const node = children[position - 1];

  if (node !== undefined && isText(node)) {
    (node as Mutable<Text>).data += fromCharCode(token.data);
  } else {
    insertNode(createText(fromCharCode(token.data)), state);
  }
}

function insertMarker(state: State) {
  state.activeFormattingElements.push(Marker);
}

/**
 * @see https://html.spec.whatwg.org/#appropriate-place-for-inserting-a-node
 */
function appropriateInsertionLocation(state: State): InsertionLocation | null {
  const target = currentNode(state);

  if (target === null) {
    return null;
  }

  return [target.childNodes as Array<Node>, target.childNodes.length];
}

/**
 * @see https://html.spec.whatwg.org/#current-node
 */
function currentNode(state: State): Mutable<Node> | null {
  const tail = state.openElements[state.openElements.length - 1];

  if (tail === undefined) {
    return null;
  }

  return tail;
}

/**
 * @see https://www.w3.org/TR/html/syntax.html#current-template-insertion-mode
 */
function currentTemplateInsertionMode(state: State): InsertionMode {
  return state.templateInsertionModes[state.templateInsertionModes.length - 1];
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
    nodeType: NodeType.Attribute,
    prefix: null,
    localName: name,
    value,
    childNodes: []
  };
}

function createComment(data: string): Comment {
  return {
    nodeType: NodeType.Comment,
    data,
    childNodes: []
  };
}

function createText(data: string): Text {
  return {
    nodeType: NodeType.Text,
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

function createDocumentType(
  name: string,
  publicId = "",
  systemId = ""
): DocumentType {
  return {
    nodeType: NodeType.DocumentType,
    name,
    publicId,
    systemId,
    childNodes: []
  };
}

function generateImpliedTags(state: State) {
  while (true) {
    const node = currentNode(state);

    if (node === null || !isElement(node)) {
      return;
    }

    switch (node.localName) {
      case "caption":
      case "colgroup":
      case "dd":
      case "dt":
      case "li":
      case "optgroup":
      case "option":
      case "p":
      case "rb":
      case "rp":
      case "rt":
      case "rtc":
      case "tbody":
      case "td":
      case "tfoot":
      case "th":
      case "thead":
      case "tr":
        state.openElements.pop();
        break;
      default:
        return;
    }
  }
}

function resetInsertionMode(state: State) {
  let last = false;
  let index = state.openElements.length - 1;
  let node = state.openElements[index];

  while (true) {
    if (index === 0) {
      last = true;
    }

    switch (node.localName) {
      case "select":
        const done = (state: State) => {
          state.insertionMode = inSelect;
        };

        if (last) {
          done(state);
          break;
        }

        let ancestor = node;

        while (true) {
          let localIndex = index - 1;

          if (localIndex === 0) {
            done(state);
          }

          ancestor = state.openElements[--localIndex];

          if (ancestor.localName === "template") {
            done(state);
            break;
          }

          if (ancestor.localName === "table") {
            state.insertionMode = inSelectInTable;
            return; // abort
          }
        }
        break;

      case "td":
      case "th":
        if (!last) {
          state.insertionMode = inCell;
          return; // abort
        }
        break;
      case "tr":
        state.insertionMode = inRow;
        return; // abort
      case "tbody":
      case "thead":
      case "tfoot":
        state.insertionMode = inTableBody;
        return; // abort
      case "caption":
        state.insertionMode = inCaption;
        return; // abort
      case "colgroup":
        state.insertionMode = inColumnGroup;
        return; // abort
      case "table":
        state.insertionMode = inTable;
        return; // abort
      case "template":
        state.insertionMode = currentTemplateInsertionMode(state);
        return; // abort
      case "head":
        if (!last) {
          state.insertionMode = inHead;
          return;
        }
        break;
      case "body":
        state.insertionMode = inBody;
        return; // abort
      case "frameset":
        state.insertionMode = inFrameset;
        return; // abort
      case "html":
        state.insertionMode =
          state.headElementPointer === null ? beforeHead : afterHead;
        return; // abort
    }

    if (last) {
      state.insertionMode = inBody;
      return; // abort
    }

    node = state.openElements[--index];
  }
}

function clearUntilLastMarker(state: State) {
  while (true) {
    const entry = state.activeFormattingElements.pop();

    if (entry === Marker) {
      return;
    }
  }
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
    openElements: [],
    activeFormattingElements: [],
    framesetOk: true,
    templateInsertionModes: [],
    headElementPointer: null
  })
);
