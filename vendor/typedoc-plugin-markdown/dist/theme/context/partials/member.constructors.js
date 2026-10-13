import { heading } from '../../../libs/markdown/index.js';
import { ReflectionKind } from 'typedoc';
export function constructor(model, options) {
    const md = [];
    model.signatures?.forEach((signature) => {
        md.push(heading(options.headingLevel, ReflectionKind.singularString(ReflectionKind.Constructor)));
        md.push(this.partials.signature(signature, {
            headingLevel: options.headingLevel + 1,
        }));
    });
    return md.join('\n\n');
}
