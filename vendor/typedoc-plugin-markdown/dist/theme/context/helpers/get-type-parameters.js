import { backTicks, italic } from '../../../libs/markdown/index.js';
export function getTypeParameters(typeParameters, options) {
    if (!typeParameters?.length)
        return undefined;
    const includeBackticks = options?.includeBackticks ?? true;
    return typeParameters
        .map((typeParameter) => {
        const nameDescription = [
            includeBackticks ? backTicks(typeParameter.name) : typeParameter.name,
        ];
        if (this.options.getValue('expandParameters')) {
            if (typeParameter.type) {
                nameDescription.push(`${italic('extends')} ${this.partials.someType(typeParameter.type)}`);
            }
            if (typeParameter.default) {
                nameDescription.push(`= ${this.partials.someType(typeParameter.default, { forceCollapse: true })}`);
            }
        }
        return nameDescription.join(' ');
    })
        .join(', ');
}
