import { backTicks } from '../../../libs/markdown/index.js';
export function signatureParameters(model, options) {
    const format = this.options.getValue('useCodeBlocks');
    return ('(' +
        model
            .map((param) => {
            const paramsmd = [];
            const paramType = this.partials.someType(param.type);
            const showParamType = (options?.forceExpandParameters ?? false) ||
                this.options.getValue('expandParameters');
            const optional = param.flags.isOptional || param.defaultValue ? '?' : '';
            const rest = param.flags?.isRest ? '...' : '';
            const paramItem = [`${rest}${backTicks(`${param.name}${optional}`)}`];
            if (showParamType) {
                paramItem.push(paramType);
            }
            paramsmd.push(`${format && model.length > 2 ? `\n   ` : ''}${paramItem.join(': ')}`);
            return paramsmd.join('');
        })
            .join(`, `) +
        (format && model.length > 2 ? `\n)` : ')'));
}
