import { escapeChars } from '../../../libs/utils/index.js';
export function unknownType(model) {
    return escapeChars(model.name);
}
