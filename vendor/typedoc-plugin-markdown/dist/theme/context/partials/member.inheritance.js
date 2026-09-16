import { heading } from '../../../libs/markdown/index.js';
import { i18n } from 'typedoc';
export function inheritance(model, options) {
    const md = [];
    if (model.implementationOf) {
        if (options.headingLevel !== -1) {
            md.push(heading(options.headingLevel, i18n.theme_implementation_of()));
        }
        md.push(this.partials.typeAndParent(model.implementationOf));
    }
    if (model.inheritedFrom) {
        if (options.headingLevel !== -1) {
            md.push(heading(options.headingLevel, i18n.theme_inherited_from()));
        }
        md.push(this.partials.typeAndParent(model.inheritedFrom));
    }
    if (model.overwrites) {
        const overridesLabel = i18n.theme_overrides();
        if (options.headingLevel !== -1) {
            md.push(heading(options.headingLevel, overridesLabel));
        }
        md.push(this.partials.typeAndParent(model.overwrites));
    }
    return md.join('\n\n');
}
