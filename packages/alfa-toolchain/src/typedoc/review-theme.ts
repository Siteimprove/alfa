/// <reference lib="dom" />
import { i18n, ReflectionKind } from "typedoc";
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

    const { helpers, options, partials } = this;

    // Remove comments
    this.partials.comment = () => "";

    // Completely removes parameters (including the heading) and return type
    // from detailed signatures (keep only the title)
    // Taken from https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/theme/context/partials/member.signature.ts
    // Might be cleaned up if https://github.com/typedoc2md/typedoc-plugin-markdown/issues/876
    // is implemented.
    this.partials.signature = function signature(
      model,
      { accessor, hideTitle, nested, multipleSignatures, headingLevel },
    ) {
      const md = [];
      if (!hideTitle) {
        md.push(partials.signatureTitle(model, { accessor }));
      }
      if (!nested && model.sources && !options.getValue("disableSources")) {
        md.push(partials.sources(model));
      }
      if (!multipleSignatures && model.parent?.documents) {
        md.push(partials.documents(model?.parent, { headingLevel }));
      }
      md.push(partials.inheritance(model, { headingLevel }));
      return md.join("\n\n");
    };

    // Expand the types parameters in signatures, adding extends and default.
    // Taken from https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/theme/context/partials/member.typeParametersList.ts
    // injected in https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/theme/context/partials/member.signatureTitle.ts
    // Might be cleaned up if https://github.com/typedoc2md/typedoc-plugin-markdown/issues/875
    // is implemented.
    this.partials.signatureTitle = function signatureTitle(model, opts) {
      const md = [];
      const useCodeBlocks = options.getValue("useCodeBlocks");
      const keyword = helpers.getKeyword(model.parent.kind);
      if (useCodeBlocks && helpers.isGroupKind(model.parent) && keyword) {
        md.push(keyword + " ");
      }
      if (opts?.accessor) {
        md.push(bold(opts?.accessor) + " ");
      }
      if (model.parent) {
        const flagsString = helpers.getReflectionFlags(model.parent?.flags);
        if (flagsString.length) {
          md.push(helpers.getReflectionFlags(model.parent.flags) + " ");
        }
      }
      if (!["__call", "__type"].includes(model.name)) {
        const name = [];
        if (model.kind === ReflectionKind.ConstructorSignature) {
          name.push("new");
        }
        name.push(escapeChars(model.name));
        md.push(bold(name.join(" ")));
      }
      if (model.typeParameters) {
        const typesMD: string[] = [];
        model.typeParameters?.forEach((typeParameter) => {
          const nameDescription: string[] = [backTicks(typeParameter.name)];

          if (typeParameter.type) {
            nameDescription.push(
              `${italic('extends')} ${partials.someType(typeParameter.type)}`,
            );
          }

          if (typeParameter.default) {
            nameDescription.push(
              `= ${partials.someType(typeParameter.default, { forceCollapse: true })}`,
            );
          }

          typesMD.push(nameDescription.join(' '));
        });

        md.push("<" + typesMD.join(", ") + ">");
      }
      md.push(partials.signatureParameters(model.parameters || []));
      if (model.type) {
        md.push(`: ${partials.someType(model.type)}`);
      }
      if (useCodeBlocks) {
        md.push(";");
      }
      const result = md.join("");
      return useCodeBlocks ? codeBlock(result) : `> ${result}`;
    };
  }
}

// We also need to copy the utilities since they are not exposed by
// typedoc-plugin-markdown.
// See https://github.com/typedoc2md/typedoc-plugin-markdown/issues/873
// and upadte when/if we can hook on the ones from the plugin.
function backTicks(text: string) {
  // If the input string itself contains a pipe, or backslash (which can result in unwanted side effects) the string is escaped instead.
  if (/(\||\\)/g.test(text)) {
    return escapeChars(text);
  }
  // If the input string itself contains a backtick, the string is wrapped in double backticks.
  if (/`/g.test(text)) {
    return `\`\` ${text} \`\``;
  }
  // Otherwise, the string is wrapped in single backticks.
  return `\`${text}\``;
}
function bold(text: string) {
  return `**${text}**`;
}
function italic(text: string) {
  return `*${text}*`;
}
function codeBlock(content: string) {
  const trimLastLine = (content: string) => {
    const lines = content.split("\n");
    return lines
      .map((line, index) => (index === lines.length - 1 ? line.trim() : line))
      .join("\n");
  };
  const trimmedContent =
    content.endsWith("}") ||
    content.endsWith("};") ||
    content.endsWith(">") ||
    content.endsWith(">;")
      ? trimLastLine(content)
      : content;
  return "```typescript\n" + unEscapeChars(trimmedContent) + "\n```";
}
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
function unEscapeChars(str: string) {
  return str
    .replace(
      /(`[^`]*?)\\*([^`]*?`)/g,
      (match, p1, p2) => `${p1}${p2.replace(/\*/g, "\\*")}`,
    )
    .replace(/\\\\/g, "\\")
    .replace(/(?<!\\)\*/g, "")
    .replace(/\\</g, "<")
    .replace(/\\>/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\_/g, "_")
    .replace(/\\{/g, "{")
    .replace(/\\}/g, "}")
    .replace(/``.*?``|(?<!\\)`/g, (match) =>
      match.startsWith("``") ? match : "",
    )
    .replace(/`` /g, "")
    .replace(/ ``/g, "")
    .replace(/\\`/g, "`")
    .replace(/\\\*/g, "*")
    .replace(/\\\|/g, "|")
    .replace(/\\\]/g, "]")
    .replace(/\\\[/g, "[")
    .replace(/\[([^[\]]*)\]\((.*?)\)/gm, "$1");
}
