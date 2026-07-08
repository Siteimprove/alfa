/// <reference lib="dom" />
import { i18n } from "typedoc";
import * as TypeDoc from "typedoc";
import { MarkdownPageEvent, MarkdownTheme } from "typedoc-plugin-markdown";

import { CategorizeMarkdownThemeContext } from "./categorize.ts";

export function load(application: TypeDoc.Application) {
  application.renderer.defineTheme("alfaTheme", AlfaTheme);
}

class AlfaTheme extends MarkdownTheme {
  getRenderContext(page: MarkdownPageEvent<TypeDoc.Reflection>) {
    return new AlfaContext(this, page, this.application.options);
  }
}

// Since we can only use one theme, we need to merge in the changes from the
// CategorizeMarkdownTheme and only expose this theme.
class AlfaContext extends CategorizeMarkdownThemeContext {
  constructor(
    theme: MarkdownTheme,
    page: MarkdownPageEvent<TypeDoc.Reflection>,
    options: TypeDoc.Options,
  ) {
    super(theme, page, options);

    // This is mostly copied from the default theme:
    // https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/theme/context/partials/member.sources.ts
    // With a change to the link name (first parameter of the `link` call).
    this.partials.sources = function (model, options) {
      const md = [];
      if (!options?.hideLabel) {
        md.push(`${i18n.theme_defined_in()}:`);
      }
      model.sources?.forEach((source, index) => {
        if (index === 0) {
          if (source.url) {
            md.push(link(`${escapeChars(source.fileName)}`, source.url));
          } else {
            md.push(`${escapeChars(source.fileName)}`);
          }
        }
      });
      return md.join(" ");
    };

    this.partials.comment = () => "";
  }
}

// We also need to copy the utilities since they are not exposed by
// typedoc-plugin-markdown.
// See https://github.com/typedoc2md/typedoc-plugin-markdown/issues/873
// and upadte whin/if we can hook on the ones from the plugin.
function escapeChars(str: string): string {
  return str
    .replace(/>/g, "\\>")
    .replace(/</g, "\\<")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/_/g, "\\_")
    .replace(/`/g, "\\`")
    .replace(/\|/g, "\\|")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\*/g, "\\*");
}
function link(label: string, url: string): string {
  const parsedUrl = url?.trim() || "";
  const safeLabel = label.trim();
  return parsedUrl.length ? `[${safeLabel}](${parsedUrl})` : safeLabel;
}
