/**
 * The entry point for initializing and bootstrapping the plugin.
 *
 * @module core
 */
import { setupInternationalization } from './internationalization/index.js';
import { declarations } from './options/index.js';
import { render, setupRenderer } from './renderer/index.js';
import { i18n, ParameterHint, ParameterType, } from 'typedoc';
/**
 * The function that is called by TypeDoc to bootstrap the plugin.
 *
 * @remarks
 *
 * The load function exposes additional TypeDoc options and make some adjustments.
 *
 * This method is not intended to be consumed in any other context that via the `plugin` option.
 *
 * The module also exports anything that is available publicly.
 *
 */
export function load(app) {
    /**
     * ====================
     * 1. Bootstrap options
     * ====================
     */
    Object.entries(declarations).forEach(([name, declaration]) => {
        app.options.addDeclaration({
            name,
            ...declaration,
        });
    });
    app.options.addDeclaration({
        name: 'markdown',
        outputShortcut: 'markdown',
        help: () => i18n.help_out(),
        type: ParameterType.Path,
        hint: ParameterHint.Directory,
        defaultValue: './docs',
    });
    /**
     * =============================
     * 2. Configure markdown outputs
     * =============================
     */
    app.outputs.addOutput('markdown', async (out, project) => {
        await render(app.renderer, project, out);
    });
    app.outputs.setDefaultOutputName('markdown');
    /**
     * ===================================
     * 3. Set up renderer and translations
     * ===================================
     */
    setupRenderer(app);
    setupInternationalization(app);
}
/**
 * Export anything that is available publicly.
 */
export * from './public-api.js';
