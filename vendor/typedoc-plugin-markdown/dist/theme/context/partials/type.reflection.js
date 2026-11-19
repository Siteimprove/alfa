import { backTicks } from '../../../libs/markdown/index.js';
export function reflectionType(model, options) {
    const expandObjects = options?.forceCollapse || this.options.getValue('expandObjects');
    if (model.declaration?.signatures?.length === 1 &&
        !model.declaration.children) {
        return this.partials.functionType(model.declaration.signatures);
    }
    if (expandObjects || model.declaration.signatures?.length) {
        return this.partials.declarationType(model.declaration, options);
    }
    return backTicks('object');
}
