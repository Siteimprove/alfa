import { MarkdownThemeContext } from '../../../theme/index.js';
import { DeclarationReflection } from 'typedoc';
export declare function memberContainer(this: MarkdownThemeContext, model: DeclarationReflection, options: {
    headingLevel: number;
    nested?: boolean;
    groupTitle?: string;
}): string;
