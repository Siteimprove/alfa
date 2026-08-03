import { MarkdownThemeContext } from '../../../theme/index.js';
import { DeclarationReflection } from 'typedoc';
export declare function typeDeclaration(this: MarkdownThemeContext, model: DeclarationReflection, options: {
    headingLevel: number;
    allowSource?: boolean;
}): string;
