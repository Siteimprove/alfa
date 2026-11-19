import { MarkdownThemeContext } from '../../../theme/index.js';
import { DeclarationReflection } from 'typedoc';
export declare function declarationType(this: MarkdownThemeContext, model: DeclarationReflection, options?: {
    forceCollapse?: boolean;
}): string;
