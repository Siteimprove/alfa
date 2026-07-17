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
    const relativeURL = this.relativeURL.bind(this);
    const urlTo = this.urlTo.bind(this);

    // Remove comments
    this.partials.comment = () => "";

    // Completely removes the type parameters section (including the
    // heading) from top-level members with groups (Classes, Interfaces,
    // Enums, Modules, Namespaces, grouped Type aliases).
    // Taken from https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/theme/context/partials/member.memberWithGroups.ts
    // Might be cleaned up if https://github.com/typedoc2md/typedoc-plugin-markdown/issues/876
    // is implemented.
    this.partials.memberWithGroups = function memberWithGroups(model, opts) {
      const md = [];
      if (model.kind === ReflectionKind.TypeAlias) {
        md.push(partials.declarationTitle(model));
      }
      if (
        ![ReflectionKind.Module, ReflectionKind.Namespace].includes(
          model.kind,
        ) &&
        model.sources &&
        !options.getValue("disableSources")
      ) {
        md.push(partials.sources(model));
      }
      if (model.comment) {
        md.push(
          partials.comment(model.comment, { headingLevel: opts.headingLevel }),
        );
      }
      if (model.typeHierarchy?.next) {
        const includeHierarchySummary =
          options.isSet("includeHierarchySummary") &&
          options.getValue("includeHierarchySummary");
        if (includeHierarchySummary) {
          md.push(heading(opts.headingLevel, i18n.theme_hierarchy()));
          md.push(
            link(
              i18n.theme_hierarchy_view_summary(),
              `${relativeURL("hierarchy")}${options.getValue("fileExtension")}`,
            ),
          );
        }
        md.push(
          partials.hierarchy(model.typeHierarchy, {
            headingLevel: includeHierarchySummary
              ? opts.headingLevel + 1
              : opts.headingLevel,
          }),
        );
      }
      if (model.implementedTypes?.length) {
        md.push(heading(opts.headingLevel, i18n.theme_implements()));
        md.push(
          unorderedList(
            model.implementedTypes.map((implementedType) =>
              partials.someType(implementedType),
            ),
          ),
        );
      }
      if (model.kind === ReflectionKind.Class && model.categories?.length) {
        model.groups
          ?.filter((group) => group.title === i18n.kind_plural_constructor())
          .forEach((group) => {
            md.push(heading(opts.headingLevel, i18n.kind_plural_constructor()));
            group.children.forEach((child) => {
              md.push(
                partials.constructor(child as TypeDoc.DeclarationReflection, {
                  headingLevel: opts.headingLevel + 1,
                }),
              );
            });
          });
      }
      if ("signatures" in model && model.signatures?.length) {
        const multipleSignatures = model.signatures?.length > 1;
        model.signatures.forEach((signature) => {
          if (multipleSignatures) {
            md.push(heading(opts.headingLevel, i18n.kind_call_signature()));
          }
          md.push(
            partials.signature(signature, {
              headingLevel: multipleSignatures
                ? opts.headingLevel + 1
                : opts.headingLevel,
            }),
          );
        });
      }
      if (model.indexSignatures?.length) {
        md.push(heading(opts.headingLevel, i18n.theme_indexable()));
        model.indexSignatures.forEach((indexSignature) => {
          md.push(
            `${!options.getValue("useCodeBlocks") ? "> " : ""}${partials.indexSignature(indexSignature, { headingLevel: opts.headingLevel + 1 })}`,
          );
        });
      }
      md.push(partials.body(model, { headingLevel: opts.headingLevel }));
      return md.join("\n\n");
    };

    // Completely removes the type parameters section (including the
    // heading) from standalone declarations (Type aliases, Functions,
    // Variables, Properties, …).
    // Taken from https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/theme/context/partials/member.declaration.ts
    // Might be cleaned up if https://github.com/typedoc2md/typedoc-plugin-markdown/issues/876
    // is implemented.
    this.partials.declaration = function declaration(
      model,
      declOptions = { headingLevel: 2, nested: false },
    ) {
      const md = [];
      const opts = { nested: false, ...declOptions };
      md.push(partials.declarationTitle(model));
      if (
        !opts.nested &&
        model.sources &&
        !options.getValue("disableSources")
      ) {
        md.push(partials.sources(model));
      }
      if (model?.documents) {
        md.push(
          partials.documents(model, {
            headingLevel: declOptions.headingLevel,
          }),
        );
      }
      let typeDeclaration = (model.type as TypeDoc.ReflectionType | undefined)
        ?.declaration;
      if (
        model.type instanceof TypeDoc.ArrayType &&
        model.type?.elementType instanceof TypeDoc.ReflectionType
      ) {
        typeDeclaration = model.type?.elementType?.declaration;
      }
      const hasTypeDeclaration =
        Boolean(typeDeclaration) ||
        (model.type instanceof TypeDoc.UnionType &&
          model.type?.types.some(
            (type) => type instanceof TypeDoc.ReflectionType,
          ));
      if (model.comment) {
        md.push(
          partials.comment(model.comment, {
            headingLevel: opts.headingLevel,
            showSummary: true,
            showTags: false,
          }),
        );
      }
      if (model.type instanceof TypeDoc.IntersectionType) {
        model.type?.types?.forEach((intersectionType) => {
          if (
            intersectionType instanceof TypeDoc.ReflectionType &&
            !intersectionType.declaration.signatures
          ) {
            if (intersectionType.declaration.children) {
              md.push(
                heading(opts.headingLevel, i18n.theme_type_declaration()),
              );
              md.push(
                partials.typeDeclaration(intersectionType.declaration, {
                  headingLevel: opts.headingLevel,
                }),
              );
            }
          }
        });
      }
      if (hasTypeDeclaration) {
        if (model.type instanceof TypeDoc.UnionType) {
          if (helpers.hasUsefulTypeDetails(model.type)) {
            // "theme_union_members" is a plugin-specific string not typed
            // on TypeDoc core's `i18n`.
            md.push(
              heading(
                opts.headingLevel,
                (
                  i18n as unknown as { theme_union_members(): string }
                ).theme_union_members(),
              ),
            );
            md.push(partials.typeDeclarationUnionContainer(model, declOptions));
          }
        } else {
          const useHeading =
            typeDeclaration?.children?.length &&
            (model.kind !== ReflectionKind.Property ||
              helpers.useTableFormat("properties"));
          if (useHeading) {
            md.push(heading(opts.headingLevel, i18n.theme_type_declaration()));
          }
          md.push(
            partials.typeDeclarationContainer(
              model,
              typeDeclaration!,
              declOptions,
            ),
          );
        }
      }
      if (model.comment) {
        md.push(
          partials.comment(model.comment, {
            headingLevel: opts.headingLevel,
            showSummary: false,
            showTags: true,
            showReturns: true,
          }),
        );
      }
      md.push(partials.inheritance(model, { headingLevel: opts.headingLevel }));
      return md.join("\n\n");
    };

    // Expand the type parameters in page titles, adding extends and default.
    // Taken from https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/theme/context/partials/page.pageTitle.ts
    // Might be cleaned up if https://github.com/typedoc2md/typedoc-plugin-markdown/issues/875
    // is implemented.
    function getExpandedTypeParameters(
      model: TypeDoc.Reflection,
    ): string | undefined {
      return (model as TypeDoc.DeclarationReflection)?.typeParameters
        ?.map((typeParameter) => {
          const nameDescription: string[] = [backTicks(typeParameter.name)];

          if (typeParameter.type) {
            nameDescription.push(
              `${italic("extends")} ${partials.someType(typeParameter.type)}`,
            );
          }

          if (typeParameter.default) {
            nameDescription.push(
              `= ${partials.someType(typeParameter.default, { forceCollapse: true })}`,
            );
          }

          return nameDescription.join(" ");
        })
        .join(", ");
    }
    this.partials.pageTitle = function pageTitle() {
      // "textContentMappings" and "pageTitleTemplates" are plugin-specific
      // options not typed on TypeDoc core's `Options.getValue`, which
      // resolves their value to `{}`.
      const textContentMappings = options.getValue(
        "textContentMappings",
      ) as Record<string, string>;
      const pageTitleTemplates = options.getValue(
        "pageTitleTemplates",
      ) as Record<
        string,
        (config: Record<string, string | undefined>) => string
      >;
      const hasCustomPageTitle = options.isSet("pageTitleTemplates");
      const indexPageTitle = hasCustomPageTitle
        ? pageTitleTemplates?.["index"]
        : textContentMappings?.["title.indexPage"];
      const modulePageTitle = hasCustomPageTitle
        ? pageTitleTemplates?.["module"]
        : textContentMappings?.["title.modulePage"];
      const memberPageTitle = hasCustomPageTitle
        ? pageTitleTemplates?.["member"]
        : textContentMappings?.["title.memberPage"];
      if (
        urlTo(page.model) === urlTo(page.project) &&
        [ReflectionKind.Project, ReflectionKind.Module].includes(
          page.model.kind,
        )
      ) {
        if (typeof indexPageTitle === "string") {
          return helpers.getProjectName(indexPageTitle, page);
        }
        return indexPageTitle({
          projectName: page?.project?.name,
          version: page?.project?.packageVersion,
        });
      }
      const typeParameters = getExpandedTypeParameters(page.model);
      const modelName = `${page.model.name}${
        helpers.hasSignatures(page.model as TypeDoc.DeclarationReflection)
          ? "()"
          : ""
      }`;
      const rawName = `${modelName}${typeParameters?.length ? `<${typeParameters}>` : ""}`;
      const name = `${escapeChars(modelName)}${typeParameters?.length ? `${helpers.getAngleBracket("<")}${typeParameters}${helpers.getAngleBracket(">")}` : ""}`;
      const kind = ReflectionKind.singularString(page.model.kind);
      const keyword = getKeyword(page.model);
      const codeKeyword = getCodeKeyword(page.model);
      const group = getOwningGroupTitle(page.model);
      const shouldStrikethrough =
        page.model?.isDeprecated() &&
        options.getValue("strikeDeprecatedPageTitles");
      if (
        [ReflectionKind.Module, ReflectionKind.Namespace].includes(
          page.model.kind,
        )
      ) {
        let renderedModuleTitle;
        if (typeof modulePageTitle === "string") {
          renderedModuleTitle = getFromString(modulePageTitle, {
            rawName,
            name,
            kind,
          });
        } else {
          renderedModuleTitle = modulePageTitle({ name, kind, rawName });
        }
        return shouldStrikethrough
          ? strikeThrough(renderedModuleTitle)
          : renderedModuleTitle;
      }
      let renderedMemberPageTitle;
      if (typeof memberPageTitle === "string") {
        renderedMemberPageTitle = getFromString(memberPageTitle, {
          rawName,
          name,
          group,
          kind,
          keyword,
          codeKeyword,
        });
      } else {
        renderedMemberPageTitle = memberPageTitle({
          rawName,
          name,
          kind,
          keyword,
          codeKeyword,
          group,
        });
      }
      return shouldStrikethrough
        ? strikeThrough(renderedMemberPageTitle)
        : renderedMemberPageTitle;
    };

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
              `${italic("extends")} ${partials.someType(typeParameter.type)}`,
            );
          }

          if (typeParameter.default) {
            nameDescription.push(
              `= ${partials.someType(typeParameter.default, { forceCollapse: true })}`,
            );
          }

          typesMD.push(nameDescription.join(" "));
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

    // Keeps the newline before the closing parenthesis when parameters are
    // displayed on several lines, and moves the "rest" spread dots into the
    // same paramsmd entry as the parameter name so they wrap onto the new line
    // together instead of being left behind on the previous line.
    // Taken from https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/theme/context/partials/member.signatureParameters.ts
    // Can be cleaned up if https://github.com/typedoc2md/typedoc-plugin-markdown/issues/874
    // is implemented.
    this.partials.signatureParameters = function signatureParameters(
      model,
      opts,
    ) {
      const format = options.getValue("useCodeBlocks");
      return (
        "(" +
        model
          .map((param) => {
            const paramType = partials.someType(param.type);
            const showParamType =
              (opts?.forceExpandParameters ?? false) ||
              options.getValue("expandParameters");
            const optional =
              param.flags.isOptional || param.defaultValue ? "?" : "";
            const rest = param.flags?.isRest ? "..." : "";
            const paramItem = [
              `${rest}${backTicks(`${param.name}${optional}`)}`,
            ];
            if (showParamType) {
              paramItem.push(paramType);
            }
            return `${format && model.length > 2 ? `\n   ` : ""}${paramItem.join(": ")}`;
          })
          .join(`, `) +
        (format && model.length > 2 ? `\n)` : ")")
      );
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
function heading(level: number, text: string) {
  level = level > 6 ? 6 : level;
  return `${"#".repeat(level)} ${text}`;
}
function unorderedList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}
function strikeThrough(content: string) {
  return `~~${content}~~`;
}
function getOwningGroupTitle(
  reflection: TypeDoc.Reflection,
): string | undefined {
  const parent = reflection.parent as TypeDoc.ContainerReflection | undefined;
  if (!parent?.groups) return undefined;
  for (const group of parent.groups) {
    if (
      group.children.some(
        (child: { name: string }) => child.name === reflection.name,
      )
    ) {
      return group.title;
    }
  }
  return undefined;
}
function getKeyword(model: TypeDoc.Reflection): string | undefined {
  if (model.flags.isAbstract) {
    return i18n.flag_abstract();
  }
  return undefined;
}
function getCodeKeyword(model: TypeDoc.Reflection): string | undefined {
  if (model.flags.isAbstract) {
    return "abstract";
  }
  return undefined;
}
function getFromString(
  textContent: string,
  config: {
    kind: string;
    rawName: string;
    name: string;
    keyword?: string;
    codeKeyword?: string;
    group?: string;
  },
) {
  return textContent
    .replace("{kind}", config.kind)
    .replace("{rawName}", config.rawName)
    .replace("{name}", config.name)
    .replace("{keyword}", config.keyword ?? "")
    .replace("{codeKeyword}", config.codeKeyword ?? "")
    .replace("{group}", config.group ?? "")
    .replace(/``/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
