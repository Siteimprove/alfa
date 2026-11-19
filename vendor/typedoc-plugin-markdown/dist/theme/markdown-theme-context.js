import { resourceHelpers, resourcePartials, resourceTemplates, } from '../theme/context/resources.js';
/**
 * The theme context class that is provided as context on the rendering of every page.
 *
 * It is heavily influenced by the equivalent [DefaultThemeRenderContext](https://typedoc.org/api/classes/DefaultThemeRenderContext.html) from the default theme.
 *
 * This class can be used to customize the theme output by extending the class and overriding the templates, partials and helpers.
 *
 * @groupDescription Properties
 *
 * Properties are passed into the constructor and are used to provide context to the theme.
 *
 * @groupDescription Methods
 *
 * General context aware helper methods not bound to any specific models that can be used by the theme resources.
 *
 * @groupDescription Resources
 *
 * Theme resources are the main building blocks for the theme context. They are split into three namespaces: `templates`, `partials` and `helpers`.
 *
 * @privateRemarks
 *
 * In order to create cleaner code, internally individual templates located in the `resources/templates` directory are bound to the this.
 */
export class MarkdownThemeContext {
    theme;
    page;
    options;
    /**
     * The markdown router instance.
     */
    router;
    /**
     * Holds meta data for individual packages (if entryPointStrategy equals `packages`).
     *
     * This is required for generating package specific documentation.
     */
    packagesMetaData;
    /**
     *
     */
    constructor(
    /**
     * The theme instance.
     */
    theme, 
    /**
     * The current page event.
     */
    page, 
    /**
     * The options provided to the application.
     */
    options) {
        this.theme = theme;
        this.page = page;
        this.options = options;
        this.router = theme.router;
        this.packagesMetaData = this.theme.owner.packagesMeta;
    }
    /**
     *  Then `templates` namespace holds the main templates for the theme and are mapped to single pages and configured in the MarkdownTheme.
     *
     * All templates return a string that is passed back to the renderer. Internally templates call partials and helpers.
     *
     * @group Resources
     */
    templates = resourceTemplates(this);
    /** The `partials` namespace holds the partials for the theme and are used by templates to map speficic models to page output.
     *
     * Please note that partials::
     *
     * - Take a `model` param (that references a specific TypeDoc model) and an `options` param if required.
     * - Can call other partials and helpers.
     * - Must return a string.
     *
     * Partials are categorised by their use:
     *
     * - Page Partials: Partials that render core page elements such as header and breadcrumbs.
     * - Container Partials: Partials that are used to render reflection groups and categories.
     * - Member Partials: Partials that render specific parts of reflections.
     * - Comment Partials: Partials that render comments.
     * - Type Partials: Partials that render specific TypeDoc model types.
     *
     * @group Resources
     **/
    partials = resourcePartials(this);
    /**
     * The `helpers` namespace holds the helpers for the theme and are smaller utility functions that return snippets or text or other data transformations.
     *
     * Please note that partials:
     *
     * - Take a `model` param (that references a specific TypeDoc model) and an `options` param if required.
     * - Can reference other helpers but should not reference partials.
     * - Can return strings or other models.
     *
     * @group Resources
     */
    helpers = resourceHelpers(this);
    /**
     * Returns the package meta data for a given package name when entrypointStrategy is set to `packages`.
     *
     * @param packageName - The package name as per `name` field from `package.json`.
     */
    getPackageMetaData(packageName) {
        return this.packagesMetaData[packageName];
    }
    /**
     * Return the number of packages in the project.
     */
    getPackagesCount() {
        return this.packagesMetaData
            ? Object.keys(this.packagesMetaData).length
            : 0;
    }
    /**
     * Returns a url relative to the current page.
     */
    relativeURL(url) {
        return this.router.baseRelativeUrl(this.page.model, url);
    }
    /**
     * Returns the relative url of a given reflection.
     */
    urlTo(reflection) {
        const parseUrl = (url) => {
            const [base, ...fragments] = url.split('#');
            if (fragments.length === 0)
                return base;
            const lastFragment = fragments[fragments.length - 1];
            return `${base}#${lastFragment}`;
        };
        const publicPath = this.options.getValue('publicPath');
        if (publicPath) {
            return encodeURI(`${publicPath.replace(/\/$/, '')}/${parseUrl(this.router.getFullUrl(reflection))}`).replace(/\\/g, '/');
        }
        if (this.router.hasUrl(reflection)) {
            return parseUrl(this.router.relativeUrl(this.page.model, reflection));
        }
        return '';
    }
    /**
     * Hook into the TypeDoc rendering system.
     */
    hook = (...params) => {
        return this.theme.owner.markdownHooks.emit(...params);
    };
}
