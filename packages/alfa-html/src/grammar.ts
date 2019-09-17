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
 * @see https://html.spec.whatwg.org/#concept-parser-marker
 */
const Marker = Symbol("marker");
type Marker = typeof Marker;

interface State {
  /**
   * @see https://html.spec.whatwg.org/#insertion-mode
   */
  insertionMode: InsertionMode;

  /**
   * @see https://html.spec.whatwg.org/#original-insertion-mode
   */
  originalInsertionMode: InsertionMode | null;

  /**
   * @see https://html.spec.whatwg.org/#stack-of-open-elements
   */
  openElements: Array<Mutable<Element>>;

  /**
   * @see https://html.spec.whatwg.org/#list-of-active-formatting-elements
   */
  activeFormattingElements: Array<Element | Marker>;

  /**
   * @see https://html.spec.whatwg.org/#frameset-ok-flag
   */
  framesetOk: boolean;

  /**
   * @see https://html.spec.whatwg.org/#stack-of-template-insertion-modes
   */
  templateInsertionModes: Array<InsertionMode>;

  /**
   * @see https://html.spec.whatwg.org/#head-element-pointer
   */
  headElementPointer: Element | null;
}

/**
 * @see https://html.spec.whatwg.org/#the-initial-insertion-mode
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
 * @see https://html.spec.whatwg.org/#the-before-html-insertion-mode
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
 * @see https://html.spec.whatwg.org/#the-before-head-insertion-mode
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
      return; // Parse error

    case TokenType.StartTag:
      switch (token.name) {
        case "html":
          inBody(token, document, state);
          break;

        case "head":
          const element = createElement(token.name);
          insertElement(element, state);
          state.headElementPointer = element;
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
            return; // Parse error
        }
      }

      const element = createElement("head");
      insertElement(element, state);
      state.insertionMode = inHead;
      inHead(token, document, state);
  }
};

/**
 * @see https://html.spec.whatwg.org/#the-in-head-insertion-mode
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
          insertElement(createElement(token.name), state);
          state.openElements.pop();
          break;

        case "title":
        case "noframes":
        case "style":
          insertElement(createElement(token.name), state);
          state.originalInsertionMode = state.insertionMode;
          state.insertionMode = text;
          break;

        case "noscript":
          insertElement(createElement(token.name), state);
          state.insertionMode = inHeadNoscript;
          break;

        case "script":
          insertElement(createElement(token.name), state);

          state.originalInsertionMode = state.insertionMode;
          state.insertionMode = text;
          break;

        case "template":
          insertElement(createElement(token.name), state);
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

          popUntil(state.openElements, "template");

          clearUntilLastMarker(state);

          state.templateInsertionModes.pop();

          resetInsertionMode(state);

          break;

        case "body":
        case "html":
        case "br":
          state.openElements.pop();
          state.insertionMode = afterHead;
          inHead(token, document, state);
          break;

        case "head":
          state.openElements.pop();
          state.insertionMode = afterHead;
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
 * @see https://html.spec.whatwg.org/#the-in-head-noscript-insertion-mode
 */
const inHeadNoscript: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-after-head-insertion-mode
 */
const afterHead: InsertionMode = (token, document, state) => {
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

        case "body":
          insertElement(createElement(token.name), state);
          state.framesetOk = false;
          state.insertionMode = inBody;
          break;

        case "frameset":
          insertElement(createElement(token.name), state);
          state.insertionMode = inFrameset;
          break;

        case "base":
        case "basefont":
        case "bgsound":
        case "link":
        case "meta":
        case "noframes":
        case "script":
        case "style":
        case "template":
        case "title":
          if (state.headElementPointer !== null) {
            state.openElements.push(state.headElementPointer);
          }

          inHead(token, document, state);

          state.openElements = state.openElements.filter(elem => {
            return elem !== state.headElementPointer;
          });

          break;

        case "head":
          return; // parse error
      }
      break;

    case TokenType.EndTag:
      switch (token.name) {
        case "template":
          inHead(token, document, state);
          break;

        case "body":
        case "html":
        case "br":
          insertElement(createElement("body"), state);
          state.insertionMode = inBody;
          inBody(token, document, state);
          break;

        default:
          return; // parse rror
      }
      break;

    default:
      insertElement(createElement("body"), state);
      state.insertionMode = inBody;
      inBody(token, document, state);
  }
};

/**
 * @see https://html.spec.whatwg.org/#the-in-body-insertion-mode
 */
const inBody: InsertionMode = (token, document, state) => {
  switch (token.type) {
    case TokenType.Character:
      switch (token.data) {
        case Char.Null:
          return; // parse error
        case Char.CharacterTabulation:
        case Char.LineFeed:
        case Char.FormFeed:
        case Char.CarriageReturn:
        case Char.Space:
          reconstructActiveFormattingElements(state);
          insertCharacter(token, state);
          break;
        default:
          reconstructActiveFormattingElements(state);
          insertCharacter(token, state);
          state.framesetOk = false;
      }
      break;
    case TokenType.Comment:
      insertNode(createComment(token.data), state);
      break;
    case TokenType.Doctype:
      return; // parse error
    case TokenType.StartTag:
      const body = state.openElements[1];
      switch (token.name) {
        case "html":
          if (
            state.openElements.find(tag => {
              return tag.localName === "template";
            }) !== undefined
          ) {
            return; // ignore
          }

          const last = state.openElements[state.openElements.length - 1];
          if (last === undefined) {
            return;
          }

          createIfNotPresent(token, last);
          break;
        case "base":
        case "basefont":
        case "bgsound":
        case "link":
        case "meta":
        case "noframes":
        case "script":
        case "style":
        case "template":
        case "title":
          inHead(token, document, state);
          break;
        case "body":
          if (body === undefined || body.localName !== "body") {
            return; // ignore
          }

          if (
            state.openElements.find(tag => {
              return tag.localName === "template";
            }) !== undefined
          ) {
            return; // ignore
          }

          state.framesetOk = false;
          createIfNotPresent(token, body);
          break;
        case "frameset":
          if (body === undefined || body.localName !== "body") {
            return; // ignore
          }

          if (state.framesetOk === false) {
            return;
          }
      }
      break;
    case TokenType.EndTag:
      switch (token.name) {
        case "template":
          inHead(token, document, state);
      }
  }
};

/**
 * @see https://html.spec.whatwg.org/#sec-the-text-insertion-mode
 */
const text: InsertionMode = (token, document, state) => {
  switch (token.type) {
    case TokenType.Character:
      insertCharacter(token, state);
      break;

    case TokenType.EndTag:
      state.openElements.pop();

      if (state.originalInsertionMode === null) {
        break;
      }

      state.insertionMode = state.originalInsertionMode;
  }
};

/**
 * @see https://html.spec.whatwg.org/#the-in-table-insertion-mode
 */
const inTable: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-in-table-text-insertion-mode
 */
// const inTableText: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-in-caption-insertion-mode
 */
const inCaption: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-in-column-group-insertion-mode
 */
const inColumnGroup: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-in-table-body-insertion-mode
 */
const inTableBody: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-in-row-insertion-mode
 */
const inRow: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-in-cell-insertion-mode
 */
const inCell: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-in-select-insertion-mode
 */
const inSelect: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-in-select-in-table-insertion-mode
 */
const inSelectInTable: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-in-template-insertion-mode
 */
const inTemplate: InsertionMode = (token, document, state) => {
  switch (token.type) {
    case TokenType.Character:
    case TokenType.Comment:
    case TokenType.Doctype:
      inHead(token, document, state);
      break;

    case TokenType.StartTag:
      switch (token.name) {
        case "base":
        case "basefont":
        case "bgsound":
        case "link":
        case "meta":
        case "noframes":
        case "script":
        case "style":
        case "template":
        case "title":
          inHead(token, document, state);
          break;

        case "caption":
        case "colgroup":
        case "tbody":
        case "tfoot":
          state.templateInsertionModes.pop();
          state.templateInsertionModes.push(inTable);
          state.insertionMode = inTable;
          inTable(token, document, state);
          break;

        case "col":
          state.templateInsertionModes.pop();
          state.templateInsertionModes.push(inColumnGroup);
          state.insertionMode = inColumnGroup;
          inColumnGroup(token, document, state);
          break;

        case "tr":
          state.templateInsertionModes.pop();
          state.templateInsertionModes.push(inTableBody);
          state.insertionMode = inTableBody;
          inTableBody(token, document, state);
          break;

        case "td":
        case "th":
          state.templateInsertionModes.pop();
          state.templateInsertionModes.push(inRow);
          state.insertionMode = inRow;
          inRow(token, document, state);
          break;

        default:
          state.templateInsertionModes.pop();
          state.templateInsertionModes.push(inBody);
          state.insertionMode = inBody;
          inBody(token, document, state);
      }
      break;

    case TokenType.EndTag:
      switch (token.name) {
        case "template":
          inHead(token, document, state);
          break;

        default:
          return; // parse error
      }
  }
};

/**
 * @see https://html.spec.whatwg.org/#the-after-body-insertion-mode
 */
// const afterBody: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-in-frameset-insertion-mode
 */
const inFrameset: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-after-frameset-insertion-mode
 */
// const afterFrameset: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-after-after-body-insertion-mode
 */
// const afterAfterBody: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#the-after-after-frameset-insertion-mode
 */
// const afterAfterFrameset: InsertionMode = () => {};

/**
 * @see https://html.spec.whatwg.org/#tree-construction
 */
function constructTree(
  token: Token,
  document: Document,
  state: State
): Document {
  state.insertionMode(token, document, state);
  return document;
}

function enableQuirksMode(document: Mutable<Document>): void {}

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

function insertElement(
  element: Element,
  state: State,
  position: InsertionLocation | null = appropriateInsertionLocation(state)
) {
  insertNode(element, state, position);
  state.openElements.push(element);
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
 * @see https://html.spec.whatwg.org/#current-template-insertion-mode
 */
function currentTemplateInsertionMode(state: State): InsertionMode | null {
  const insertionMode =
    state.templateInsertionModes[state.templateInsertionModes.length - 1];

  if (insertionMode === undefined) {
    return null;
  }

  return insertionMode;
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

/**
 * @see https://html.spec.whatwg.org/#generate-all-implied-end-tags-thoroughly
 */
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

/**
 * @see https://html.spec.whatwg.org/#reset-the-insertion-mode-appropriately
 */
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

        let localIndex = index - 1;
        while (true) {
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
        const insertionMode = currentTemplateInsertionMode(state);

        if (insertionMode === null) {
          return; // abort
        }

        state.insertionMode = insertionMode;

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

/**
 * @see https://html.spec.whatwg.org/#clear-the-list-of-active-formatting-elements-up-to-the-last-marker
 */
function clearUntilLastMarker(state: State) {
  while (true) {
    const entry = state.activeFormattingElements.pop();

    if (entry === Marker) {
      return;
    }
  }
}

/**
 * @see https://html.spec.whatwg.org/#reconstruct-the-active-formatting-elements
 */
function reconstructActiveFormattingElements(state: State) {
  if (state.activeFormattingElements.length === 0) {
    return;
  }

  let index = state.activeFormattingElements.length - 1;
  let entry = state.activeFormattingElements[index];

  const create = (entry: Element) => {
    const newElement = createElement(entry.localName);
    insertElement(newElement, state);
    state.activeFormattingElements[index] = newElement;
  };

  while (true) {
    if (
      entry === Marker ||
      state.openElements.find(element => {
        return element === entry;
      }) !== undefined
    ) {
      if (index === state.activeFormattingElements.length - 1) {
        return; // nothing to reconstruct
      }

      break;
    }

    if (index === 0) {
      create(entry);
      break;
    }

    entry = state.activeFormattingElements[--index];
  }

  while (true) {
    entry = state.activeFormattingElements[++index];

    if (index === state.activeFormattingElements.length - 1) {
      return; // done
    }

    if (entry === Marker) {
      continue;
    }

    create(entry);
  }
}

function popUntil(list: Array<Element>, tag: string) {
  while (true) {
    const tail = list[list.length - 1];

    if (tail === undefined) {
      return;
    }

    list.pop();

    if (tail.localName === tag) {
      break;
    }
  }
}

function createIfNotPresent(token: Token, element: Element) {
  if (token.type !== TokenType.StartTag) {
    return;
  }

  for (const attribute of token.attributes) {
    let present = false;
    for (const lastKey in element.attributes) {
      const lastAttribute = element.attributes[lastKey];
      if (lastAttribute.localName === attribute.name) {
        present = true;
      }
    }

    if (!present) {
      (element.attributes as Array<Attribute>).push(
        createAttribute(attribute.name, attribute.value)
      );
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

const startTag: Production = {
  token: TokenType.StartTag,

  prefix(token, stream, expression, state) {
    return constructTree(token, createDocument(), state);
  },

  infix(token, stream, expression, left, state) {
    return constructTree(token, left, state);
  }
};

const endTag: Production = {
  token: TokenType.EndTag,

  prefix(token, stream, expression, state) {
    return constructTree(token, createDocument(), state);
  },

  infix(token, stream, expression, left, state) {
    return constructTree(token, left, state);
  }
};

export const Grammar: Lang.Grammar<Token, Document, State> = new Lang.Grammar(
  [doctype, comment, startTag, endTag],
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
