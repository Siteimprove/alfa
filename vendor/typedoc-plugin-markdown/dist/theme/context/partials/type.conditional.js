import { italic } from '../../../libs/markdown/index.js';
export function conditionalType(model) {
    const md = [];
    if (model.checkType) {
        md.push(this.partials.someType(model.checkType));
    }
    md.push(italic('extends'));
    if (model.extendsType) {
        md.push(this.partials.someType(model.extendsType));
    }
    md.push('?');
    if (model.trueType) {
        md.push(this.partials.someType(model.trueType));
    }
    md.push(':');
    if (model.falseType) {
        md.push(this.partials.someType(model.falseType));
    }
    return md.join(' ');
}
