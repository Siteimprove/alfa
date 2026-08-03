import { bold, codeBlock } from '../../../libs/markdown/index.js';
import { escapeChars } from '../../../libs/utils/index.js';
import { ReflectionKind } from 'typedoc';
export function signatureTitle(model, options) {
    const md = [];
    const useCodeBlocks = this.options.getValue('useCodeBlocks');
    const keyword = this.helpers.getKeyword(model.parent.kind);
    if (useCodeBlocks && this.helpers.isGroupKind(model.parent) && keyword) {
        md.push(keyword + ' ');
    }
    if (options?.accessor) {
        md.push(bold(options?.accessor) + ' ');
    }
    if (model.parent) {
        const flagsString = this.helpers.getReflectionFlags(model.parent?.flags);
        if (flagsString.length) {
            md.push(this.helpers.getReflectionFlags(model.parent.flags) + ' ');
        }
    }
    if (!['__call', '__type'].includes(model.name)) {
        const name = [];
        if (model.kind === ReflectionKind.ConstructorSignature) {
            name.push('new');
        }
        name.push(escapeChars(model.name));
        md.push(bold(name.join(' ')));
    }
    if (model.typeParameters) {
        md.push(`${this.helpers.getAngleBracket('<')}${this.helpers.getTypeParameters(model.typeParameters)}${this.helpers.getAngleBracket('>')}`);
    }
    md.push(this.partials.signatureParameters(model.parameters || []));
    if (model.type) {
        md.push(`: ${this.partials.someType(model.type)}`);
    }
    if (useCodeBlocks) {
        md.push(';');
    }
    const result = md.join('');
    return useCodeBlocks ? codeBlock(result) : `> ${result}`;
}
