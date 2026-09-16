import { MarkdownPageEvent } from '../events/index.js';
import { MarkdownThemeContext } from '../theme/index.js';
import { DeclarationReflection, DocumentReflection, ProjectReflection, Reflection, Renderer, Router, Theme } from 'typedoc';
/**
 * The main theme class for the plugin.
 *
 * The class controls how TypeDoc models are mapped to files and templates and extends TypeDoc's base Theme class.
 *
 * You would typically only be interested in overriding the the theme's render context instance.
 *
 * The API follows the implementation of [TypeDoc's custom theming](https://github.com/TypeStrong/typedoc/blob/master/internal-docs/custom-themes.md) with some minor adjustments.
 */
export declare class MarkdownTheme extends Theme {
    router: Router;
    constructor(renderer: Renderer);
    /**
     * Renders a template and page model to a string.
     */
    render(page: MarkdownPageEvent): string;
    getNavigation(project: ProjectReflection): import("../public-api.js").NavigationItem[];
    getRenderContext(page: MarkdownPageEvent<Reflection>): MarkdownThemeContext;
    indexTemplate: (page: MarkdownPageEvent<ProjectReflection>) => string;
    reflectionTemplate: (page: MarkdownPageEvent<DeclarationReflection>) => string;
    documentTemplate: (page: MarkdownPageEvent<DocumentReflection>) => string;
    hierarchyTemplate: (page: MarkdownPageEvent<ProjectReflection>) => string;
}
