import { backTicks } from '../../../libs/markdown/index.js';
export function intrinsicType(model) {
    return backTicks(model.name);
}
