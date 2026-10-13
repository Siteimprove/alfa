import { heading } from '../../../libs/markdown/index.js';
import { i18n, UnionType, } from 'typedoc';
export function signatureReturns(model, options) {
    const md = [];
    const returnsTag = model.comment?.getTag('@returns');
    const returnsComment = returnsTag
        ? this.helpers.getCommentParts(returnsTag.content)
        : undefined;
    const typeDeclaration = model.type
        ?.declaration;
    const hasDeclarationSignatures = Boolean(typeDeclaration?.signatures?.length);
    const hasUsefulTypeDetails = model.type
        ? this.helpers.hasUsefulTypeDetails(model.type)
        : false;
    md.push(heading(options.headingLevel, i18n.theme_returns()));
    if (!hasDeclarationSignatures) {
        if (hasUsefulTypeDetails && model.type instanceof UnionType) {
            if (returnsComment) {
                md.push(returnsComment);
            }
            md.push(this.partials.typeDeclarationUnionContainer(model, options));
        }
        else if (!hasUsefulTypeDetails) {
            md.push(this.helpers.getReturnType(model.type));
            if (returnsComment) {
                md.push(returnsComment);
            }
        }
        else if (returnsComment) {
            md.push(returnsComment);
        }
    }
    else if (returnsComment) {
        md.push(returnsComment);
    }
    if (typeDeclaration?.signatures) {
        if (hasUsefulTypeDetails) {
            typeDeclaration.signatures.forEach((signature) => {
                md.push(this.partials.signature(signature, {
                    headingLevel: options.headingLevel + 1,
                    nested: true,
                }));
            });
        }
        else {
            md.push(this.partials.someType(model.type));
        }
    }
    if (typeDeclaration?.children) {
        md.push(this.partials.typeDeclaration(typeDeclaration, {
            headingLevel: options.headingLevel,
        }));
    }
    return md.join('\n\n');
}
