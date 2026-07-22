import { backTicks, heading, italic } from '../../../libs/markdown/index.js';
export function typeParametersList(model, options) {
    const md = [];
    model?.forEach((typeParameter) => {
        const typeParamOut = [];
        typeParamOut.push(heading(options.headingLevel + 1, typeParameter.name));
        const nameDescription = [backTicks(typeParameter.name)];
        if (typeParameter.type) {
            nameDescription.push(`${italic('extends')} ${this.partials.someType(typeParameter.type)}`);
        }
        if (typeParameter.default) {
            nameDescription.push(`= ${this.partials.someType(typeParameter.default, { forceCollapse: true })}`);
        }
        typeParamOut.push(nameDescription.join(' '));
        if (typeParameter.comment) {
            typeParamOut.push(this.partials.comment(typeParameter.comment));
        }
        md.push(typeParamOut.join('\n\n'));
    });
    return md.join('\n\n');
}
