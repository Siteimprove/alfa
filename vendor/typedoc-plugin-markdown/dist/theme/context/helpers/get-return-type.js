import { codeBlock } from '../../../libs/markdown/index.js';
import { ReflectionType } from 'typedoc';
export function getReturnType(model) {
    if (model) {
        const returnType = this.partials.someType(model);
        if (this.options.getValue('useCodeBlocks') &&
            this.options.getValue('expandObjects') &&
            model instanceof ReflectionType) {
            return codeBlock(returnType);
        }
        return returnType;
    }
    return '';
}
