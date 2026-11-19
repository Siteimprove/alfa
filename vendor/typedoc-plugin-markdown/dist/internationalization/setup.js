import { de, en, fr, ja, ko, zh } from '../internationalization/index.js';
import { Converter } from 'typedoc';
/**
 * Returns subset of translatable strings for the plugin.
 *
 * These will then be merged with the main set of TypeDoc string.
 *
 * @category Functions
 */
export function setupInternationalization(app) {
    app.converter.on(Converter.EVENT_BEGIN, () => {
        app.internationalization.addTranslations(app.options.getValue('lang'), {
            ...getTranslatable(app),
        });
    });
}
/**

 */
function getTranslatable(app) {
    const LOCALES = {
        en,
        de,
        fr,
        ko,
        ja,
        zh,
    };
    return {
        ...LOCALES['en'],
        ...(app.lang !== 'en' && Object.keys(LOCALES).includes(app.lang)
            ? { ...LOCALES[app.lang] }
            : {}),
        ...app.options.getValue('locales')[app.lang],
    };
}
