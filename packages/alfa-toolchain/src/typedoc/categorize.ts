/// <reference lib="dom" />
import * as TypeDoc from "typedoc";

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
}
