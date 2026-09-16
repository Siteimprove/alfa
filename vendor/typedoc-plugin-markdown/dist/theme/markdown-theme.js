import { formatMarkdown } from '../libs/utils/index.js';
import { MarkdownThemeContext, NavigationBuilder, } from '../theme/index.js';
import { PageKind, Theme, } from 'typedoc';
/**
 * The main theme class for the plugin.
 *
 * The class controls how TypeDoc models are mapped to files and templates and extends TypeDoc's base Theme class.
 *
 * You would typically only be interested in overriding the the theme's render context instance.
 *
 * The API follows the implementation of [TypeDoc's custom theming](https://github.com/TypeStrong/typedoc/blob/master/internal-docs/custom-themes.md) with some minor adjustments.
 */
export class MarkdownTheme extends Theme {
    router;
    constructor(renderer) {
        super(renderer);
        this.router = renderer.router;
    }
    /**
     * Renders a template and page model to a string.
     */
    render(page) {
        const templateMapping = {
            [PageKind.Index]: (event) => this.indexTemplate(event),
            [PageKind.Document]: (event) => this.documentTemplate(event),
            [PageKind.Hierarchy]: (event) => this.hierarchyTemplate(event),
            [PageKind.Reflection]: (event) => this.reflectionTemplate(event),
        };
        const template = templateMapping[page.pageKind];
        if (!template) {
            throw new Error(`[typedoc-plugin-markdown]: ${page.pageKind} page kind not supported.`);
        }
        if (!page.isReflectionEvent()) {
            throw new Error(`[typedoc-plugin-markdown]: The page model should be a reflection when rendering the "${page.pageKind}" page kind.`);
        }
        return formatMarkdown(template(page));
    }
    getNavigation(project) {
        return new NavigationBuilder(this.router, this, project).getNavigation();
    }
    getRenderContext(page) {
        return new MarkdownThemeContext(this, page, this.application.options);
    }
    indexTemplate = (page) => {
        return this.getRenderContext(page).templates.index(page);
    };
    reflectionTemplate = (page) => {
        return this.getRenderContext(page).templates.reflection(page);
    };
    documentTemplate = (page) => {
        return this.getRenderContext(page).templates.document(page);
    };
    hierarchyTemplate = (page) => {
        return this.getRenderContext(page).templates.hierarchy(page);
    };
}
