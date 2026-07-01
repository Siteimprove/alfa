---
"@siteimprove/alfa-toolchain": minor
---

**Added:** A Typedoc plugin is now available to automatically categorize reflections by their name.

Reflections without a group nor category are automatically added to a category with the same name as the reflection. This notably means that for our default pattern of having a class and namespace of the same name, they will both receive the same (unique) category and be grouped together in outputs.

For the Markdown output, a `categorizeMarkdown` theme also adds the kind of the reflection to its name. This prevents class `Foo` and namespace `Foo` to be listed side by side with no differentiation; they now appear as "Foo (Class)" and "Foo (Namespace)" in the indexes. 
