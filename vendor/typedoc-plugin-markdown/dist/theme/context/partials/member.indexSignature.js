import { backTicks, codeBlock } from '../../../libs/markdown/index.js';
export function indexSignature(model, options) {
    const useCodeBlocks = this.options.getValue('useCodeBlocks');
    const md = [];
    const params = model.parameters
        ? model.parameters.map((parameter) => {
            return parameter.type
                ? `${useCodeBlocks ? parameter.name : backTicks(parameter.name)}: ${this.partials.someType(parameter.type)}`
                : '';
        })
        : [];
    if (model.type) {
        if (this.options.getValue('useCodeBlocks')) {
            md.push(codeBlock(`[${params.join('')}]: ${this.partials.someType(model.type)}`));
        }
        else {
            md.push(`\\[${params.join('')}\\]: ${this.partials.someType(model.type)}`);
        }
    }
    if (model.comment) {
        md.push(this.partials.comment(model.comment, {
            headingLevel: options?.headingLevel,
        }));
    }
    return md.join('\n');
}
