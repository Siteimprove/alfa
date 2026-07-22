import { backTicks } from '../../../libs/markdown/index.js';
export function getHierarchyType(model, options) {
    return options?.isTarget
        ? backTicks(model.toString())
        : this.partials.someType(model);
}
