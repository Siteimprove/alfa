/**
 * Typedoc options declarations.
 *
 * This will be exposed to TypeDoc as a new option when bootstrapping the plugin, with the name of the option the name of the exported variable.
 *
 * The JSDoc comments will also be used in the public facing documentation.
 *
 * @categoryDescription File
 *
 * File options are used by the plugin’s <OptionLink type="output" name="router" /> to configure file output details.
 *
 * @categoryDescription Display
 *
 * Display options are used to configure how the output is structured and displayed.
 *
 * @categoryDescription Utility
 *
 * Utility options are used for general configuration and utility purposes.
 *
 * @module
 */
import { DeclarationOption } from 'typedoc';
/**
 *
 * @category File
 *
 * @hidden
 *
 */
export declare const outputFileStrategy: Partial<DeclarationOption>;
/**
 * This option is useful when only specific types of members should be exported to a single file.
 *
 * @example ["Class", "Enum", "Interface"]
 *
 * @category File
 *
 * @hidden
 */
export declare const membersWithOwnFile: Partial<DeclarationOption>;
/**
 * Typically Markdown files are recognised by the `.md` or `.markdown` file extensions.`.mdx` maybe required for compatibility with certain Markdown parsers.
 *
 * @example ".mdx"
 *
 * @category File
 */
export declare const fileExtension: Partial<DeclarationOption>;
/**
 * The `entryFileName` in this context is the root page of the documentation and each module directory.
 * This is essentially the equivalent to `index.html` for web pages.
 *
 * `README` is recognised when browsing folders on repos and Wikis and is the plugin default. `index` might be more suitable for static site generators.
 *
 * The content of root documentation file will be resolved in the following order:
 *
 * - The resolved Readme file (skipped if the "readme" option is set to `none`).
 * - The documentation index page.
 *
 * @example "index"
 *
 * @category File
 *
 */
export declare const entryFileName: Partial<DeclarationOption>;
/**
 *
 * By default the page is named either  "modules", "packages" or "globals" depending on the context.
 *
 * *Note: this option is NOT applicable when `"readme"` is set to `"none"` or `"mergeReadme"` is set to `true`.*
 *
 * @example "documentation"
 *
 * @category File
 *
 */
export declare const modulesFileName: Partial<DeclarationOption>;
/**
 * By default when a readme file is resolved, a separate readme page is created.
 * This option appends the documentation main/index page to the readme page so only a single root page is generated.
 *
 * *Note:*
 * - *This option has no affect when `"readme"` is set to `"none"`.*
 * - *For packages readmes (when `"entryPointStrategy"` is set to `"packages"`) this is the default behaviour.*
 *
 * @category File
 */
export declare const mergeReadme: Partial<DeclarationOption>;
/**
 * By default output files are generated in a directory structure.
 *
 * This option will flatten the output files to a single directory as follows:
 *
 * <FileTree>
 *   <FileTree.File name="README.md" />
 *   <FileTree.File name="module-a.Class.ClassA.md" />
 *   <FileTree.File name="module-a.Class.ClassB.md" />
 *   <FileTree.File name="module-a.Function.FunctionA.md" />
 *   <FileTree.File name="module-a.Function.FunctionB.md" />
 *   <FileTree.File name="module-b.Class.ClassA.md" />
 *   <FileTree.File name="module-b.Class.ClassB.md" />
 * </FileTree>
 *
 * *Note: This option only affects custom routers.*
 *
 *  @category File
 */
export declare const flattenOutputFiles: Partial<DeclarationOption>;
/**
 * By default, directories are split by scopes when generating file paths.
 *
 * This option removes the `@scope` reference from the path when generating files and directories.
 * It does not affect the name of the package or module in the output.
 *
 * *Note: This option only affects custom routers.*
 *
 * @category File
 */
export declare const excludeScopesInPaths: Partial<DeclarationOption>;
/**
 * This option can be used when the root page of the documentation should be a specific module (typically a module named `index`).
 *
 * The module name should be specified (NOT the reference to the file name).
 *
 * Please note a separate modules index page will not be generated, therefore would work better if navigation is present.
 *
 * @example "index"
 *
 * @deprecated
 *
 * @hidden
 *
 * @category File
 */
export declare const entryModule: Partial<DeclarationOption>;
/**
 * @category Display
 */
export declare const hidePageHeader: Partial<DeclarationOption>;
/**
 * @category Display
 */
export declare const hideBreadcrumbs: Partial<DeclarationOption>;
/**
 * @category Display
 */
export declare const hidePageTitle: Partial<DeclarationOption>;
/**
 * By default members are grouped by kind (eg Classes, Functions etc).
 *
 * This creates a flat structure where all members are displayed at the same heading level.
 *
 * @category Display
 *
 * @hidden
 */
export declare const hideGroupHeadings: Partial<DeclarationOption>;
/**
 * @deprecated
 *
 * @hidden
 */
export declare const excludeGroups: Partial<DeclarationOption>;
/**
 * This option can be used to improve readability and aesthetics when defining signatures and declarations.
 *
 * Please note that when this option is set to `true` it is not possible to link to other references.
 *
 * As a work around the [`@link`](https://typedoc.org/tags/link/) tag can be be used to manually reference types.
 *
 * @category Display
 */
export declare const useCodeBlocks: Partial<DeclarationOption>;
/**
 * By default when objects have associated documentation, object declarations are collapsed to preserve space and improve readability.
 *
 * This option should be set when a full object representation is preferred.
 *
 * @category Display
 */
export declare const expandObjects: Partial<DeclarationOption>;
/**
 * By default parameters and type parameters in signature definitions only display their name so the output is more concise.
 *
 * This option should be set when a full type representation is preferred, showing parameter types as well as type parameter `extends` clauses and defaults.
 *
 * @category Display
 */
export declare const expandParameters: Partial<DeclarationOption>;
/**
 * By default block tags (such as `@example`, `@remarks`, `@deprecated`) are rendered after "Parameters", "Returns" and "Type declaration" sections for signatures and declarations.
 *
 * The rationale is that comment block tags often contain more detailed, supplementary information and are typically secondary to understanding the primary use of the symbol,
 *
 * Use this option to preserve the position of the tag content with the comment summary.
 *
 * @example ["@example", "@deprecated"]
 *
 * @category Display
 */
export declare const blockTagsPreserveOrder: Partial<DeclarationOption>;
/**
 * When set to `true`, the titles of pages representing deprecated symbols will be rendered with strikethroughs.
 *
 * @category Display
 */
export declare const strikeDeprecatedPageTitles: Partial<DeclarationOption>;
/**
 * This option renders index items either as a simple unordered list or in a table.
 *
 * When table style is selected the following will be the behaviour:
 *
 * - For a **members index**, a description column will be added with key `table` - the first paragraph of the comment summary, or key `htmlTable` - the entire comment contents.
 * - For a **packages index**, (when `entryPointStrategy` equals `packages`), the package.json description will be displayed with an additional "Version" column (when `--includeVersion` equals true).
 * - For a **documents index** a description column will be added to the table printing the `"description"` frontmatter variable.
 *
 * @category Display
 */
export declare const indexFormat: Partial<DeclarationOption>;
/**
 * This option specifies the output format for parameters and type parameters of functions and class methods:
 *
 * - **"list"**: parameters are output in linear blocks with headings, suitable for more detailed comments.
 * - **"table"**: parameters are output within a Markdown table, condensed into a single paragraph.
 * - **"htmlTable"**: parameters are output in an HTML table, enabling block elements to render in table cells.
 * - **"none"**: parameters are omitted entirely.
 *
 * @category Display
 */
export declare const parametersFormat: Partial<DeclarationOption>;
/**
 * This option specifies the output format for interface properties:
 *
 * - **"list"**: properties are output in linear blocks with headings, suitable for more detailed comments.
 * - **"table"**: properties are output within a Markdown table, condensed into a single paragraph.
 * - **"htmlTable"**: properties are output in an HTML table, enabling block elements to render in tabular format.
 *
 * @category Display
 */
export declare const interfacePropertiesFormat: Partial<DeclarationOption>;
/**
 * This option specifies the output format for class properties:
 *
 * - **"list"**: properties are output in linear blocks with headings, suitable for more detailed comments.
 * - **"table"**: properties are output within a Markdown table, condensed into a single paragraph.
 * - **"htmlTable"**: properties are output in an HTML table, enabling block elements to render in tabular format.
 *
 * @category Display
 */
export declare const classPropertiesFormat: Partial<DeclarationOption>;
/**
 * This option specifies the output format for type alias properties:
 *
 * - **"list"**: properties are output in linear blocks with headings, suitable for more detailed comments.
 * - **"table"**: properties are output within a Markdown table, condensed into a single paragraph.
 * - **"htmlTable"**: properties are output in an HTML table, enabling block elements to render in tabular format.
 *
 * @category Display
 */
export declare const typeAliasPropertiesFormat: Partial<DeclarationOption>;
/**
 * This option specifies the output format for enumeration members:
 *
 * - **"list"**: members are output in linear blocks with headings, suitable for more detailed comments.
 * - **"table"**: members are output within a Markdown table, condensed into a single paragraph.
 * - **"htmlTable"**: members are output in an HTML table, enabling block elements to render in tabular format.
 *
 * @category Display
 */
export declare const enumMembersFormat: Partial<DeclarationOption>;
/**
 * This option will handle the formatting of object literals assigned as properties in classes or interfaces.
 *
 * Note this options will only take effect when the property declaration is rendered in a `list` format.
 *
 * - **"list"**: members are output in linear blocks with headings, suitable for more detailed comments.
 * - **"table"**: members are output within a Markdown table, condensed into a single paragraph.
 * - **"htmlTable"**: members are output in an HTML table, enabling block elements to render in tabular format.
 *
 * @category Display
 */
export declare const propertyMembersFormat: Partial<DeclarationOption>;
/**
 * This option specifies the output format for type declaration of variables and type aliases.
 *
 * - **"list"**: declarations are output in linear blocks with headings, suitable for more detailed comments.
 * - **"table"**: declarations are output within a Markdown table, condensed into a single paragraph.
 * - **"htmlTable"**: declarations are output in an HTML table, enabling block elements to render in tabular format.
 *
 * @category Display
 */
export declare const typeDeclarationFormat: Partial<DeclarationOption>;
/**
 * Configures the visibility level for type declaration documentation. Applies to both list and table formats.
 *
 * - **"verbose"**: Provides full documentation details for all type declarations, including nested types.
 * - **"compact"**: Summarizes nested types as JSON, reducing verbosity while retaining key information.
 *
 * @category Display
 *
 * @hidden
 */
export declare const typeDeclarationVisibility: Partial<DeclarationOption>;
/**
 * @deprecated
 *
 * @hidden
 */
export declare const propertiesFormat: Partial<DeclarationOption>;
/**
 * Configures the main page title (# heading) output using placeholders or functions.
 *
 * Each value can be either:
 *
 * - A string supporting placeholders.
 * - A function that receives input arguments.
 *
 * **Available keys**
 *
 * - `index`: For the main documentation index page.
 * - `module`: For module and namespace pages.
 * - `member`: For individual member pages.
 *
 * **Available placeholders / function arguments**
 *
 * For index pages:
 *
 * - `projectName`: The project's name, resolved by TypeDoc.
 * - `version`: The project version, resolved by TypeDoc (when `includeVersion` is `true`).
 *
 *  For module and member pages:
 *
 * - `name`: The name of the module or member including type parameters (includes markdown escaping).
 * - `rawName`: Same as `name` placeholder without escaping (useful if including inside backticks).
 * - `keyword`: The translated keyword for the symbol, if applicable (e.g., "Abstract").
 * - `codeKeyword`: The code keyword for the symbol, if applicable (e.g., `abstract`).
 * - `kind`: The TypeDoc reflection kind of the symbol.
 * - `group`: The group title, if applicable.
 *
 * **Default values**
 *
 * By default, the plugin uses the following templates and placeholders:
 *
 *  ```json
 *  {
 *  "pageTitleTemplates": {
 *    "index": "{projectName} {version}", // e.g. "My Project 1.0.0"
 *    "member": "{keyword} {kind}: {name}", // e.g. "Abstract Class: MyClass\<T, V\>"
 *    "module": "{name}" // e.g. "MyModule"
 *   }
 * }
 * ```
 *
 * **String placeholder examples (JSON/JS config)**
 *
 * Placeholders can can be used using the pattern `{placeholder}`.
 *
 *  ```json filename="typedoc.json"
 *  {
 *  "pageTitleTemplates": {
 *    "index": "{projectName} - (v{version})", // e.g. "My Project - (v1.0.0)"
 *    "member": "{group} - `{rawName}`", // e.g. "Classes - `MyClass<T, V>`"
 *   }
 * }
 * ```
 *
 * **Function examples (JS config only)**
 *
 * Functions are more flexible as it allows you to use conditional logic and custom formatting.
 *
 * ```js filename="typedoc.cjs"
 * pageTitleTemplates: {
 *   index: (args) => `${args.projectName} - (v${args.version})`, // e.g. "My Project - (v1.0.0)"
 *   member: (args) =>
 *     `${args.name} ${args.codeKeyword && `(${args.codeKeyword)}`, // MyClass<T, V> (abstract)
 * }
 * ```
 *
 * @omitExample
 *
 * @category Display
 */
export declare const pageTitleTemplates: Partial<DeclarationOption>;
/**
 * By default, all available data for symbols are displayed in table columns which can result in several columns in certain use-cases.
 *
 * This option allows you to control the visibility of columns, prioritizing readability over displaying complete data.
 * In addition you can control the alignment of the header text.
 *
 * @category Display
 */
export declare const tableColumnSettings: Partial<DeclarationOption>;
/**
 * This plugin generates well-formatted Markdown, however, integrating the popular formatting package [Prettier](https://prettier.io/) can provide additional enhancements, such as:
 *
 * - Formats code inside fenced blocks within comments blocks, using the respective Prettier configuration for that language.
 * - Aligns markdown table cells.
 * - Removes unnecessary escape characters.
 * - Wraps long lines of text to fit within a configurable line width.
 *
 * Please note that Prettier is not a dependency of this plugin and must be installed if you want to use this option.
 *
 * ```bash
 * npm install prettier --save-dev
 * ```
 *
 * @category Utility
 */
export declare const formatWithPrettier: Partial<DeclarationOption>;
/**
 * By default Prettier uses the options resolved from a discovered Prettier [configuration file](https://prettier.io/docs/en/configuration.html).
 *
 * Use this option to specify a separate Prettier configuration file in a custom location.
 *
 * Please note this option is only applicable when `formatWithPrettier` is set to `true`.
 *
 * @example "./path/to/.prettierrc.json"
 *
 * @category Utility
 */
export declare const prettierConfigFile: Partial<DeclarationOption>;
/**
 * If undefined all urls will be relative.
 *
 * @example "http://abc.com"
 *
 * @category Utility
 */
export declare const publicPath: Partial<DeclarationOption>;
/**
 * By default, opening and closing angle brackets (`<` and `>`) are escaped using backslashes, and most modern Markdown processors handle them consistently.
 * However, using HTML entities (`&lt;` and `&gt;`) might be preferable to avoid any inconsistencies with some Markdown processors.
 *
 * @category Utility
 */
export declare const useHTMLEncodedBrackets: Partial<DeclarationOption>;
/**
 * Controls whether HTML custom heading IDs ([`{#custom-id}`](https://www.markdownguide.org/extended-syntax/#heading-ids)) are added to headings.
 *
 * This syntax is not included in standard Markdown specifications such as [GFM](https://github.github.com/gfm/) or [CommonMark](https://spec.commonmark.org/). You may need to configure your Markdown parser to enable this feature.
 *
 * Support for custom heading IDs in popular tools:
 *
 * - Docusaurus - [native support](https://docusaurus.io/docs/3.7.0/markdown-features/toc#heading-ids)
 * - Vitepress - [native support](https://vitepress.dev/guide/markdown#custom-anchors)
 * - Remark - requires additional plugin like [remark-custom-heading-id](https://www.npmjs.com/package/remark-custom-heading-id)
 * - Rehype - requires additional plugin like [rehype-slug-custom-id](https://www.npmjs.com/package/rehype-slug-custom-id)
 *
 * @category Utility
 */
export declare const useCustomAnchors: Partial<DeclarationOption>;
/**
 * This option specifies the output format for custom anchors. This is only
 * applicable when `useCustomAnchors` is set to `true`.
 *
 * The following formats are supported:
 *
 * - `curlyBrace` - `{#custom-id}` This is the default format.
 * - `escapedCurlyBrace` - `\{#custom-id\}` Use this if you want to parse the
 *   output with a MDX parser. The `{#custom-id}` notation does not work in MDX
 *   files because MDX treats `{}` as JSX syntax, causing a parsing error.
 * - `squareBracket` - `[#custom-id]` Use this if you want to use with
 *   [nextra](https://nextra.site/docs/guide/markdown#custom-heading-id).
 *
 * @category Utility
 */
export declare const customAnchorsFormat: Partial<DeclarationOption>;
/**
 * Controls whether HTML anchors (`<a id="...">`) are added to headings.
 *
 * Markdown processors usually auto-generate anchor IDs for headings found in a document.
 * This plugin attempts to generate cross-links to symbols based on these IDs.
 *
 * Enable this option if:
 *
 * - Your Markdown parser does not generate heading IDs, making it impossible to link to headings in the document.
 * - The plugin cannot reliably resolve auto-generated IDs — for example, if additional headings are added dynamically.
 *   In this case, use this option together with `anchorPrefix` to ensure unique and predictable anchors.
 *
 * *Note: HTML anchors will always be added to linkable symbols listed in table rows,
 * as there is no alternative way to link to these items.*
 *
 * @category Utility
 */
export declare const useHTMLAnchors: Partial<DeclarationOption>;
/**
 * Prefix to prepend to all generated anchor links.
 *
 * Use this option when:
 *
 * - Your Markdown parser automatically assigns a custom anchor prefix.
 * - You are using `useHTMLAnchors` and want to avoid ID conflicts with other elements in the document.
 *
 * @example "api-"
 *
 * @category Utility
 */
export declare const anchorPrefix: Partial<DeclarationOption>;
/**
 * @hidden
 *
 * @deprecated
 */
export declare const preserveAnchorCasing: Partial<DeclarationOption>;
/**
 * @hidden
 */
export declare const textContentMappings: Partial<DeclarationOption>;
/**
 * *Please note this options does not affect the rendering of inline code or code blocks (using single/triple backticks).*
 *
 * By default all comments written inside JsDoc comments will be passed to the output as written, and parsers will interpret un-escaped angle brackets as HTML/JSX tags..
 *
 * This option will escape angle brackets `<` `>` and curly braces `{` `}` written inside JsDoc comments.
 *
 * This option would typically be used when source code comes from an external source exposing the following potential issues:
 *
 * - Comments contain raw tags that should be interpreted as code examples.
 * - Comments contain invalid syntax that (in the case of MDX) will cause breaking parsing errors.
 * - Although most parsers use XSS filters, this option provides an additional layer of XSS security.
 *
 * @category Utility
 */
export declare const sanitizeComments: Partial<DeclarationOption>;
/**
 * @deprecated
 *
 * @hidden
 */
export declare const navigationModel: Partial<DeclarationOption>;
/**
 * Writes the project's navigation structure to a JSON file on disk.
 * This can be parsed later to generate a sitemap or sidebar.
 * Use the `pretty` option flag to pretty-format the JSON output.
 *
 * You can further configure the structure itself using the <OptionLink type="output" name="navigation" /> output option.
 *
 * Note the path is resolved according to the config directory.
 *
 * @example "./path/to/navigation.json"
 *
 * @category Utility
 */
export declare const navigationJson: Partial<DeclarationOption>;
