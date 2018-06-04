import * as DOM from "@siteimprove/alfa-dom";

declare global {
  namespace V {
    export type Node = DOM.Node;
    export type Element = DOM.Element;
    export type Text = DOM.Text;
    export type Comment = DOM.Comment;
    export type Document = DOM.Document;
    export type DocumentType = DOM.DocumentType;
    export type DocumentFragment = DOM.DocumentFragment;
    export type ShadowRoot = DOM.ShadowRoot;
    export type StyleSheet = DOM.StyleSheet;
    export type StyleDeclaration = DOM.StyleDeclaration;
    export type Rule = DOM.Rule;
    export type StyleRule = DOM.StyleRule;
    export type ImportRule = DOM.ImportRule;
    export type MediaRule = DOM.MediaRule;
    export type FontFaceRule = DOM.FontFaceRule;
    export type PageRule = DOM.PageRule;
    export type KeyframesRule = DOM.KeyframesRule;
    export type KeyframeRule = DOM.KeyframeRule;
    export type NamespaceRule = DOM.NamespaceRule;
    export type SupportsRule = DOM.SupportsRule;
  }
}
