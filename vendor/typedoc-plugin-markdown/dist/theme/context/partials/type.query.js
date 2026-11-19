import { italic } from '../../../libs/markdown/index.js';
export function queryType(model) {
    return `${italic('typeof')} ${this.partials.someType(model.queryType)}`;
}
