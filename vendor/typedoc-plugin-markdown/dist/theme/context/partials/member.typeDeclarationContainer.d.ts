import { MarkdownThemeContext } from '../../../theme/index.js';
import { DeclarationReflection } from 'typedoc';
export declare function typeDeclarationContainer(this: MarkdownThemeContext, model: DeclarationReflection, typeDeclaration: DeclarationReflection, opts: {
    headingLevel: number;
    nested?: boolean;
}): string;
