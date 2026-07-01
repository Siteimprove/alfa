/// <reference lib="dom" />
import * as TypeDoc from "typedoc";
import {
  MarkdownPageEvent,
  MarkdownTheme,
  MarkdownThemeContext,
} from "typedoc-plugin-markdown";

/**
 * Add a Category to all declaration reflections, if they don't already have
 * one (nor a group). The category has the same name as the reflection.
 */
export function load(application: TypeDoc.Application) {
  application.converter.on(
    TypeDoc.Converter.EVENT_RESOLVE,
    (_context, reflection) => {
      if (!reflection.isDeclaration()) {
        return;
      }

      if (
        reflection.kindOf([
          // Enum member make little sense when not grouped as Enum member.
          TypeDoc.ReflectionKind.EnumMember,
          // Seems to be something with type re-exported by the index?
          // Not clear why, but these get duplicated under a __type heading
          // if not ignored.
          TypeDoc.ReflectionKind.TypeLiteral,
        ])
      ) {
        return;
      }

      // Get the reflection's comment, adding an empty one if needed.
      const comment = (reflection.comment ??= new TypeDoc.Comment());

      // If the reflection has no group nor category, add one.
      if (!comment.getTag("@group") && !comment.getTag("@category")) {
        comment.blockTags.push(
          new TypeDoc.CommentTag("@category", [
            { kind: "text", text: reflection.name },
          ]),
        );
        // }
      }
    },
  );

  application.renderer.defineTheme("categorizeMarkdown", MyMarkdownTheme);
}

class MyMarkdownTheme extends MarkdownTheme {
  getRenderContext(page: MarkdownPageEvent<TypeDoc.Reflection>) {
    return new MyMarkdownThemeContext(this, page, this.application.options);
  }
}

class MyMarkdownThemeContext extends MarkdownThemeContext {
  constructor(
    theme: MarkdownTheme,
    page: MarkdownPageEvent<TypeDoc.Reflection>,
    options: TypeDoc.Options,
  ) {
    super(theme, page, options);

    const saved = this.partials.groupIndex;

    // When we have a group (olr category) with several members, we want to
    // add the kind of the member to the name of the reflection, as they otherwise
    // have the same name (this is how they are categorized). The default HTML
    // theme adds a one letter badge for this differentiation, but the Markdown
    // on doesn't, and this can be confusing. The default groupIndex call at
    // https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/theme/context/partials/member.groupIndex.ts#L77-L82
    // just gets the children's names, with no easy hook to edit them before they
    // land in the table, so we have to update the actual reflection.
    //
    // This is fairly bad as it means that the theme is having a side effect on
    // the full project. Therefore, the Markdown output should be called last
    // otherwise the kind will make its way to the other outputs.
    this.partials.groupIndex = (group) => {
      if (group.children.length > 1) {
        for (const child of group.children) {
          child.name = `${child.name} (${TypeDoc.ReflectionKind.singularString(child.kind)})`;
        }
      }

      return saved(group);
    };
  }
}
