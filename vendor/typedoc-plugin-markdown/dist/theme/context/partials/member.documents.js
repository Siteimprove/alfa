import { heading } from '../../../libs/markdown/index.js';
import { DocumentReflection, } from 'typedoc';
export function documents(model, options) {
    const md = [];
    const docGroups = model.groups?.filter((group) => group.owningReflection instanceof DocumentReflection);
    if (docGroups?.length) {
        docGroups.forEach((reflectionGroup) => {
            md.push(heading(options.headingLevel, reflectionGroup.title));
            docGroups.forEach((reflectionGroup) => {
                md.push(this.partials.groupIndex(reflectionGroup));
            });
        });
    }
    return md.join('\n\n');
}
