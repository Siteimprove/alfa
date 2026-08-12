import { escapeChars } from '../../../libs/utils/index.js';
export function inferredType(model) {
    return `infer ${escapeChars(model.name)}`;
}
