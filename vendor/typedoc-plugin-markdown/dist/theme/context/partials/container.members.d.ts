import { MarkdownThemeContext } from '../../../theme/index.js';
import { DeclarationReflection } from 'typedoc';
export declare function members(this: MarkdownThemeContext, model: DeclarationReflection[], options: {
    headingLevel: number;
    groupTitle?: string;
}): string;
