export interface Node {
  readonly type: string;
}

export interface Parent extends Node {
  readonly children: Array<Node>;
}

export interface Text extends Node {
  readonly type: "text";
}

export interface Root extends Parent {
  readonly type: "root";
}

export interface Paragraph extends Parent {
  readonly type: "paragraph";
}

export interface Blockquote extends Parent {
  readonly type: "blockquote";
}

export interface Heading extends Parent {
  readonly type: "heading";
  readonly depth: number;
}

export interface Code extends Node {
  readonly type: "code";
  readonly value: string;
  readonly lang: string | null;
}

export interface InlineCode extends Node {
  readonly type: "inlineCode";
  readonly value: string;
}

export interface List extends Parent {
  readonly type: "list";
  readonly ordered: boolean;
  readonly start: number | null;
  readonly loose: boolean;
  readonly children: Array<ListItem>;
}

export interface ListItem extends Parent {
  readonly type: "listItem";
  readonly loose: boolean;
  readonly checked: boolean | null;
}

export type Alignment = "left" | "right" | "center";

export interface Table extends Parent {
  readonly type: "table";
  readonly align: Array<Alignment>;
  readonly children: Array<TableRow>;
}

export interface TableRow extends Parent {
  readonly type: "tableRow";
  readonly children: Array<TableCell>;
}

export interface TableCell extends Parent {
  readonly type: "tableCell";
}

export interface ThematicBreak extends Node {
  readonly type: "thematicBreak";
}

export interface Break extends Node {
  readonly type: "break";
}

export interface Emphasis extends Parent {
  readonly type: 'emphasis'
}

export interface Strong extends Parent {
  readonly type: "strong";
}

export interface Delete extends Parent {
  readonly type: "delete";
}

export interface Link extends Parent {
  readonly type: "link";
  readonly title: string | null;
  readonly url: string;
}

export interface Image extends Node {
  readonly type: "image";
  readonly title: string | null;
  readonly alt: string | null;
  readonly url: string;
}

export interface Footnote extends Parent {
  readonly type: "footnote";
}

export type ReferenceType = "shortcut" | "collapsed" | "full";

export interface LinkReference extends Parent {
  readonly type: "linkReference";
  readonly identifier: string;
  readonly referenceType: ReferenceType;
}

export interface ImageReference extends Node {
  readonly type: "imageReference";
  readonly identifier: string;
  readonly referenceType: ReferenceType;
  readonly alt: string | null;
}

export interface FootnoteReference extends Node {
  readonly type: "footnoteReference";
  readonly identifier: string;
}

export interface Definition extends Node {
  readonly type: "definition";
  readonly identifier: string;
  readonly title: string | null;
  readonly url: string;
}

export interface FootnoteDefinition extends Parent {
  readonly type: "footnoteDefinition";
  readonly identifier: string;
}
