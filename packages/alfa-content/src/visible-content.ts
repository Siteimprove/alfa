import { DOM } from "@siteimprove/alfa-aria";
import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import type { Equatable } from "@siteimprove/alfa-equatable";
import type * as json from "@siteimprove/alfa-json";
import type { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

const { hasName, isElement } = Element;
const { hasRole } = DOM;
const { isText } = Text;
const { test } = Predicate;

/**
 * Representation of visible content.
 *
 * @remarks
 * Contains a sequence of entries (text nodes and structural markers) and a map
 * from each entry to its nearest heading ancestor.
 *
 * Based on the HTML innerText algorithm.
 * {@link https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute}
 *
 * @public
 */
export class VisibleContent
  implements Equatable, Serializable<VisibleContent.JSON>
{
  public static of(
    entries: Sequence<VisibleContent.Entry>,
    headings: Map<VisibleContent.Entry, Element>,
  ): VisibleContent {
    return new VisibleContent(entries, headings);
  }

  private readonly _entries: Sequence<VisibleContent.Entry>;
  private readonly _headings: Map<VisibleContent.Entry, Element>;

  private constructor(
    entries: Sequence<VisibleContent.Entry>,
    headings: Map<VisibleContent.Entry, Element>,
  ) {
    this._entries = entries;
    this._headings = headings;
  }

  public get entries(): Sequence<VisibleContent.Entry> {
    return this._entries;
  }

  public get headings(): Map<VisibleContent.Entry, Element> {
    return this._headings;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof VisibleContent &&
      value._entries.equals(this._entries) &&
      value._headings === this._headings
    );
  }

  public toJSON(): VisibleContent.JSON {
    return {
      entries: this._entries.toJSON(),
      headings: this._headings.toJSON(),
    };
  }

  /**
   * Converts to a plain text string following HTML innerText algorithm.
   *
   * @remarks
   * This collapses structural markers into newlines and concatenates text.
   */
  public toString(): string {
    let result = "";

    for (const entry of this._entries) {
      switch (entry.type) {
        case "text":
          result += entry.data;
          break;
        case "break":
          result += "\n";
          break;
        case "block-start":
        case "block-end":
          result += "\n";
          break;
        case "paragraph-start":
        case "paragraph-end":
          result += "\n\n";
          break;
        case "table-cell-end":
          if (!entry.isLast) {
            result += "\t";
          }
          break;
        case "table-row-end":
          if (!entry.isLast) {
            result += "\n";
          }
          break;
      }
    }

    return result;
  }
}

/**
 * @public
 */
export namespace VisibleContent {
  export interface JSON {
    [key: string]: json.JSON;
    entries: Sequence.JSON<Entry>;
    headings: Map.JSON<Entry, Element>;
  }

  /**
   * Entry types in the visible content intermediate representation.
   *
   * @remarks
   * Based on the HTML innerText algorithm's rendered text collection steps.
   * {@link https://html.spec.whatwg.org/multipage/dom.html#rendered-text-collection-steps}
   *
   * @public
   */
  export type Entry =
    | Text
    | Break
    | BlockStart
    | BlockEnd
    | ParagraphStart
    | ParagraphEnd
    | TableCellEnd
    | TableRowEnd;

  /**
   * @public
   */
  export namespace Entry {
    export interface JSON {
      [key: string]: json.JSON;
      type: string;
      source: Element.JSON;
    }
  }

  /**
   * A line break (from `<br>` element).
   *
   * @public
   */
  export class Break implements Equatable, Serializable<Break.JSON> {
    public static of(element: Element): Break {
      return new Break(element);
    }

    private readonly _source: Element;

    private constructor(element: Element) {
      this._source = element;
    }

    public get type(): "break" {
      return "break";
    }

    public get source(): Element {
      return this._source;
    }

    public equals(value: unknown): value is this {
      return value instanceof Break && value._source.equals(this._source);
    }

    public toJSON(): Break.JSON {
      return {
        type: "break",
        source: this._source.toJSON(),
      };
    }
  }

  /**
   * @public
   */
  export namespace Break {
    export interface JSON extends Entry.JSON {
      type: "break";
    }
  }

  /**
   * Start of a block-level element (adds newline).
   */
  export class BlockStart implements Equatable, Serializable<BlockStart.JSON> {
    public static of(element: Element): BlockStart {
      return new BlockStart(element);
    }

    private readonly _source: Element;

    private constructor(element: Element) {
      this._source = element;
    }

    public get type(): "block-start" {
      return "block-start";
    }

    public get source(): Element {
      return this._source;
    }

    public equals(value: unknown): value is this {
      return value instanceof BlockStart && value._source.equals(this._source);
    }

    public toJSON(): BlockStart.JSON {
      return {
        type: "block-start",
        source: this._source.toJSON(),
      };
    }
  }

  export namespace BlockStart {
    export interface JSON extends Entry.JSON {
      type: "block-start";
    }
  }

  /**
   * End of a block-level element (adds newline).
   */
  export class BlockEnd implements Equatable, Serializable<BlockEnd.JSON> {
    public static of(element: Element): BlockEnd {
      return new BlockEnd(element);
    }

    private readonly _source: Element;

    private constructor(element: Element) {
      this._source = element;
    }

    public get type(): "block-end" {
      return "block-end";
    }

    public get source(): Element {
      return this._source;
    }

    public equals(value: unknown): value is this {
      return value instanceof BlockEnd && value._source.equals(this._source);
    }

    public toJSON(): BlockEnd.JSON {
      return {
        type: "block-end",
        source: this._source.toJSON(),
      };
    }
  }

  export namespace BlockEnd {
    export interface JSON extends Entry.JSON {
      type: "block-end";
    }
  }

  /**
   * Start of a paragraph element (adds 2 newlines).
   */
  export class ParagraphStart
    implements Equatable, Serializable<ParagraphStart.JSON>
  {
    public static of(element: Element): ParagraphStart {
      return new ParagraphStart(element);
    }

    private readonly _source: Element;

    private constructor(element: Element) {
      this._source = element;
    }

    public get type(): "paragraph-start" {
      return "paragraph-start";
    }

    public get source(): Element {
      return this._source;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof ParagraphStart && value._source.equals(this._source)
      );
    }

    public toJSON(): ParagraphStart.JSON {
      return {
        type: "paragraph-start",
        source: this._source.toJSON(),
      };
    }
  }

  export namespace ParagraphStart {
    export interface JSON extends Entry.JSON {
      type: "paragraph-start";
    }
  }

  /**
   * End of a paragraph element (adds 2 newlines).
   */
  export class ParagraphEnd
    implements Equatable, Serializable<ParagraphEnd.JSON>
  {
    public static of(element: Element): ParagraphEnd {
      return new ParagraphEnd(element);
    }

    private readonly _source: Element;

    private constructor(element: Element) {
      this._source = element;
    }

    public get type(): "paragraph-end" {
      return "paragraph-end";
    }

    public get source(): Element {
      return this._source;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof ParagraphEnd && value._source.equals(this._source)
      );
    }

    public toJSON(): ParagraphEnd.JSON {
      return {
        type: "paragraph-end",
        source: this._source.toJSON(),
      };
    }
  }

  export namespace ParagraphEnd {
    export interface JSON extends Entry.JSON {
      type: "paragraph-end";
    }
  }

  /**
   * End of a table-cell element (adds TAB if not last in row).
   */
  export class TableCellEnd
    implements Equatable, Serializable<TableCellEnd.JSON>
  {
    public static of(element: Element, isLast: boolean): TableCellEnd {
      return new TableCellEnd(element, isLast);
    }

    private readonly _source: Element;
    private readonly _isLast: boolean;

    private constructor(element: Element, isLast: boolean) {
      this._source = element;
      this._isLast = isLast;
    }

    public get type(): "table-cell-end" {
      return "table-cell-end";
    }

    public get source(): Element {
      return this._source;
    }

    public get isLast(): boolean {
      return this._isLast;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof TableCellEnd &&
        value._source.equals(this._source) &&
        value._isLast === this._isLast
      );
    }

    public toJSON(): TableCellEnd.JSON {
      return {
        type: "table-cell-end",
        source: this._source.toJSON(),
        isLast: this._isLast,
      };
    }
  }

  export namespace TableCellEnd {
    export interface JSON extends Entry.JSON {
      type: "table-cell-end";
      isLast: boolean;
    }
  }

  /**
   * End of a table-row element (adds LF if not last in table).
   */
  export class TableRowEnd
    implements Equatable, Serializable<TableRowEnd.JSON>
  {
    public static of(element: Element, isLast: boolean): TableRowEnd {
      return new TableRowEnd(element, isLast);
    }

    private readonly _source: Element;
    private readonly _isLast: boolean;

    private constructor(element: Element, isLast: boolean) {
      this._source = element;
      this._isLast = isLast;
    }

    public get type(): "table-row-end" {
      return "table-row-end";
    }

    public get source(): Element {
      return this._source;
    }

    public get isLast(): boolean {
      return this._isLast;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof TableRowEnd &&
        value._source.equals(this._source) &&
        value._isLast === this._isLast
      );
    }

    public toJSON(): TableRowEnd.JSON {
      return {
        type: "table-row-end",
        source: this._source.toJSON(),
        isLast: this._isLast,
      };
    }
  }

  export namespace TableRowEnd {
    export interface JSON extends Entry.JSON {
      type: "table-row-end";
      isLast: boolean;
    }
  }

  const textIsEmpty = Text.is((data) => data.length === 0);

  /**
   * Mutable builder for constructing the visible content.
   *
   * @internal
   */
  class Builder {
    static of(device: Device, root: Node) {
      return new Builder(device, root);
    }

    constructor(device: Device, root: Node) {
      this._device = device;
      this._root = root;
    }

    private readonly _device: Device;
    private readonly _root: Node;
    private readonly _entries: Array<Entry> = [];
    private readonly _headings: Array<[Entry, Element]> = [];

    currentHeading?: Element = undefined;

    public addEntry(entry: Entry) {
      this._entries.push(entry);

      if (this.currentHeading !== undefined) {
        this._headings.push([entry, this.currentHeading]);
      }
    }

    processNode(device: Device, node: Node) {
      if (isText(node)) {
        this.processText(device, node);
      } else if (isElement(node)) {
        this.processElement(device, node);
      } else {
        for (const child of node.children(Node.flatTree)) {
          this.processNode(device, child);
        }
      }
    }

    processText(device: Device, text: Text) {
      const isRendered = Style.isRendered(device);
      if (!isRendered(text)) {
        return;
      }

      // Step 2: Visibility is inherited from parent element
      // If we reached here, parent was visible

      // Empty text nodes contribute nothing
      if (textIsEmpty(text)) {
        return;
      }

      // Step 4: Apply CSS white-space and text-transform processing
      // For now, add raw text - full implementation requires:
      // - white-space-collapse property handling
      // - text-transform property handling
      // - soft hyphen preservation
      // - line-ending space rules
      // TODO: Implement full text processing
      this.addEntry(text);
    }

    processElement(device: Device, element: Element) {
      const isRendered = Style.isRendered(device);
      // Step 3: If the element is not being rendered, return empty
      // Special handling for select/optgroup/option per spec
      const isFormElement = hasName("select", "optgroup", "option")(element);
      if (!isRendered(element) && !isFormElement) {
        return;
      }

      const style = Style.from(element, device);

      // Step 2: Check visibility - if not visible, skip this element's own markers/content
      // but still recurse to children as they may override with visibility:visible
      const visibility = style.computed("visibility").value;
      const isVisible = visibility.is("visible");

      // If not visible, still process children but skip element's own contributions
      if (!isVisible) {
        for (const child of element.children(Node.flatTree)) {
          this.processNode(device, child);
        }
        return;
      }

      const isHeadingElement = test(isHeading(device), element);

      if (isHeadingElement) {
        this.currentHeading = element;
      }

      // Step 5: Handle br elements
      if (hasName("br")(element)) {
        const entry = Break.of(element);
        this.addEntry(entry);
        return;
      }

      // Step 8: Handle paragraphs specially (with 2 newlines)
      if (hasRole(device, "paragraph")(element)) {
        const startEntry = ParagraphStart.of(element);
        this.addEntry(startEntry);

        for (const child of element.children(Node.flatTree)) {
          this.processNode(device, child);
        }

        this.addEntry(ParagraphEnd.of(element));
        return;
      }

      // Get display value for box generation
      const {
        values: [outside], // outer display type
      } = style.computed("display").value;

      // Step 3: Special form element handling
      // Treat select as inline, optgroup/option as block even if display:none
      if (isFormElement) {
        const effectiveDisplay = hasName("select")(element)
          ? "inline"
          : "block";

        if (effectiveDisplay === "block") {
          this.addEntry(BlockStart.of(element));
          for (const child of element.children(Node.flatTree)) {
            this.processNode(device, child);
          }
          this.addEntry(BlockEnd.of(element));
          return;
        }
        // Inline case: fall through to process children
      }

      // Step 9: Block-level boxes
      if (outside.is("block", "table-caption")) {
        this.addEntry(BlockStart.of(element));

        for (const child of element.children(Node.flatTree)) {
          this.processNode(device, child);
        }

        this.addEntry(BlockEnd.of(element));
        return;
      }

      // Step 6: Table cells - add TAB separator if not last in row
      if (outside.is("table-cell")) {
        for (const child of element.children(Node.flatTree)) {
          this.processNode(device, child);
        }

        // Check if this is the last table-cell in its parent row
        const isLast = this.isLastTableCellInRow(element, device);
        this.addEntry(TableCellEnd.of(element, isLast));
        return;
      }

      // Step 7: Table rows - add LF separator if not last in table
      if (outside.is("table-row")) {
        for (const child of element.children(Node.flatTree)) {
          this.processNode(device, child);
        }

        // Check if this is the last table-row in its parent table
        const isLast = this.isLastTableRowInTable(element, device);
        this.addEntry(TableRowEnd.of(element, isLast));
        return;
      }

      // Inline-level boxes and others: just process children
      for (const child of element.children(Node.flatTree)) {
        this.processNode(device, child);
      }
    }

    /**
     * Check if this table-cell is the last one in its enclosing table-row.
     */
    private isLastTableCellInRow(cell: Element, device: Device): boolean {
      const parent = cell.parent(Node.flatTree).filter(isElement);
      if (parent.isNone()) {
        return true;
      }

      const parentElement = parent.getUnsafe();
      const siblings = [...parentElement.children(Node.flatTree)].filter(
        isElement,
      );

      // Find all table-cell siblings after this one
      let foundCurrent = false;
      for (const sibling of siblings) {
        if (sibling.equals(cell)) {
          foundCurrent = true;
          continue;
        }

        if (foundCurrent) {
          const {
            values: [outside],
          } = Style.from(sibling, device).computed("display").value;
          if (outside.is("table-cell")) {
            return false; // Found another table-cell after this one
          }
        }
      }

      return true; // No table-cell siblings found after this one
    }

    /**
     * Check if this table-row is the last one in its enclosing table.
     */
    private isLastTableRowInTable(row: Element, device: Device): boolean {
      // Find the nearest ancestor with display: table or table-row-group
      let current = row.parent(Node.flatTree).filter(isElement);
      let tableAncestor: Element | undefined;

      while (current.isSome()) {
        const element = current.getUnsafe();
        const {
          values: [outside],
        } = Style.from(element, device).computed("display").value;

        if (
          outside.is(
            "table",
            "table-row-group",
            "table-header-group",
            "table-footer-group",
          )
        ) {
          tableAncestor = element;
          // Keep looking for table element to get the outermost container
          if (outside.is("table")) {
            break;
          }
        }

        current = element.parent(Node.flatTree).filter(isElement);
      }

      if (tableAncestor === undefined) {
        return true; // No table ancestor found, consider it last
      }

      // Collect all table-row descendants from the table ancestor
      const tableRows: Element[] = [];

      const collectRows = (node: Node): void => {
        if (isElement(node)) {
          const {
            values: [display],
          } = Style.from(node, device).computed("display").value;

          if (display.is("table-row")) {
            tableRows.push(node);
          }

          // Recurse to children
          for (const child of node.children(Node.flatTree)) {
            collectRows(child);
          }
        }
      };

      collectRows(tableAncestor);

      // Check if our row is the last one
      return (
        tableRows.length > 0 && tableRows[tableRows.length - 1].equals(row)
      );
    }

    public build(): VisibleContent {
      this.processNode(this._device, this._root);
      return VisibleContent.of(
        Sequence.from(this._entries),
        Map.from(this._headings),
      );
    }
  }

  function isHeading(device: Device): (element: Element) => boolean {
    return DOM.hasRole(device, "heading");
  }

  const cache = Cache.empty<Device, Cache<Element, VisibleContent>>();

  /**
   * Build a visible content representation from an element.
   *
   * @remarks
   *
   * Follows the HTML innerText algorithm's rendered text collection steps.
   * {@link https://html.spec.whatwg.org/multipage/dom.html#rendered-text-collection-steps}
   *
   * @public
   */
  export function fromElement(
    device: Device,
    element: Element,
  ): VisibleContent {
    return cache
      .get(device, () => Cache.empty<Element, VisibleContent>())
      .get(element, () => Builder.of(device, element).build());
  }
}
