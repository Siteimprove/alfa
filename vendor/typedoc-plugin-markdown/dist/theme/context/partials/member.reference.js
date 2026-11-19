import { link } from '../../../libs/markdown/index.js';
import { i18n, ReflectionKind } from 'typedoc';
export function referenceMember(model) {
    let referenced = model.tryGetTargetReflectionDeep();
    const reExportsText = i18n.theme_re_exports();
    const renamesAndReExportsText = i18n.theme_renames_and_re_exports();
    if (!referenced) {
        return `${reExportsText} ${model.name}`;
    }
    if (referenced?.kind === ReflectionKind.TypeLiteral && referenced.parent) {
        referenced = referenced?.parent;
    }
    if (!this.router.hasUrl(referenced)) {
        return `${reExportsText} ${referenced.name}`;
    }
    if (model.name === referenced.name) {
        return `${reExportsText} ${link(referenced.name, this.urlTo(referenced))}`;
    }
    return `${renamesAndReExportsText} ${link(referenced.name, this.urlTo(referenced))}`;
}
