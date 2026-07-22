/// <reference lib="dom" />
import * as TypeDoc from "typedoc";
import { MarkdownPageEvent, MarkdownTheme } from "typedoc-plugin-markdown";

import { CategorizeMarkdownThemeContext } from "./categorize.ts";

export function load(application: TypeDoc.Application) {
  application.renderer.defineTheme("reviewTheme", ReviewTheme);
}

class ReviewTheme extends MarkdownTheme {
  getRenderContext(page: MarkdownPageEvent<TypeDoc.Reflection>) {
    return new ReviewContext(this, page, this.application.options);
  }
}

// Since we can only use one theme, we need to merge in the changes from the
// CategorizeMarkdownTheme and only expose this theme.
class ReviewContext extends CategorizeMarkdownThemeContext {
  constructor(
    theme: MarkdownTheme,
    page: MarkdownPageEvent<TypeDoc.Reflection>,
    themeOptions: TypeDoc.Options,
  ) {
    super(theme, page, themeOptions);

    // Remove comments
    this.partials.comment = () => "";

    // Remove return signature
    this.partials.signatureReturns = () => "";
  }
}
