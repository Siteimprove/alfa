import { MarkdownThemeContext } from '../../../theme/index.js';
import { DeclarationReflection } from 'typedoc';
/**
 * Renders a top-level member that contains group and child members such as Classes, Interfaces and Enums.
 */
export declare function memberWithGroups(this: MarkdownThemeContext, model: DeclarationReflection, options: {
    headingLevel: number;
}): string;
