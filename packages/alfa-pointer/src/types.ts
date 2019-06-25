export const enum PointerType {
  Range = "range",
  Group = "group",

  // DOM pointers
  Document = "document",
  Text = "text",
  Element = "element",
  Attribute = "attribute"
}

export interface Pointer<R> {
  /**
   * A unique identifier of the type of the pointer.
   */
  readonly type: PointerType;

  /**
   * A reference to the context within which the pointer is applicable.
   */
  readonly reference: R;
}

export interface RangePointer<R, P extends Pointer<R>> extends Pointer<R> {
  readonly type: PointerType.Range;

  /**
   * The inclusive start of the pointer range.
   */
  readonly start: P;

  /**
   * The inclusive end of the pointer range.
   */
  readonly end: P;
}

export interface GroupPointer<R, P extends Pointer<R>> extends Pointer<R> {
  readonly type: PointerType.Group;

  /**
   * The pointers belonging to the group.
   */
  readonly pointers: ReadonlyArray<P>;
}

export interface NodePointer<R> extends Pointer<R> {
  /**
   * Node pointers are indentified via a document position which is the position
   * of the node during a tree traversal.
   */
  readonly documentPosition: number;
}

export interface DocumentPointer<R> extends NodePointer<R> {
  readonly type: PointerType.Document;

  /**
   * As documents can only ever be root nodes, their document position will
   * always be 0.
   */
  readonly documentPosition: 0;
}

export interface TextPointer<R> extends NodePointer<R> {
  readonly type: PointerType.Text;
}

export interface ElementPointer<R> extends NodePointer<R> {
  readonly type: PointerType.Element;
}

export interface AttributePointer<R> extends Pointer<R> {
  readonly type: PointerType.Attribute;

  /**
   * The owner of the attribute.
   */
  readonly owner: ElementPointer<R>;

  /**
   * An optional prefix for identifying the attribute if it is part of a
   * namespace.
   */
  readonly prefix?: string;

  /**
   * The local name of the attribute within the list of attributes of its
   * associated owner.
   */
  readonly localName: string;
}
