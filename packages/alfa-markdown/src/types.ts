export interface Node {
  readonly type: string;
}

export interface Parent extends Node {
  readonly children: Array<Node>;
}

/**
 * @see https://github.com/syntax-tree/mdast#root
 */
export interface Root extends Parent {
  readonly type: "root";
}

/**
 * @see https://github.com/syntax-tree/mdast#paragraph
 */
export interface Paragraph extends Parent {
  readonly type: "paragraph";
}

/**
 * @see https://github.com/syntax-tree/mdast#blockquote
 */
export interface Blockquote extends Parent {
  readonly type: "blockquote";
}

/**
 * @see https://github.com/syntax-tree/mdast#heading
 */
export interface Heading extends Parent {
  readonly type: "heading";
  readonly depth: number;
}

/**
 * @see https://github.com/syntax-tree/mdast#code
 */
export interface Code extends Node {
  readonly type: "code";
  readonly value: string;
  readonly lang: string | null;
}

/**
 * @see https://github.com/syntax-tree/mdast#inlinecode
 */
export interface InlineCode extends Node {
  readonly type: "inlineCode";
  readonly value: string;
}

/**
 * @see https://github.com/syntax-tree/mdast#yaml
 */
export interface Yaml extends Node {
  readonly type: "yaml";
  readonly value: string;
}

/**
 * @see https://github.com/syntax-tree/mdast#html
 */
export interface Html extends Node {
  readonly type: "html";
  readonly value: string;
}

/**
 * @see https://github.com/syntax-tree/mdast#list
 */
export interface List extends Parent {
  readonly type: "list";
  readonly ordered: boolean;
  readonly start: number | null;
  readonly loose: boolean;
  readonly children: Array<ListItem>;
}

/**
 * @see https://github.com/syntax-tree/mdast#listitem
 */
export interface ListItem extends Parent {
  readonly type: "listItem";
  readonly loose: boolean;
  readonly checked: boolean | null;
}

export type Alignment = "left" | "right" | "center";

/**
 * @see https://github.com/syntax-tree/mdast#table
 */
export interface Table extends Parent {
  readonly type: "table";
  readonly align: Array<Alignment>;
  readonly children: Array<TableRow>;
}

/**
 * @see https://github.com/syntax-tree/mdast#tablerow
 */
export interface TableRow extends Parent {
  readonly type: "tableRow";
  readonly children: Array<TableCell>;
}

/**
 * @see https://github.com/syntax-tree/mdast#tablecell
 */
export interface TableCell extends Parent {
  readonly type: "tableCell";
}

/**
 * @see https://github.com/syntax-tree/mdast#thematicbreak
 */
export interface ThematicBreak extends Node {
  readonly type: "thematicBreak";
}

/**
 * @see https://github.com/syntax-tree/mdast#break
 */
export interface Break extends Node {
  readonly type: "break";
}

/**
 * @see https://github.com/syntax-tree/mdast#emphasis
 */
export interface Emphasis extends Parent {
  readonly type: "emphasis";
}

/**
 * @see https://github.com/syntax-tree/mdast#strong
 */
export interface Strong extends Parent {
  readonly type: "strong";
}

/**
 * @see https://github.com/syntax-tree/mdast#delete
 */
export interface Delete extends Parent {
  readonly type: "delete";
}

/**
 * @see https://github.com/syntax-tree/mdast#link
 */
export interface Link extends Parent {
  readonly type: "link";
  readonly title: string | null;
  readonly url: string;
}

/**
 * @see https://github.com/syntax-tree/mdast#image
 */
export interface Image extends Node {
  readonly type: "image";
  readonly title: string | null;
  readonly alt: string | null;
  readonly url: string;
}

/**
 * @see https://github.com/syntax-tree/mdast#footnote
 */
export interface Footnote extends Parent {
  readonly type: "footnote";
}

export type ReferenceType = "shortcut" | "collapsed" | "full";

/**
 * @see https://github.com/syntax-tree/mdast#linkreference
 */
export interface LinkReference extends Parent {
  readonly type: "linkReference";
  readonly identifier: string;
  readonly referenceType: ReferenceType;
}

/**
 * @see https://github.com/syntax-tree/mdast#imagereference
 */
export interface ImageReference extends Node {
  readonly type: "imageReference";
  readonly identifier: string;
  readonly referenceType: ReferenceType;
  readonly alt: string | null;
}

/**
 * @see https://github.com/syntax-tree/mdast#footnotereference
 */
export interface FootnoteReference extends Node {
  readonly type: "footnoteReference";
  readonly identifier: string;
}

/**
 * @see https://github.com/syntax-tree/mdast#definition
 */
export interface Definition extends Node {
  readonly type: "definition";
  readonly identifier: string;
  readonly title: string | null;
  readonly url: string;
}

/**
 * @see https://github.com/syntax-tree/mdast#footnotedefinition
 */
export interface FootnoteDefinition extends Parent {
  readonly type: "footnoteDefinition";
  readonly identifier: string;
}

/**
 * @see https://github.com/syntax-tree/mdast#textnode
 */
export interface Text extends Node {
  readonly type: "text";
}
