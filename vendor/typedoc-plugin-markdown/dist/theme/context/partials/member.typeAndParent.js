import { backTicks, codeBlock, link } from '../../../libs/markdown/index.js';
import { removeLineBreaks } from '../../../libs/utils/index.js';
import { ArrayType, ReferenceType, SignatureReflection } from 'typedoc';
export function typeAndParent(model) {
    if (!model) {
        return backTicks('void');
    }
    if (model instanceof ArrayType) {
        return `${this.partials.typeAndParent(model.elementType)}[]`;
    }
    if (model instanceof ReferenceType && model.reflection) {
        const reflection = model.reflection instanceof SignatureReflection
            ? model.reflection.parent
            : model.reflection;
        const parent = reflection?.parent;
        if (parent) {
            const resultWithParent = [];
            if (this.router.hasUrl(parent)) {
                resultWithParent.push(link(backTicks(parent.name), this.urlTo(parent)));
            }
            else {
                resultWithParent.push(backTicks(parent?.name));
            }
            if (this.router.hasUrl(reflection)) {
                resultWithParent.push(link(backTicks(reflection.name), this.urlTo(reflection)));
            }
            else {
                resultWithParent.push(backTicks(reflection?.name));
            }
            return resultWithParent.join('.');
        }
    }
    if (this.options.getValue('useCodeBlocks')) {
        return codeBlock(model.toString());
    }
    return backTicks(removeLineBreaks(model.toString()));
}
